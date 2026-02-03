import { assert } from 'std/assert/assert.ts'
import { patient_evaluations } from './patient_evaluations.ts'
import { EXPRESSION_BUILDERS } from './s_expression.ts'
import { AgeDetermination, TrxOrDb } from '../../types.ts'
import { jsonObjectFrom, literalString, success_true } from '../helpers.ts'
import {
  DEFINITE,
  EQUIVOCAL,
  EVIDENCE_OF_CONTEXTUAL_QUALIFIER,
  IMPROBABLE_DIAGNOSIS_CONTEXTUAL_QUALIFIER,
  POSSIBLE_DIAGNOSIS_CONTEXTUAL_QUALIFIER,
  PROBABLE_DIAGNOSIS_CONTEXTUAL_QUALIFIER,
  RELATIONSHIP,
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
import { ruleRunner } from './system_rules.ts'

export const SYSTEM_DIAGNOSIS_RULES_PARSED = SYSTEM_DIAGNOSIS_RULES.map((d) => parseWithSchema(d, system_diagnosis_rule))

const findMatchingRecords = ruleRunner(
  SYSTEM_DIAGNOSIS_RULES_PARSED,
  async (trx, patient_identifiers, rules_of_age) => {
    const concepts_to_consider = new Map<string, Lang['snomed_concept']>()
    for (const rule of rules_of_age) {
      const diagnosis_concept_s_expression = inverseSExpression(rule.diagnosis)
      if (!concepts_to_consider.has(diagnosis_concept_s_expression)) {
        concepts_to_consider.set(diagnosis_concept_s_expression, rule.diagnosis.snomed_concept)
      }
    }

    const already_present_diagnoses = await trx.with('all_diagnoses', (qb) => {
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
      .execute()

    // If we've already made diagnoses of equal or higher certainty, there's no need to reevaluate certain rules
    return rules_of_age.filter((rule) => {
      const diagnosis_concept_s_expression = inverseSExpression(rule.diagnosis)
      const present_diagnosis = already_present_diagnoses.find(matching({ diagnosis_concept_s_expression }))
      if (!present_diagnosis) return true
      const { matching_diagnosis } = present_diagnosis
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
      if (certainty === 'definite') return false
      if (certainty === 'probable') return false
      if (certainty === 'improbable') return false
      if (certainty === 'equivocal') {
        return ['probable', 'improbable'].includes(rule.diagnosis.certainty_qualifier)
      }
      if (certainty === 'possible') {
        return rule.diagnosis.certainty_qualifier !== 'possible'
      }
    })
  },
)

export const system_diagnosis_rules = {
  async insertSystemDiagnosesIfNotAlreadyIdentified(
    trx: TrxOrDb,
    { patient_id, patient_encounter_id, patient_age_determination, /*procedure_id, */ records }: {
      patient_id: string
      patient_encounter_id: string
      // procedure_id: string
      patient_age_determination: AgeDetermination | null
      records: {
        id: string
        existence: 'Yes' | 'No' | 'Unknown'
      }[]
    },
  ) {
    if (!patient_age_determination) return
    const make_new_diagnosis = await findMatchingRecords(trx, { patient_id, patient_encounter_id, patient_age_determination, /*procedure_id, */ records })

    for (const { rule, contributing_records } of make_new_diagnosis.matching_rules) {
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
          qb.insertInto('patient_records').values(relations.map(({ id }) => ({
            id,
            patient_id,
            patient_encounter_id,
            root_snomed_concept_id: RELATIONSHIP.id,
            specific_snomed_concept_id: EVIDENCE_OF_CONTEXTUAL_QUALIFIER.id,
          }))),
      ).with(
        'inserting_relations',
        (qb) => qb.insertInto('patient_record_relations').values(relations),
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
    }
  },
}
