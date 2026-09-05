import { afterAll } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { system_priority_evaluations } from '../../db/models/system_priority_evaluations.ts'
import { InsertedRecord, patient_findings } from '../../db/models/patient_findings.ts'
import { due_to } from '../../db/models/due_to.ts'
import isString from '../../util/isString.ts'
import { RuleRunnerInput, TrxOrDb } from '../../types.ts'
import { WORKFLOW_STEP_SNOMED_CONCEPTS } from '../../shared/workflow.ts'
import { insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest } from 'test/_helpers/workflows.ts'
import { assertArrayEmpty } from '../../util/arraySize.ts'
import assertLength from '../../util/assertLength.ts'

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
}

/*
  Mirrors due_to.addFromNewRecords: tag the new records with the due_tos they satisfy,
  falling back to empty satisfying_due_to_ids when nothing matched so the rule runners
  still get a chance to run.
*/
async function tagDueTos(
  { patient_id, patient_encounter_id, procedure_id, records }: {
    patient_id: string
    patient_encounter_id: string
    procedure_id?: string
    records: InsertedRecord[]
  },
): Promise<RuleRunnerInput & { procedure_id?: string }> {
  const new_records = { patient_id, patient_encounter_id, patient_age_determination: 'adult' as const, procedure_id, records }
  const due_to_result = await due_to.determineFromNewRecords(db, new_records)
  const tagged = isString(due_to_result) ? { ...new_records, records: records.map((record) => ({ ...record, satisfying_due_to_ids: [] })) } : due_to_result
  return { listener_id: 'test', listener_name: 'test', ...tagged }
}

/*
  Inserts the given findings in the triage warning signs step for a fresh adult
  patient, then runs the system_priority_evaluation rules against them.
*/
async function insertFindingsAndEvaluatePriority(
  trx: TrxOrDb,
  findings: string[],
) {
  const { employee, patient_id, patient_encounter_id } = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(trx)
  const inserted_findings = await patient_findings.insertMany(
    trx,
    {
      patient_id,
      patient_encounter_id,
      patient_encounter_employee_id: employee.patient_encounter_employee_id,
      employment_id: employee.employee_id,
      procedure: {
        create_with_specific_snomed_concept_id: WORKFLOW_STEP_SNOMED_CONCEPTS.triage!.warning_signs.snomed_concept_id,
      },
      findings,
    },
  )
  assertLength(inserted_findings.findings, findings.length)

  const result = await system_priority_evaluations.insertSystemPriorityEvaluationsIfNotAlreadyIdentified(
    trx,
    await tagDueTos({
      patient_id,
      patient_encounter_id,
      procedure_id: inserted_findings.procedure_id,
      records: inserted_findings.findings,
    }),
  )

  const triage_levels = await trx.selectFrom('patient_triage_level')
    .innerJoin('patient_records', 'patient_records.id', 'patient_triage_level.id')
    .innerJoin(
      'snomed_inferred_canonical_name_and_category',
      'snomed_inferred_canonical_name_and_category.id',
      'patient_records.value_snomed_concept_id',
    )
    .where('patient_records.patient_encounter_id', '=', patient_encounter_id)
    .select([
      'patient_triage_level.system_priority_evaluation_id',
      'snomed_inferred_canonical_name_and_category.name as priority',
    ])
    .execute()

  return { result, triage_levels }
}

function constipationWithOnset(hours_ago: number): string {
  return `(clinical_finding (snomed_concept "Constipation" "finding") (event (snomed_concept "Time of onset" "observable entity") "${hoursAgo(hours_ago)}"))`
}

const DISTENSION_OF_ABDOMEN = `(clinical_finding (snomed_concept "Distension of abdomen" "finding"))`

describeParallel('db/models/system_priority_evaluations.ts', () => {
  afterAll(() => db.destroy())

  itParallel(
    "is not urgent if constipation onset was only 20 hours ago even if there's also Distension of abdomen",
    async () => {
      const { result, triage_levels } = await insertFindingsAndEvaluatePriority(db, [
        constipationWithOnset(20),
        DISTENSION_OF_ABDOMEN,
      ])

      assert(!result.startsWith('Inserted'), `Expected no priority evaluation to be inserted, but got: ${result}`)
      assertArrayEmpty(triage_levels)
    },
  )

  itParallel(
    "is urgent if constipation onset was >24 hours ago if there's also Distension of abdomen",
    async () => {
      const { result, triage_levels } = await insertFindingsAndEvaluatePriority(db, [
        constipationWithOnset(48),
        DISTENSION_OF_ABDOMEN,
      ])

      assertEquals(result, 'Inserted 1 priority evaluation(s)')
      assertLength(triage_levels, 1)
      const [triage_level] = triage_levels
      assert(triage_level)
      assertEquals(triage_level.priority, 'Urgent')
      assert(triage_level.system_priority_evaluation_id, 'Triage level should be attributed to the system_priority_evaluation rule')
    },
  )
})
