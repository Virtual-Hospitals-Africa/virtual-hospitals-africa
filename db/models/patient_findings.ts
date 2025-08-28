import { sql } from 'kysely'
import {
  Measurement,
  MostRecentVitalMeasurement,
  TrxOrDb,
} from '../../types.ts'
import { jsonBuildObject } from '../helpers.ts'
import z from 'zod'
import { decimal } from '../../util/validators.ts'

/*
  Treat patient_findings as an append only log
  Deletions would be handled by making a `referrant_finding` with snomed_concept_id: 723510000 | Entered in error
  Edits would be a deletion and a new entry
*/
export function insertMeasurements(
  trx: TrxOrDb,
  {
    input_measurements,
    patient_id,
    encounter_id,
    procedure_id,
    encounter_provider_id,
  }: {
    patient_id: string
    encounter_id: string
    encounter_provider_id: string
    procedure_id: string
    input_measurements: Measurement[]
  },
) {
  return trx.insertInto('patient_findings')
    .values(input_measurements.map(
      (input_measurement) => ({
        id: input_measurement.finding_id,
        patient_id,
        encounter_id,
        encounter_provider_id,
        procedure_id,
        finding_type: 'measurement',
        snomed_concept_id: input_measurement.snomed_concept_id,
        value: input_measurement.value,
        units: input_measurement.units,
      }),
    ))
    .execute()
}

const MeasurementSchema = z.object({
  finding_type: z.enum(['measurement']),
  value: decimal,
  units: z.enum([
    'cm',
    'kg',
    '°C',
    'mmHg',
    '%',
    'mg/dL',
    'bpm',
  ]),
})

function measurementValueDisplay(
  { value, units }: z.infer<typeof MeasurementSchema>,
): string {
  switch (units) {
    case '°C':
    case '%':
      return `${value}${units}`
    default:
      return `${value} ${units}`
  }
}

export async function getMostRecentMeasurements(
  trx: TrxOrDb,
  { patient_id, snomed_concept_ids }: {
    patient_id: string
    snomed_concept_ids: string[]
  },
): Promise<MostRecentVitalMeasurement[]> {
  const findings = await trx.with(
    'ranked_findings',
    (qb) =>
      qb.selectFrom('patient_findings')
        .where('patient_id', '=', patient_id)
        .where('snomed_concept_id', 'in', snomed_concept_ids)
        .where('finding_type', '=', 'measurement')
        .orderBy('created_at', 'desc')
        .selectAll()
        .select(
          sql`ROW_NUMBER() OVER (PARTITION BY snomed_concept_id ORDER BY created_at DESC)`
            .as('rank'),
        ),
  ).selectFrom('ranked_findings')
    .innerJoin(
      'patient_encounter_providers',
      'patient_encounter_providers.id',
      'ranked_findings.encounter_provider_id',
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
    .where('ranked_findings.rank', '=', 1)
    .select([
      'ranked_findings.id as finding_id',
      'ranked_findings.snomed_concept_id',
      'ranked_findings.finding_type',
      'ranked_findings.value',
      'ranked_findings.units',
      'ranked_findings.created_at',
      'ranked_findings.encounter_id',
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

  return findings.map(({ value, units, finding_type, ...finding }) => ({
    ...finding,
    value_display: measurementValueDisplay(
      MeasurementSchema.parse({ value, units, finding_type }),
    ),
  }))
}
