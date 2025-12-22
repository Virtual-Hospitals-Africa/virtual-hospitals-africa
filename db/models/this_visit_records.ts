// deno-lint-ignore-file no-unused-vars
import { assert } from 'std/assert/assert.ts'
import { COMMON_CONDITION_KEYS } from '../../shared/brief_history.ts'
import { buildValueDisplay } from '../../shared/patient_records.ts'
import {
  RenderedFindingRelativeToHealthWorker,
  RenderedPatientEncounter,
  RenderedRecordRelativeToHealthWorker,
  ThisVisitRecords,
  TrxOrDb,
} from '../../types.ts'
import fromEntries from '../../util/fromEntries.ts'
import { groupBy, groupByUniq } from '../../util/groupBy.ts'
import mapEntries from '../../util/mapEntries.ts'
import uniq from '../../util/uniq.ts'
import {
  patient_findings,
  STATUS_ATTRIBUTE_SNOMED_CONCEPT_ID,
} from './patient_findings.ts'
import * as patient_encounters from './patient_encounters.ts'

export async function get(
  trx: TrxOrDb,
  { health_worker_id, encounter }: {
    health_worker_id: string
    encounter: RenderedPatientEncounter
  },
): Promise<RenderedRecordRelativeToHealthWorker[]> {
  const records = await patient_findings.findAll(trx, {
    patient_id: encounter.patient.id,
    patient_encounter_id: encounter.patient_encounter_id,
    s_expression:
      `(finding (not (finding ${STATUS_ATTRIBUTE_SNOMED_CONCEPT_ID})))`,
  })

  const encounter_ids = uniq(
    records.map((record) => record.patient_encounter_id),
  )

  const other_encounter_ids = encounter_ids.filter((encounter_id) =>
    encounter_id !== encounter.patient_encounter_id
  )

  const other_encounters: RenderedPatientEncounter[] =
    other_encounter_ids.length
      ? await patient_encounters.getByIds(trx, other_encounter_ids)
      : []

  const encounters = [encounter, ...other_encounters]
  const encounter_id_to_encounter = groupByUniq(
    encounters,
    'patient_encounter_id',
  )

  return records.map(
    (record) => {
      const { patient_encounter_employee_id, ...finding } = record

      const matching_encounter = encounter_id_to_encounter.get(
        finding.patient_encounter_id,
      )
      assert(
        matching_encounter,
        `Matching encounter not found ${finding.patient_encounter_id} ${finding.record_id}`,
      )

      const matching_employee = matching_encounter.all_employees_seen.find((
        employee,
      ) =>
        employee.patient_encounter_employee_id ===
          patient_encounter_employee_id
      )
      assert(
        matching_employee,
        `Matching employee not found ${patient_encounter_employee_id} ${finding.record_id}`,
      )

      return {
        ...finding,
        value_display: buildValueDisplay(finding),
        provider: {
          is_me: matching_employee.id === health_worker_id,
          ...matching_employee,
        },
        related_records: [],
        pertaining_to_key: finding.name,
        existence: 'Yes',
      } satisfies RenderedRecordRelativeToHealthWorker
    },
  )
}
