import { assert } from 'std/assert/assert.ts'
import { patient_evaluations } from './patient_evaluations.ts'
import { EXPRESSION_BUILDERS } from './s_expression.ts'
import { ApplicableRule, ApplicableRuleEffectSystemSystemDiagnosisRule, RuleRunnerInput, TrxOrDb } from '../../types.ts'
import { blankSelection, success_true } from '../helpers.ts'
import { EVIDENCE_OF_CONTEXTUAL_QUALIFIER, RELATIONSHIP } from '../../shared/snomed_concepts.ts'

import { Lang } from '../../shared/s_expression_schemas.ts'

import generateUUID from '../../util/uuid.ts'
import isObjectLike from '../../util/isObjectLike.ts'
import isKeyOf from '../../util/isKeyOf.ts'
import { events } from './events.ts'
import { CERTAINTY_QUALIFIER_TO_CONCEPT, diagnosisToEvaluation } from '../../shared/diagnosis.ts'
import { rules } from './rules.ts'
import isString from '../../util/isString.ts'
import { JsonValue, SnomedCategory } from '../../db.d.ts'
import { exists } from '../../util/exists.ts'
import { pMap } from '../../util/inParallel.ts'
import compact from '../../util/compact.ts'
import uniq from '../../util/uniq.ts'
import { groupBy } from '../../util/groupBy.ts'

import { getTaskById } from '../../shared/tasks.ts'
import { isCheckFor } from './additional_tasks.ts'
import { s_expression_evidence } from './s_expression_evidence.ts'

const concept_to_certainty_qualifier_map = Object.fromEntries(
  Object.entries(CERTAINTY_QUALIFIER_TO_CONCEPT).map(([certainty, concept]) => [concept.name, certainty]),
) as Record<string, keyof typeof CERTAINTY_QUALIFIER_TO_CONCEPT>

const CERTAINTY_ORDER: Record<ApplicableRuleEffectSystemSystemDiagnosisRule['certainty'], number> = {
  definite: 4,
  probable: 3,
  equivocal: 2,
  possible: 1,
  improbable: 0,
}

type PresentDiagnosis = {
  id: string
  certainty: 'definite' | 'probable' | 'equivocal' | 'possible' | 'improbable'
}

type InsertDiagnosisResult = {
  certainty: 'definite' | 'probable' | 'equivocal' | 'possible' | 'improbable'
  record_id: string
  specific_snomed_concept: { name: string; category: SnomedCategory }
  result: 'already_present' | 'inserted'
}

function presentDiagnosis(
  present_diagnosis: {
    id: string
    value: JsonValue
  } | undefined,
) {
  if (!present_diagnosis) return
  assert(isObjectLike(present_diagnosis.value))
  assert(isKeyOf(present_diagnosis.value.name, concept_to_certainty_qualifier_map))
  const certainty = concept_to_certainty_qualifier_map[present_diagnosis.value.name]
  return { id: present_diagnosis.id, certainty }
}

function shouldInsertNewDiagnosisAsPresentDiagnosisIsNonExistentOrLowerCertainty(
  present_diagnosis: PresentDiagnosis | undefined,
  rule_effect: ApplicableRuleEffectSystemSystemDiagnosisRule,
) {
  if (!present_diagnosis) return true
  switch (present_diagnosis.certainty) {
    case 'definite':
      return false
    case 'probable':
      return rule_effect.certainty === 'definite'
    // While possible is a "higher" certainty
    // improbable is the result of our having ruled out the possible diagnosis
    // so we DO NOT insert one anew
    case 'improbable':
      return ['probable', 'definite'].includes(rule_effect.certainty)
    case 'equivocal':
      return ['probable', 'improbable', 'definite'].includes(rule_effect.certainty)
    case 'possible':
      return rule_effect.certainty !== 'possible'
  }
}

type InsertedDiagnosis = {
  record_id: string
  specific_snomed_concept_id: string
  value_snomed_concept_id: string
}

export const system_diagnosis_rules = {
  async insertOne(
    trx: TrxOrDb,
    {
      patient_id,
      patient_encounter_id,
      patient_age_determination,
      matching_finding_ids,
      diagnosis_node,
    }: Pick<RuleRunnerInput, 'patient_id' | 'patient_encounter_id' | 'patient_age_determination'> & {
      matching_finding_ids: string[]
      diagnosis_node: ReturnType<typeof diagnosisToEvaluation>
    },
  ): Promise<InsertedDiagnosis> {
    assert(diagnosis_node.value_snomed_concept)
    const evaluation_id = generateUUID()
    const relations = matching_finding_ids.map((record_id) => ({
      id: generateUUID(),
      source_id: evaluation_id,
      destination_id: record_id,
    }))

    const inserted = await patient_evaluations.insertOneNestedQuery(trx, {
      evaluation_id,
      patient_id,
      patient_encounter_id,
      evaluation: diagnosis_node,
      by_system: true,
      patient_age_determination,
    })
      .with(
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
      )
      .selectFrom('inserting_records')
      .select((eb) => [
        success_true,
        'inserting_records.id as record_id',
        'inserting_records.specific_snomed_concept_id',
        eb.ref('inserting_records.value_snomed_concept_id').$notNull().as('value_snomed_concept_id'),
      ]).executeTakeFirstOrThrow()

    await events.insert(
      trx,
      {
        type: 'EvaluationAdded',
        data: {
          patient_id,
          patient_encounter_id,
          patient_age_determination: exists(patient_age_determination),
          record_id: evaluation_id,
        },
      },
    )

    assert(inserted.value_snomed_concept_id)
    return inserted
  },
  insertPositiveDiagnoses(
    trx: TrxOrDb,
    input: RuleRunnerInput & {
      procedure_id?: string
    },
    rules_result: string | ApplicableRule[],
  ): Promise<InsertDiagnosisResult[]> {
    if (isString(rules_result)) return Promise.resolve([])

    const diagnosis_rules = rules_result.filter((r): r is ApplicableRule & { rule_effect: ApplicableRuleEffectSystemSystemDiagnosisRule } =>
      r.rule_effect.type === 'system_diagnosis_rule'
    )
    const rules_grouped = groupBy(diagnosis_rules, (rule) => rule.rule_effect.snomed_concept.id)
    return pMap([...rules_grouped.values()], async (rules_for_concept) => {
      const highest_certainty_rule = rules_for_concept.reduce((best, rule) =>
        CERTAINTY_ORDER[rule.rule_effect.certainty] > CERTAINTY_ORDER[best.rule_effect.certainty] ? rule : best
      )
      const matching_finding_ids = uniq(rules_for_concept.flatMap((r) => r.matching_finding_ids))
      const diagnosis_node = diagnosisToEvaluation({
        snomed_concept: {
          atom: 'snomed_concept',
          ...highest_certainty_rule.rule_effect.snomed_concept,
        },
        certainty_qualifier: highest_certainty_rule.rule_effect.certainty,
      })

      const already_present_diagnosis = await EXPRESSION_BUILDERS.evaluation(
        trx,
        input,
        diagnosis_node,
      ).select([
        'patient_records_aggregated.value',
      ])
        .orderBy('patient_records_aggregated.created_at', 'desc')
        .limit(1)
        .executeTakeFirst()
        .then(presentDiagnosis)

      const do_insert = shouldInsertNewDiagnosisAsPresentDiagnosisIsNonExistentOrLowerCertainty(already_present_diagnosis, highest_certainty_rule.rule_effect)

      if (!do_insert) {
        assert(already_present_diagnosis)
        return {
          certainty: already_present_diagnosis.certainty,
          record_id: already_present_diagnosis.id,
          specific_snomed_concept: exists(diagnosis_node.specific_snomed_concept),
          result: 'already_present' as const,
        }
      }

      const inserted_diagnosis = await system_diagnosis_rules.insertOne(trx, {
        ...input,
        diagnosis_node,
        matching_finding_ids,
      })

      return {
        certainty: highest_certainty_rule.rule_effect.certainty,
        record_id: inserted_diagnosis.record_id,
        specific_snomed_concept: exists(diagnosis_node.specific_snomed_concept),
        result: 'inserted' as const,
      }
    }).then(compact)
  },
  /*
    Rules a possible diagnosis out once the health worker has answered the check_for task it
    prompted. The task is named on the FindingsAdded of the submission that answered it, as
    when none of the remaining findings apply from the warning signs page. Nothing is ruled
    out while the latest diagnosis of the concept is anything but possible: a probable or
    definite diagnosis, whether inserted by this run's rules or by an earlier submission,
    stands, and an improbable one means the task was already answered.
  */
  async insertImprobable(
    trx: TrxOrDb,
    input: RuleRunnerInput,
    positive_diagnoses: InsertDiagnosisResult[],
  ): Promise<string> {
    const { task_description_completed } = input
    if (!task_description_completed) return 'No task completed'

    const task = getTaskById(task_description_completed)
    const { due_to } = task
    if (!(due_to.atom === 'diagnosis' && due_to.certainty_qualifier === 'possible')) {
      return `Task "${task_description_completed}" is not due to a possible diagnosis`
    }
    assert(isCheckFor(task.to_be_done), `Task "${task_description_completed}" due to a possible diagnosis is not a check_for task`)

    const { snomed_concept } = due_to

    const settled_by_this_submission = positive_diagnoses.find((diagnosis) =>
      diagnosis.specific_snomed_concept.name === snomed_concept.name &&
      CERTAINTY_ORDER[diagnosis.certainty] > CERTAINTY_ORDER.possible
    )
    if (settled_by_this_submission) {
      return `${snomed_concept.name} is ${settled_by_this_submission.certainty}, so not ruled out by task "${task_description_completed}"`
    }

    const latest_diagnosis = await EXPRESSION_BUILDERS.evaluation(
      trx,
      input,
      diagnosisToEvaluation({ snomed_concept }),
    )
      .select(['patient_records_aggregated.value'])
      .orderBy('patient_records_aggregated.created_at', 'desc')
      .limit(1)
      .executeTakeFirst()
      .then(presentDiagnosis)

    if (!latest_diagnosis) return `No possible ${snomed_concept.name} diagnosis to rule out`
    if (latest_diagnosis.certainty !== 'possible') {
      return `${snomed_concept.name} is ${latest_diagnosis.certainty}, so not ruled out by task "${task_description_completed}"`
    }

    // While we do have record_ids of "No" records on hand, the health worker could have
    // entered "No" records at any point, so find every finding that could have contributed.
    const explicit_no_findings = await s_expression_evidence.evaluate(
      trx,
      input,
      {
        atom: 'or' as const,
        expressions: task.to_be_done.value.map((finding): Lang['finding'] => ({ ...finding, existence: 'No' })),
      },
    )
    assert(
      explicit_no_findings.satisfies,
      `Task "${task_description_completed}" was answered without any of its findings being recorded as No`,
    )

    const improbable_diagnosis = await system_diagnosis_rules.insertOne(trx, {
      ...input,
      diagnosis_node: diagnosisToEvaluation({ snomed_concept, certainty_qualifier: 'improbable' }),
      matching_finding_ids: explicit_no_findings.contributing_records,
    })

    return `Inserted 1 improbable diagnosis(es): ${improbable_diagnosis.record_id}`
  },
  async insertSystemDiagnosesIfNotAlreadyIdentified(
    trx: TrxOrDb,
    input: RuleRunnerInput,
  ): Promise<string> {
    const rules_result = await rules.getApplicableBasedOnNewRecords(trx, input, 'system_diagnosis_rule')
    const inserted_diagnoses = await system_diagnosis_rules.insertPositiveDiagnoses(trx, input, rules_result)

    const positive_message = inserted_diagnoses.length
      ? `Inserted ${inserted_diagnoses.length} diagnosis(es): ${inserted_diagnoses.map((d) => d.record_id).join(', ')}`
      : isString(rules_result)
      ? rules_result
      : 'No new system diagnoses to insert'

    if (!input.task_description_completed) return positive_message

    const improbable_message = await system_diagnosis_rules.insertImprobable(trx, input, inserted_diagnoses)
    return `${positive_message}\n${improbable_message}`
  },
}
