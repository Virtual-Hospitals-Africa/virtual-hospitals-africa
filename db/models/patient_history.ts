import type { RenderedPatientHistory, RenderedPatientOpenEncounter, TrxOrDbOrQueryCreator } from '../../types.ts'
import mapEntries from '../../util/mapEntries.ts'
import { promiseProps } from '../../util/promiseProps.ts'
import { patient_findings } from './patient_findings.ts'
import { patient_record_providers } from './patient_record_providers.ts'
// import { patient_findings } from './patient_findings.ts'

// Diagnoses
// Yes self reported statuses
// Anything else that's a descendant of chronic disease
// function getPreExistingConditions(): Promise<RenderedFindingRelativeToHealthWorker[]> {

// }

export const patient_history = {
  async get(
    trx: TrxOrDbOrQueryCreator,
    { patient_id, health_worker_id, encounter }: {
      patient_id: string
      health_worker_id: string
      encounter?: RenderedPatientOpenEncounter
    },
  ): Promise<RenderedPatientHistory> {
    const raw_history = await promiseProps({
      pre_existing_conditions: [],
      allergies: patient_findings.findAll(trx, {
        patient_id,
        s_expression: '(allergy)',
      }),
      family_history: [],
      major_surgeries: [],
      medications: [],
      lifestyle: [],
    })

    return promiseProps(mapEntries(raw_history, (records) =>
      patient_record_providers.hydrateIntermediateRecords(trx, {
        records,
        encounter,
        health_worker_id,
      })))
  },
}
