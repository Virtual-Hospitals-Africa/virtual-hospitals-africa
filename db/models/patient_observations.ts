import { MostRecentVitalMeasurement, TrxOrDb } from '../../types.ts'
import { VITALS_SNOMED_CODE } from '../../shared/vitals.ts'

/*
  Treat patient_observations as an append only log
  Deletions would be handled by making a `referrant_observation` with snomed_concept_id: 723510000 | Entered in error
  Edits would be a deletion and a new entry
*/
type Measurement = {
  snomed_concept_id: string
  value: number
  units: string
}

export async function insertMeasurements(
  trx: TrxOrDb,
  { input_measurements, patient_id, encounter_id, encounter_provider_id }: {
    patient_id: string
    encounter_id: string
    encounter_provider_id: string
    input_measurements: Measurement[]
  },
) {
  await trx.insertInto('patient_observations')
    .values(input_measurements.map(
    (input_measurement) => ({
      patient_id,
      encounter_id,
      encounter_provider_id,
      observation_type: 'measurement',
      snomed_concept_id: input_measurement.snomed_concept_id,
      value: {
        value: input_measurement.value,
        units: input_measurement.units,
      }
    }),
  ))
    .execute()
}

// TODO
// deno-lint-ignore require-await
export async function getMostRecent(
  trx: TrxOrDb,
  { patient_id, snomed_concept_ids }:
  { patient_id: string, snomed_concept_ids: string[] }
): Promise<MostRecentVitalMeasurement[]> {
  return []
}
