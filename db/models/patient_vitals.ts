import * as clinical_measurement_requirements from './clinical_measurement_requirements.ts'
import {
  RenderedFindingRelativeToHealthWorker,
  RenderedPatient,
  TrxOrDb,
  VitalMeasurementFormInputDefition,
} from '../../types.ts'
import { completedPersonal } from '../../shared/patient_registration.ts'
import { IdSelection } from '../../types.ts'
import { debugLog, jsonObjectFrom } from '../helpers.ts'
import { QueryCreator, sql } from 'kysely'
import { base } from './_base.ts'
import { assert } from 'std/assert/assert.ts'
import { DB } from '../../db.d.ts'
import { patient_findings } from './patient_findings.ts'
import * as patient_encounter_employees from './patient_encounter_employees.ts'
import { buildValueDisplay } from '../../shared/patient_records.ts'
import { assertArrayNonEmpty } from '../../util/arraySize.ts'

export function baseQuery(
  trx: TrxOrDb | QueryCreator<DB>,
) {
  return patient_findings.baseQuery(trx)
    .leftJoin(
      'patient_measurements',
      'patient_findings.id',
      'patient_measurements.id',
    )
    .select([
      'patient_measurements.value',
      'patient_measurements.units',
    ])
}

export const patient_vitals = base({
  top_level_table: 'patient_findings',
  baseQuery,
  formatResult: (finding) => ({
    ...finding,
    value_display: buildValueDisplay(finding),
  }),
  handleSearch(
    qb,
    opts: { search?: string; patient_id: string | IdSelection },
  ) {
    assert(!opts.search, 'TODO support')
    if (opts.search) {
      qb = qb.where(
        'snomed_inferred_canonical_name_and_category.name',
        'ilike',
        `%${opts.search}%`,
      )
    }
    if (opts.patient_id) {
      qb = qb.where(
        'patient_records.patient_id',
        '=',
        opts.patient_id,
      )
    }

    return qb
  },
  async getMostRecent(
    trx: TrxOrDb,
    { health_worker_id, patient_id, snomed_concept_ids }: {
      health_worker_id: string
      patient_id: string
      snomed_concept_ids: string[]
    },
  ): Promise<RenderedFindingRelativeToHealthWorker[]> {
    assertArrayNonEmpty(snomed_concept_ids)

    const query = trx.with(
      'ranked_findings',
      (qb) =>
        baseQuery(qb)
          .where('patient_records.patient_id', '=', patient_id)
          .where(
            'patient_findings.finding_snomed_concept_id',
            'in',
            snomed_concept_ids,
          )
          .select(
            sql`ROW_NUMBER() OVER (PARTITION BY patient_findings.finding_snomed_concept_id ORDER BY patient_records.created_at DESC)`
              .as('rank'),
          )
          .orderBy('patient_records.created_at', 'desc'),
    ).selectFrom('ranked_findings')
      .where('ranked_findings.rank', '=', 1)
      .selectAll('ranked_findings')
      .select(sql<'manual'>`'manual'`.as('finding_type'))
      .select((eb) => [
        jsonObjectFrom(
          patient_encounter_employees.baseQuery(trx)
            .where(
              'patient_encounter_employees.id',
              '=',
              eb.ref('ranked_findings.patient_encounter_employee_id'),
            ).select((eb_employees) => [
              eb_employees('health_workers.id', '=', health_worker_id).as(
                'is_me',
              ),
            ]),
        ).$notNull().as('provider'),
      ])

    debugLog(query)

    const findings = await query.execute()

    return findings.map((finding) => ({
      ...finding,
      value_display: buildValueDisplay(finding),
    }))
  },
})

export async function measurementsNeededForTriageEncounter(
  trx: TrxOrDb,
  patient_record: RenderedPatient,
  active_condition_snomed_codes: readonly string[],
): Promise<VitalMeasurementFormInputDefition[]> {
  // Get regular vital measurements based on clinical context
  // AVPU/Mobility/Trauma are now handled by database-driven categorical assessments

  assert(completedPersonal(patient_record))

  const requirements_result = await clinical_measurement_requirements
    .determineMeasurementsForPatient(trx, {
      patient_id: patient_record.id,
      age_days: patient_record.age_days ?? 0,
      sex: patient_record.sex,
      active_condition_snomed_codes,
      pregnancy_status: active_condition_snomed_codes.includes('77386006'),
    })

  return requirements_result.measurements
}
