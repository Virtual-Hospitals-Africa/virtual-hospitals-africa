// Perhaps a misnomer, this is a more general way of getting findings whether they be measurements or not
import * as clinical_measurement_requirements from './clinical_measurement_requirements.ts'
import {
  RenderedFindingRelativeToHealthWorker,
  RenderedMeasurementRelativeToHealthWorker,
  RenderedPatient,
  TrxOrDb,
  TrxOrDbOrQueryCreator,
  VitalMeasurementFormInputDefition,
} from '../../types.ts'
import { completedPersonal } from '../../shared/patient_registration.ts'
import { IdSelection } from '../../types.ts'
import { jsonObjectFrom } from '../helpers.ts'
import { sql } from 'kysely'
import { assert } from 'std/assert/assert.ts'
import { patient_findings } from './patient_findings.ts'
import * as patient_encounter_employees from './patient_encounter_employees.ts'
import { formatRecord } from '../../shared/patient_records.ts'

import { buildExpression } from './s_expression.ts'
import { AnyNode } from '../../shared/s_expression_schemas.ts'
import { base } from './_base.ts'
import { promiseProps } from '../../util/promiseProps.ts'
import { isMeasurement } from '../../shared/vitals.ts'
import { assertArrayEmpty } from '../../util/arraySize.ts'
import partition from '../../util/partition.ts'

export function baseQuery(
  trx: TrxOrDbOrQueryCreator,
) {
  return patient_findings.baseQuery(trx)
}

type VitalsSearch = {
  patient_id: string | IdSelection
  patient_encounter_id?: string | IdSelection
  excluding_patient_encounter_id?: string | IdSelection
  s_expression?: string | AnyNode
  search?: string
  not_measurements?: boolean
}

export const patient_vitals = base({
  top_level_table: 'patient_findings',
  baseQuery,
  formatResult: formatRecord,
  handleSearch(
    qb,
    opts: VitalsSearch,
    trx,
  ) {
    assert(!opts.search, 'TODO support')
    if (opts.patient_id) {
      qb = qb.where(
        'patient_records.patient_id',
        '=',
        opts.patient_id,
      )
    }
    if (opts.patient_encounter_id) {
      qb = qb.where(
        'patient_records.patient_encounter_id',
        '=',
        opts.patient_encounter_id,
      )
    }
    if (opts.excluding_patient_encounter_id) {
      qb = qb.where(
        'patient_records.patient_encounter_id',
        '!=',
        opts.excluding_patient_encounter_id,
      )
    }
    if (opts.s_expression) {
      qb = qb.where(
        'patient_records.id',
        'in',
        buildExpression(
          trx,
          {
            patient_id: opts.patient_id,
            patient_encounter_id: opts.patient_encounter_id,
          },
          opts.s_expression,
        ),
      )
    }

    return qb
  },
  async getMostRecent(
    trx: TrxOrDb,
    {
      measurement_snomed_concept_ids,
      assessment_snomed_concept_ids,
      ...args
    }: {
      health_worker_id: string
      patient_id: string
      patient_encounter_id?: string
      excluding_patient_encounter_id?: string
      measurement_snomed_concept_ids: string[]
      assessment_snomed_concept_ids: string[]
    },
  ) {
    const { measurements, assessments } = await promiseProps({
      measurements: patient_vitals.getMostRecentMeasurements(trx, {
        ...args,
        snomed_concept_ids: measurement_snomed_concept_ids,
      }),
      assessments: patient_vitals.getMostRecentAssessments(trx, {
        ...args,
        snomed_concept_ids: assessment_snomed_concept_ids,
      }),
    })
    return {
      measurements,
      assessments,
      all: [...measurements, ...assessments],
    }
  },
  async getMostRecentMeasurements(
    trx: TrxOrDb,
    {
      health_worker_id,
      patient_id,
      patient_encounter_id,
      excluding_patient_encounter_id,
      snomed_concept_ids,
    }: {
      health_worker_id: string
      patient_id: string
      patient_encounter_id?: string
      excluding_patient_encounter_id?: string
      snomed_concept_ids: string[]
    },
  ): Promise<RenderedMeasurementRelativeToHealthWorker[]> {
    const findings = await getMostRecent()
    const formatted = findings.map(formatRecord)
    const [measurements, rest] = partition(formatted, isMeasurement)
    assertArrayEmpty(rest)
    return measurements

    function getMostRecent() {
      return trx.with(
        'ranked_findings',
        (qb) =>
          baseQuery(qb)
            .where('patient_records.patient_id', '=', patient_id)
            .where(
              'patient_records.specific_snomed_concept_id',
              'in',
              snomed_concept_ids!,
            )
            .$if(!!patient_encounter_id, (qb) =>
              qb.where(
                'patient_records.patient_encounter_id',
                '=',
                patient_encounter_id!,
              ))
            .$if(!!excluding_patient_encounter_id, (qb) =>
              qb.where(
                'patient_records.patient_encounter_id',
                '!=',
                excluding_patient_encounter_id!,
              ))
            .select(
              sql`ROW_NUMBER() OVER (PARTITION BY patient_records.specific_snomed_concept_id ORDER BY patient_records.created_at DESC)`
                .as('rank'),
            )
            .orderBy('patient_records.created_at', 'desc'),
      ).selectFrom('ranked_findings')
        .where('ranked_findings.rank', '=', 1)
        .selectAll('ranked_findings')
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
        ]).execute()
    }
  },

  async getMostRecentAssessments(
    trx: TrxOrDb,
    {
      health_worker_id,
      patient_id,
      patient_encounter_id,
      excluding_patient_encounter_id,
      snomed_concept_ids,
    }: {
      health_worker_id: string
      patient_id: string
      patient_encounter_id?: string
      excluding_patient_encounter_id?: string
      snomed_concept_ids: string[]
    },
  ): Promise<RenderedFindingRelativeToHealthWorker[]> {
    return (await getMostRecent()).map(formatRecord)

    function getMostRecent() {
      return trx.with(
        'ranked_findings',
        (qb) =>
          baseQuery(qb)
            .innerJoin(
              'patient_evaluations',
              'patient_evaluations.evaluates_record_id',
              'patient_findings.id',
            )
            .innerJoin(
              'patient_records as evaluation_records',
              'evaluation_records.id',
              'patient_evaluations.id',
            )
            .where('patient_records.patient_id', '=', patient_id)
            .where(
              'evaluation_records.specific_snomed_concept_id',
              'in',
              snomed_concept_ids,
            )
            .$if(!!patient_encounter_id, (qb) =>
              qb.where(
                'patient_records.patient_encounter_id',
                '=',
                patient_encounter_id!,
              ))
            .$if(!!excluding_patient_encounter_id, (qb) =>
              qb.where(
                'patient_records.patient_encounter_id',
                '!=',
                excluding_patient_encounter_id!,
              ))
            .select(
              sql`ROW_NUMBER() OVER (PARTITION BY evaluation_records.specific_snomed_concept_id ORDER BY patient_records.created_at DESC)`
                .as('rank'),
            )
            .orderBy('patient_records.created_at', 'desc'),
      ).selectFrom('ranked_findings')
        .where('ranked_findings.rank', '=', 1)
        .selectAll('ranked_findings')
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
        ]).execute()
    }
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
