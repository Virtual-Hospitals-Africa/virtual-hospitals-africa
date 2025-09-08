import { sql } from 'kysely'
import {
  MostRecentVitalMeasurement,
  PRIORITY_SNOMED_CODES,
  TrxOrDb,
} from '../../types.ts'
import { jsonArrayFrom, jsonBuildObject, success_true } from '../helpers.ts'
import { VITALS_SNOMED_CODE } from '../../shared/vitals.ts'
import generateUUID from '../../util/uuid.ts'

export interface VitalsEvaluation {
  finding_id: string
  snomed_concept_id: string
  priority?: keyof typeof PRIORITY_SNOMED_CODES
  note?: string
}

export function mapPriorityFromSnomedCode(
  snomed_code: string,
): keyof typeof PRIORITY_SNOMED_CODES | undefined {
  return Object.entries(PRIORITY_SNOMED_CODES).find(([_, code]) =>
    code === snomed_code
  )?.[0] as keyof typeof PRIORITY_SNOMED_CODES | undefined
}

export function insertMany(
  trx: TrxOrDb,
  {
    patient_id,
    encounter_id,
    encounter_provider_id,
    evaluations,
  }: {
    patient_id: string
    encounter_id: string
    encounter_provider_id: string
    evaluations: VitalsEvaluation[]
  },
) {
  if (!evaluations.length) {
    return Promise.resolve({ success: true as const })
  }

  const validEvaluations = evaluations
    .filter((evaluation) => evaluation.priority || evaluation.note?.trim())
    .map((evaluation) => ({
      id: generateUUID(),
      evaluates_record_id: evaluation.finding_id,
      snomed_concept_id: PRIORITY_SNOMED_CODES[evaluation.priority || 'Normal'],
      note: evaluation.note?.trim(),
    }))

  if (validEvaluations.length === 0) {
    return Promise.resolve({ success: true as const })
  }

  return trx.with(
    'inserting_evaluation_records',
    (qb) =>
      qb.insertInto('patient_records')
        .values(validEvaluations.map((evaluation) => ({
          id: evaluation.id,
          patient_id,
          encounter_id,
          snomed_concept_id: evaluation.snomed_concept_id,
        }))),
  ).with('inserting_evaluations', (qb) =>
    qb.insertInto('patient_evaluations')
      .values(validEvaluations.map((evaluation) => ({
        id: evaluation.id,
        encounter_provider_id,
        evaluates_record_id: evaluation.evaluates_record_id,
        note: evaluation.note,
      })))).selectNoFrom([
      success_true,
    ])
    .executeTakeFirstOrThrow()
}

const VITAL_SNOMED_CONCEPT_IDS = [
  VITALS_SNOMED_CODE.height,
  VITALS_SNOMED_CODE.weight,
  VITALS_SNOMED_CODE.temperature,
  VITALS_SNOMED_CODE.blood_pressure_diastolic,
  VITALS_SNOMED_CODE.blood_pressure_systolic,
  VITALS_SNOMED_CODE.blood_oxygen_saturation,
  VITALS_SNOMED_CODE.blood_glucose,
  VITALS_SNOMED_CODE.pulse,
  VITALS_SNOMED_CODE.respiratory_rate,
  VITALS_SNOMED_CODE.bmi,
  VITALS_SNOMED_CODE.mean_arterial_pressure,
]

export async function getMostRecentVitalsWithEvaluations(
  trx: TrxOrDb,
  { patient_id }: { patient_id: string },
): Promise<
  (MostRecentVitalMeasurement & { finding_type: 'manual' | 'computed' })[]
> {
  const findings = await trx.with(
    'ranked_manual_findings',
    (qb) =>
      qb.selectFrom('patient_records')
        .innerJoin(
          'patient_findings',
          'patient_records.id',
          'patient_findings.id',
        )
        .innerJoin(
          'patient_measurements',
          'patient_findings.id',
          'patient_measurements.id',
        )
        .where('patient_records.patient_id', '=', patient_id)
        .where(
          'patient_records.snomed_concept_id',
          'in',
          VITAL_SNOMED_CONCEPT_IDS,
        )
        .orderBy('patient_records.created_at', 'desc')
        .selectAll('patient_records')
        .select([
          sql<string | null>`patient_findings.encounter_provider_id`.as(
            'encounter_provider_id',
          ),
          sql<string | null>`patient_findings.procedure_id`.as('procedure_id'),
          sql<string | null>`patient_findings.referent_finding_id`.as(
            'referent_finding_id',
          ),
        ])
        .select([
          'patient_measurements.value',
          'patient_measurements.units',
        ])
        .select(sql`'manual'`.as('finding_type'))
        .select(
          sql`ROW_NUMBER() OVER (PARTITION BY patient_records.snomed_concept_id ORDER BY patient_records.created_at DESC)`
            .as('rank'),
        ),
  ).with(
    'ranked_computed_findings',
    (qb) =>
      qb.selectFrom('patient_records')
        .innerJoin(
          'patient_findings',
          'patient_records.id',
          'patient_findings.id',
        )
        .innerJoin(
          'patient_computed_findings',
          'patient_findings.id',
          'patient_computed_findings.id',
        )
        .where('patient_records.patient_id', '=', patient_id)
        .where(
          'patient_records.snomed_concept_id',
          'in',
          VITAL_SNOMED_CONCEPT_IDS,
        )
        .orderBy('patient_records.created_at', 'desc')
        .selectAll('patient_records')
        .select([
          'patient_findings.encounter_provider_id',
          'patient_findings.procedure_id',
          sql<string | null>`patient_findings.referent_finding_id`.as(
            'referent_finding_id',
          ),
        ])
        .select([
          'patient_computed_findings.value',
          'patient_computed_findings.units',
        ])
        .select(sql`'computed'`.as('finding_type'))
        .select(
          sql`ROW_NUMBER() OVER (PARTITION BY patient_records.snomed_concept_id ORDER BY patient_records.created_at DESC)`
            .as('rank'),
        ),
  ).with(
    'all_ranked_findings',
    (qb) =>
      qb.selectFrom('ranked_manual_findings')
        .select([
          'id',
          'patient_id',
          'encounter_id',
          'snomed_concept_id',
          'created_at',
          'updated_at',
          'encounter_provider_id',
          'procedure_id',
          'referent_finding_id',
          'value',
          'units',
          'finding_type',
          'rank',
        ])
        .unionAll(
          qb.selectFrom('ranked_computed_findings')
            .select([
              'id',
              'patient_id',
              'encounter_id',
              'snomed_concept_id',
              'created_at',
              'updated_at',
              'encounter_provider_id',
              'procedure_id',
              'referent_finding_id',
              'value',
              'units',
              'finding_type',
              'rank',
            ]),
        ),
  ).with(
    'latest_findings',
    (qb) =>
      qb.selectFrom('all_ranked_findings')
        .selectAll()
        .select(
          sql`ROW_NUMBER() OVER (PARTITION BY snomed_concept_id ORDER BY created_at DESC)`
            .as('final_rank'),
        ),
  ).selectFrom('latest_findings')
    .leftJoin(
      'patient_encounter_providers',
      'patient_encounter_providers.id',
      'latest_findings.encounter_provider_id',
    )
    .leftJoin(
      'employment',
      'employment.id',
      'patient_encounter_providers.provider_id',
    )
    .leftJoin(
      'health_workers',
      'health_workers.id',
      'employment.health_worker_id',
    )
    .leftJoin(
      'organizations',
      'organizations.id',
      'employment.organization_id',
    )
    .where('latest_findings.final_rank', '=', 1)
    .select([
      'latest_findings.id as finding_id',
      'latest_findings.snomed_concept_id',
      'latest_findings.value',
      'latest_findings.units',
      'latest_findings.created_at',
      'latest_findings.encounter_id',
      'latest_findings.finding_type',
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
      jsonArrayFrom(
        eb
          .selectFrom('patient_evaluations')
          .innerJoin(
            'patient_records as evaluation_records',
            'evaluation_records.id',
            'patient_evaluations.id',
          )
          .select([
            // json_agg casts bigint to number, but when selected as a column by itself
            // kysely reads as a string so we replicate kysely's behavior here
            sql<string>`evaluation_records.snomed_concept_id::text`.as(
              'snomed_concept_id',
            ),
            'note',
          ])
          .whereRef(
            'latest_findings.id',
            '=',
            'patient_evaluations.evaluates_record_id',
          ),
      ).as('evaluations'),
    ])
    .execute()

  return findings.map(({ value, units, finding_type, ...finding }) => ({
    ...finding,
    finding_type: finding_type as 'manual' | 'computed',
    value_display: valueDisplay({ value: Number(value), units }),
    // Ensure required fields are not null
    provider: {
      ...finding.provider,
      patient_encounter_provider_id:
        finding.provider.patient_encounter_provider_id || '',
      employee_id: finding.provider.employee_id || '',
      health_worker_id: finding.provider.health_worker_id || '',
      name: finding.provider.name || '',
      avatar_url: finding.provider.avatar_url || '',
      profession: finding.provider.profession || 'nurse' as const,
      organization: {
        id: finding.provider.organization.id || '',
        name: finding.provider.organization.name || '',
      },
    },
  }))
}

function valueDisplay(
  { value, units }: { value: number; units: string },
): string {
  switch (units) {
    case '°C':
    case '%':
      return `${value}${units}`
    default:
      return `${value} ${units}`
  }
}
