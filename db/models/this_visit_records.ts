import { assert } from 'std/assert/assert.ts'
import { buildValueDisplay } from '../../shared/patient_records.ts'
import {
  RenderedPatientEncounter,
  RenderedRecordRelativeToHealthWorker,
  TrxOrDb,
} from '../../types.ts'
import {
  patient_findings,
  // STATUS_ATTRIBUTE_SNOMED_CONCEPT_ID,
} from './patient_findings.ts'

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
    not_measurements: true,
  })

  return records.map(
    (record) => {
      const { patient_encounter_employee_id, ...finding } = record

      const matching_employee = encounter.all_employees_seen.find((
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
      } satisfies RenderedRecordRelativeToHealthWorker
    },
  )
}
