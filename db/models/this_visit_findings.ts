import { assert } from 'std/assert/assert.ts'
import { RenderedFindingRelativeToHealthWorker, RenderedPatientEncounter, TrxOrDb } from '../../types.ts'
import {
  patient_findings,
  // STATUS_ATTRIBUTE.id,
} from './patient_findings.ts'
import { patient_measurements } from './patient_measurements.ts'
import { promiseProps } from '../../util/promiseProps.ts'
import { patient_record_providers } from './patient_record_providers.ts'

export const this_visit_findings = {
  async get(
    trx: TrxOrDb,
    { health_worker_id, encounter }: {
      health_worker_id: string
      encounter: RenderedPatientEncounter
    },
  ): Promise<RenderedFindingRelativeToHealthWorker[]> {
    const records = await patient_findings.findAll(trx, {
      patient_id: encounter.patient.id,
      patient_encounter_id: encounter.patient_encounter_id,
    })

    const hydrated = await patient_record_providers.hydrateIntermediateRecords(
      trx, { records, health_worker_id, encounter }
    )

    return hydrated
  },
}
