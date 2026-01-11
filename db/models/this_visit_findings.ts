import { assert } from 'std/assert/assert.ts'
import { RenderedFindingRelativeToHealthWorker, RenderedPatientEncounter, TrxOrDb } from '../../types.ts'
import {
  patient_findings,
  // STATUS_ATTRIBUTE.id,
} from './patient_findings.ts'
import { patient_measurements } from './patient_measurements.ts'
import { promiseProps } from '../../util/promiseProps.ts'

export const this_visit_findings = {
  async get(
    trx: TrxOrDb,
    { health_worker_id, encounter }: {
      health_worker_id: string
      encounter: RenderedPatientEncounter
    },
  ): Promise<RenderedFindingRelativeToHealthWorker[]> {
    const { findings, measurements } = await promiseProps({
      findings: patient_findings.findAll(trx, {
        patient_id: encounter.patient.id,
        patient_encounter_id: encounter.patient_encounter_id,
        not_measurements: true,
      }),

      measurements: patient_measurements.findAll(trx, {
        patient_id: encounter.patient.id,
        patient_encounter_id: encounter.patient_encounter_id,
      }),
    })

    const records = [...findings, ...measurements]

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
          provider: {
            is_me: matching_employee.id === health_worker_id,
            ...matching_employee,
          },
        }
      },
    )
  },
}
