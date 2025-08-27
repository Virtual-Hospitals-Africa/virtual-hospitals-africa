import { sql } from 'kysely'
import { MostRecentVitalMeasurement, TrxOrDb } from '../../types.ts'
import { jsonBuildObject } from '../helpers.ts'
import z from 'zod'

/*
  Treat patient_observations as an append only log
  Deletions would be handled by making a `referrant_observation` with snomed_concept_id: 723510000 | Entered in error
  Edits would be a deletion and a new entry
*/
type Measurement = {
  observation_id: string
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
        id: input_measurement.observation_id,
        patient_id,
        encounter_id,
        encounter_provider_id,
        observation_type: 'measurement',
        snomed_concept_id: input_measurement.snomed_concept_id,
        value: {
          value: input_measurement.value,
          units: input_measurement.units,
        },
      }),
    ))
    .execute()
}

const MeasurementSchema = z.object({
  value: z.number(),
  units: z.string(),
})

export async function getMostRecent(
  trx: TrxOrDb,
  { patient_id, snomed_concept_ids }: {
    patient_id: string
    snomed_concept_ids: string[]
  },
): Promise<MostRecentVitalMeasurement[]> {
  const observations = await trx.with(
    'ranked_observations',
    (qb) =>
      qb.selectFrom('patient_observations')
        .where('patient_id', '=', patient_id)
        .where('snomed_concept_id', 'in', snomed_concept_ids)
        .where('observation_type', '=', 'measurement')
        .orderBy('created_at', 'desc')
        .selectAll()
        .select(
          sql`ROW_NUMBER() OVER (PARTITION BY snomed_concept_id ORDER BY created_at DESC)`
            .as('rank'),
        ),
  ).selectFrom('ranked_observations')
    .innerJoin(
      'patient_encounter_providers',
      'patient_encounter_providers.id',
      'ranked_observations.encounter_provider_id',
    )
    .innerJoin(
      'employment',
      'employment.id',
      'patient_encounter_providers.provider_id',
    )
    .innerJoin(
      'health_workers',
      'health_workers.id',
      'employment.health_worker_id',
    )
    .innerJoin(
      'organizations',
      'organizations.id',
      'employment.organization_id',
    )
    .where('ranked_observations.rank', '=', 1)
    .select([
      'ranked_observations.id as observation_id',
      'ranked_observations.snomed_concept_id',
      'ranked_observations.value',
      'ranked_observations.created_at',
      'ranked_observations.encounter_id',
    ])
    .select((eb) => [
      jsonBuildObject({
        name: eb.ref('health_workers.name'),
        avatar_url: eb.ref('health_workers.avatar_url'),
        profession: eb.ref('employment.profession').$castTo<
          'doctor' | 'nurse'
        >(),
        patient_encounter_provider_id: eb.ref('patient_encounter_providers.id'),
        organization: jsonBuildObject({
          id: eb.ref('organizations.id'),
          name: eb.ref('organizations.name'),
        }),
        employee_id: eb.ref('employment.id'),
        health_worker_id: eb.ref('health_workers.id'),
      }).as('provider'),
    ])
    .execute()

  return observations.map(({ value, ...observation }) => {
    const parsed_value = MeasurementSchema.parse(value)
    return {
      ...observation,
      value_display: `${parsed_value.value} ${parsed_value.units}`,
    }
  })
}
