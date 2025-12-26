import {
  IdSelection,
  PreviouslyCompletedProcedures,
  RenderedVitalMeasurement,
  TrxOrDb,
} from '../../types.ts'
import {
  blankSelection,
  debugLog,
  jsonObjectFrom,
  literalString,
  success_true,
} from '../helpers.ts'
import generateUUID from '../../util/uuid.ts'
import { QueryCreator, sql } from 'kysely'
import { base } from './_base.ts'
import { assert } from 'std/assert/assert.ts'
import { DB } from '../../db.d.ts'
import { satisfyingSExpression } from './s_expression.ts'
import { patient_findings } from './patient_findings.ts'
import * as patient_encounter_employees from './patient_encounter_employees.ts'
import { buildValueDisplay } from '../../shared/patient_records.ts'
import assertLength from '../../util/assertLength.ts'
import { ParsedExpressionOf } from '../../shared/s_expression.ts'
import { assertArrayNonEmpty } from '../../util/arraySize.ts'

export const MEASUREMENT_FINDING_SNOMED_CONCEPT_ID = '118245000' // |Measurement finding (finding)|

type MeasurementInsert = {
  patient_id: string
  patient_encounter_id: string
  patient_encounter_employee_id: string
  employment_id: string
  workflow_snomed_concept_id: string
  workflow_step_snomed_concept_id: string | null
  previously_completed_procedures: PreviouslyCompletedProcedures
  measurement_equality: ParsedExpressionOf<'='>
}

export function baseQuery(
  trx: TrxOrDb | QueryCreator<DB>,
) {
  return patient_findings.baseQuery(trx)
    .innerJoin(
      'patient_measurements',
      'patient_findings.id',
      'patient_measurements.id',
    )
    .select([
      'patient_measurements.value',
      'patient_measurements.units',
    ])
}

export const patient_measurements = base({
  top_level_table: 'patient_findings',
  baseQuery,
  formatResult: (measurement) => ({
    ...measurement,
    ...buildValueDisplay(measurement),
  }),
  handleSearch(
    qb,
    opts: {
      search?: string
      patient_id?: string | IdSelection
      patient_encounter_id?: string | IdSelection
    },
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
    if (opts.patient_encounter_id) {
      qb = qb.where(
        'patient_records.patient_encounter_id',
        '=',
        opts.patient_encounter_id,
      )
    }

    return qb
  },
  insertOneNested(
    trx: TrxOrDb,
    {
      patient_id,
      patient_encounter_id,
      patient_encounter_employee_id,
      employment_id,
      workflow_snomed_concept_id,
      workflow_step_snomed_concept_id,
      previously_completed_procedures,
      measurement_equality: {
        left: { snomed_concept_id },
        right: units,
      },
    }: MeasurementInsert,
  ) {
    assert(units.atom === 'units')

    const previously_completed_procedure_record_id =
      workflow_step_snomed_concept_id
        ? previously_completed_procedures.workflow_step_record_id
        : previously_completed_procedures.workflow_record_id

    const procedure_id = previously_completed_procedure_record_id ||
      generateUUID()

    const measurement_id = generateUUID()

    return trx.with(
      'inserting_procedure_record',
      (qb) =>
        !previously_completed_procedure_record_id
          ? qb.insertInto('patient_records')
            .values({
              id: procedure_id,
              patient_id,
              patient_encounter_id,
              snomed_concept_id: workflow_step_snomed_concept_id ||
                workflow_snomed_concept_id,
            })
          : blankSelection(qb),
    ).with(
      'inserting_procedure',
      (qb) =>
        !previously_completed_procedure_record_id
          ? qb.insertInto('patient_procedures')
            .values({
              id: procedure_id,
              employment_id,
              by_system: false,
            })
          : blankSelection(qb),
    ).with('inserting_finding_records', (qb) =>
      qb.insertInto('patient_records')
        .values({
          id: measurement_id,
          patient_id,
          patient_encounter_id,
          snomed_concept_id: MEASUREMENT_FINDING_SNOMED_CONCEPT_ID,
          value_snomed_concept_id: null,
        })).with('inserting_findings', (qb) =>
        qb.insertInto('patient_findings')
          .values({
            id: measurement_id,
            procedure_id,
            patient_encounter_employee_id,
            finding_snomed_concept_id: snomed_concept_id,
          }))
      .with(
        'inserting_measurements',
        (qb) =>
          qb.insertInto('patient_measurements')
            .values({
              id: measurement_id,
              value: units.value,
              units: units.units,
            }),
      )
      .selectNoFrom([
        success_true,
        sql<true>`true`.as('inserted_new'),
        literalString(measurement_id).as('record_id'),
        literalString(procedure_id).as('procedure_id'),
      ])
      .executeTakeFirstOrThrow()
  },
  async insertOneIfNotAlreadyExistsForThisEncounter(
    trx: TrxOrDb,
    {
      patient_id,
      patient_encounter_id,
      patient_encounter_employee_id,
      employment_id,
      workflow_snomed_concept_id,
      workflow_step_snomed_concept_id,
      previously_completed_procedures,
      measurement_equality,
    }: MeasurementInsert,
  ) {
    const already_exists = await satisfyingSExpression(
      trx,
      {
        patient_id,
        patient_encounter_id,
        s_expression: measurement_equality,
      },
    )

    if (already_exists.satisfies) {
      return {
        success: true,
        inserted_new: false,
        record_id: already_exists.record_ids[0],
      }
    }

    return patient_measurements.insertOneNested(trx, {
      patient_id,
      patient_encounter_id,
      patient_encounter_employee_id,
      employment_id,
      workflow_snomed_concept_id,
      workflow_step_snomed_concept_id,
      previously_completed_procedures,
      measurement_equality,
    })
  },
  async getMostRecent(
    trx: TrxOrDb,
    { health_worker_id, patient_id, snomed_concept_ids }: {
      health_worker_id: string
      patient_id: string
      snomed_concept_ids: string[]
    },
  ): Promise<RenderedVitalMeasurement[]> {
    assertArrayNonEmpty(snomed_concept_ids)

    const query = trx.with(
      'ranked_findings',
      (qb) =>
        baseQuery(qb)
          .where('patient_records.patient_id', '=', patient_id)
          .where(
            'patient_measurements.id',
            'in',
            trx.selectFrom('patient_record_qualifiers')
              .innerJoin(
                'patient_records',
                'patient_records.id',
                'patient_record_qualifiers.id',
              )
              .where(
                'patient_records.snomed_concept_id',
                'in',
                snomed_concept_ids,
              )
              .select('patient_record_qualifiers.qualifies_record_id'),
          )
          .select(
            sql`ROW_NUMBER() OVER (PARTITION BY patient_records.snomed_concept_id ORDER BY patient_records.created_at DESC)`
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

    console.log({ z: 'welkwlekklewlkew', findings })

    return findings.map((finding) => ({
      ...finding,
      ...buildValueDisplay(finding),
    }))
  },
})
