import { assert } from 'std/assert/assert.ts'
import { patient_evaluations } from './patient_evaluations.ts'
import { EXPRESSION_BUILDERS } from './s_expression.ts'
import { TrxOrDb } from '../../types.ts'
import { blankSelection, jsonObjectFrom, literalString, success_true } from '../helpers.ts'
import {
  DEFINITE,
  DONE,
  EQUIVOCAL,
  EVIDENCE_OF_CONTEXTUAL_QUALIFIER,
  IMPROBABLE_DIAGNOSIS_CONTEXTUAL_QUALIFIER,
  POSSIBLE_DIAGNOSIS_CONTEXTUAL_QUALIFIER,
  PROBABLE_DIAGNOSIS_CONTEXTUAL_QUALIFIER,
  RELATIONSHIP,
  TO_BE_DONE,
} from '../../shared/snomed_concepts.ts'
import { inverseSExpression } from '../../shared/s_expression_inverse.ts'
import { parseWithSchema } from '../../shared/s_expression.ts'
import { Lang, system_diagnosis_rule } from '../../shared/s_expression_schemas.ts'
import { SYSTEM_DIAGNOSIS_RULES } from '../../s_expression/system_diagnosis_rules.ts'
import generateUUID from '../../util/uuid.ts'
import isObjectLike from '../../util/isObjectLike.ts'
import matching from '../../util/matching.ts'
import isKeyOf from '../../util/isKeyOf.ts'
import { events } from './events.ts'
import { diagnosisToEvaluation } from '../../shared/diagnosis.ts'
import { ruleRunner, RuleRunnerInput } from './system_rules.ts'
import compactMap from '../../util/compactMap.ts'
import findMatching from '../../util/findMatching.ts'
import { deepMerge } from '../../util/deepMerge.ts'

export const SYSTEM_DIAGNOSIS_RULES_PARSED = SYSTEM_DIAGNOSIS_RULES.map((d) => parseWithSchema(d, system_diagnosis_rule))

type ExistingDiagnosis = {
  diagnosis_concept_s_expression: string
  matching_diagnosis_id: string
  certainty: 'definite' | 'probable' | 'equivocal' | 'possible' | 'improbable'
}

// A hacky way of passing the diagnoses through to be used again.
// TODO refactor this
const ALREADY_PRESENT_DIAGNOSES = new WeakMap<
  {
    patient_id: string
    patient_encounter_id: string
  },
  ExistingDiagnosis[]
>()

const findMatchingRecords = ruleRunner(
  SYSTEM_DIAGNOSIS_RULES_PARSED,
  async (trx, patient_identifiers, rules_of_age) => {
    const concepts_to_consider = new Map<string, Lang['snomed_concept']>()
    for (const rule of rules_of_age) {
      const diagnosis_concept_s_expression = inverseSExpression(rule.diagnosis.snomed_concept)
      if (!concepts_to_consider.has(diagnosis_concept_s_expression)) {
        concepts_to_consider.set(diagnosis_concept_s_expression, rule.diagnosis.snomed_concept)
      }
    }

    const already_present_diagnoses_query = trx.with('all_diagnoses', (qb) => {
      const [first_diagnosis_rule, ...other_diagnosis_rules] = concepts_to_consider.entries().map(
        ([diagnosis_concept_s_expression, snomed_concept]) =>
          qb.selectNoFrom([
            literalString(diagnosis_concept_s_expression).as('diagnosis_concept_s_expression'),
            jsonObjectFrom(
              EXPRESSION_BUILDERS.evaluation(
                trx,
                patient_identifiers,
                diagnosisToEvaluation({ snomed_concept }),
              ).select([
                'patient_records_aggregated.value',
              ])
                .orderBy('patient_records_aggregated.created_at', 'desc')
                .limit(1),
            )
              .as('matching_diagnosis'),
          ]),
      )

      return other_diagnosis_rules.reduce(
        (acc, curr) => acc.unionAll(curr),
        first_diagnosis_rule,
      )
    })
      .selectFrom('all_diagnoses')
      .selectAll()
      .where('matching_diagnosis', 'is not', null)

    const already_present_diagnoses = await already_present_diagnoses_query.execute()

    const existing_diagnoses: ExistingDiagnosis[] = already_present_diagnoses.map(({ diagnosis_concept_s_expression, matching_diagnosis }) => {
      assert(matching_diagnosis)
      assert(isObjectLike(matching_diagnosis.value))

      const concept_to_certainty_qualifier_map = {
        [DEFINITE.name]: 'definite' as const,
        [PROBABLE_DIAGNOSIS_CONTEXTUAL_QUALIFIER.name]: 'probable' as const,
        [EQUIVOCAL.name]: 'equivocal' as const,
        [POSSIBLE_DIAGNOSIS_CONTEXTUAL_QUALIFIER.name]: 'possible' as const,
        [IMPROBABLE_DIAGNOSIS_CONTEXTUAL_QUALIFIER.name]: 'improbable' as const,
      } as const

      assert(isKeyOf(matching_diagnosis.value.name, concept_to_certainty_qualifier_map))
      const certainty = concept_to_certainty_qualifier_map[matching_diagnosis.value.name]

      return { diagnosis_concept_s_expression, certainty, matching_diagnosis_id: matching_diagnosis.id }
    })

    ALREADY_PRESENT_DIAGNOSES.set(patient_identifiers, existing_diagnoses)

    // If we've already made diagnoses of equal or higher certainty, there's no need to reevaluate certain rules
    return rules_of_age.filter((rule) => {
      const diagnosis_concept_s_expression = inverseSExpression(rule.diagnosis.snomed_concept)
      const present_diagnosis = existing_diagnoses.find(matching({ diagnosis_concept_s_expression }))
      if (!present_diagnosis) return true
      switch (present_diagnosis.certainty) {
        case 'definite':
        case 'probable':
        case 'improbable':
          return false
        case 'equivocal':
          return ['probable', 'improbable'].includes(rule.diagnosis.certainty_qualifier)
        case 'possible':
          return rule.diagnosis.certainty_qualifier !== 'possible'
      }
    })
  },
)

export const system_diagnosis_rules = {
  async insertSystemDiagnosesIfNotAlreadyIdentified(
    trx: TrxOrDb,
    input: RuleRunnerInput & {
      procedure_id: string
    },
  ) {
    const { patient_id, patient_encounter_id, procedure_id, patient_age_determination } = input
    if (!patient_age_determination) return 'Skipped: patient age determination is unknown'
    const make_new_diagnosis = await findMatchingRecords(trx, input)

    const existing_diagnoses = ALREADY_PRESENT_DIAGNOSES.get(input) || []

    // Check for probable rules that didn't match but have a possible existing diagnosis with completed tasks
    // If so, mark them as improbable
    const probable_rules_with_possible_diagnosis = compactMap(make_new_diagnosis.other_rules_evaluated, (rule) => {
      if (rule.diagnosis.certainty_qualifier !== 'probable') return
      const diagnosis_concept_s_expression = inverseSExpression(rule.diagnosis.snomed_concept)
      const existing_diagnosis = existing_diagnoses.find(matching({ diagnosis_concept_s_expression }))
      if (!existing_diagnosis) return
      if (existing_diagnosis.certainty !== 'possible') return
      return { rule, ...existing_diagnosis }
    })

    const possible_diagnosis_ids = probable_rules_with_possible_diagnosis.map(({ matching_diagnosis_id }) => matching_diagnosis_id)

    const possible_diagnoses_now_completed = possible_diagnosis_ids.length
      ? await trx
        .selectFrom('patient_record_relations as done_relations')
        .innerJoin('patient_records_aggregated as done_records', 'done_relations.id', 'done_records.id')
        .innerJoin('patient_records_aggregated as task_records', 'done_relations.destination_id', 'task_records.id')
        .innerJoin('patient_record_relations as due_to_relations', 'due_to_relations.source_id', 'task_records.id')
        .innerJoin('patient_records_aggregated as due_to_records', 'due_to_records.id', 'due_to_relations.id')
        .where('task_records.specific_snomed_concept_id', '=', TO_BE_DONE.id)
        .where('due_to_relations.destination_id', 'in', possible_diagnosis_ids)
        .where('done_relations.source_id', '=', procedure_id)
        .where('done_records.specific_snomed_concept_id', '=', DONE.id)
        .select('due_to_relations.destination_id as matching_diagnosis_id')
        .execute()
      : []

    const improbable_diagnoses_to_insert = possible_diagnoses_now_completed.map(({ matching_diagnosis_id }) => {
      const { rule } = findMatching(probable_rules_with_possible_diagnosis, { matching_diagnosis_id })

      return {
        rule: deepMerge(rule, {
          diagnosis: {
            certainty_qualifier: 'improbable',
          },
        }),
        contributing_records: compactMap(input.records, (record) =>
          record.existence === 'No' && {
            record_id: record.id,
          }),
      }
    })

    const to_insert = [
      ...make_new_diagnosis.matching_rules,
      ...improbable_diagnoses_to_insert,
    ]

    if (!to_insert.length) {
      return `${make_new_diagnosis.message}`
    }

    const inserted_diagnoses: string[] = []
    for (const { rule, contributing_records } of to_insert) {
      const evaluation_id = generateUUID()
      const relations = contributing_records.map((record) => ({
        id: generateUUID(),
        source_id: evaluation_id,
        destination_id: record.record_id,
      }))

      await patient_evaluations.insertOneNestedQuery(trx, {
        evaluation_id,
        patient_id,
        patient_encounter_id,
        evaluation: diagnosisToEvaluation(rule.diagnosis),
        by_system: true,
      }).with(
        'inserting_relation_patient_records',
        (qb) =>
          relations.length
            ? qb.insertInto('patient_records').values(relations.map(({ id }) => ({
              id,
              patient_id,
              patient_encounter_id,
              root_snomed_concept_id: RELATIONSHIP.id,
              specific_snomed_concept_id: EVIDENCE_OF_CONTEXTUAL_QUALIFIER.id,
            })))
            : blankSelection(qb),
      ).with(
        'inserting_relations',
        (qb) => relations.length ? qb.insertInto('patient_record_relations').values(relations) : blankSelection(qb),
      ).selectNoFrom([
        success_true,
      ]).executeTakeFirstOrThrow()

      await events.insert(
        trx,
        {
          type: 'SystemDiagnosisCreated',
          data: {
            patient_id,
            patient_encounter_id,
            patient_age_determination,
            evaluation_id,
          },
        },
      )

      inserted_diagnoses.push(`${rule.diagnosis.certainty_qualifier} ${rule.diagnosis.snomed_concept.name}`)
    }

    return inserted_diagnoses.length
      ? `Inserted ${inserted_diagnoses.length} diagnosis(es): ${inserted_diagnoses.join(', ')}`
      : 'No new system diagnoses to insert'
  },
}
