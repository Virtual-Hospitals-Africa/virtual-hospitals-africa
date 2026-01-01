import {
  IdSelection,
  RenderedVitalMeasurement,
  TrxOrDb,
  TrxOrDbOrQueryCreator,
} from '../../types.ts'
import { jsonBuildObject, jsonObjectFrom, literalString, success_true } from '../helpers.ts'
import generateUUID from '../../util/uuid.ts'
import { sql } from 'kysely'
import { base } from './_base.ts'
import { assert } from 'std/assert/assert.ts'
import {
  buildExpression,
  satisfyingSExpression,
  snomedConceptBase,
} from './s_expression.ts'
import { baseQuery as findingsBaseQuery } from './patient_findings.ts'
import * as patient_encounter_employees from './patient_encounter_employees.ts'
import { formatRecordDisplay } from '../../shared/patient_records.ts'
import { assertArrayNonEmpty } from '../../util/arraySize.ts'
import { Lang } from '../../shared/s_expression_schemas.ts'

export const MEASUREMENT_FINDING_SNOMED_CONCEPT_ID = '118245000' // |Measurement finding (finding)|

type MeasurementInsert = {
  patient_id: string
  procedure_id: string
  patient_encounter_id: string
  patient_encounter_employee_id: string
  measurement_id?: string
  measurement_equality: Lang['=']
}

export function baseQuery(
  trx: TrxOrDbOrQueryCreator,
) {
  return findingsBaseQuery(trx)
    .innerJoin(
      'patient_measurements',
      'patient_findings.id',
      'patient_measurements.id',
    )
    .select(eb => [
      jsonBuildObject({
        type: literalString('measurement' as const),
        value: eb.ref('patient_measurements.value'),
        units: eb.ref('patient_measurements.units'),
      }).as('value'),
    ])
}

export const patient_measurements = base({
  top_level_table: 'patient_findings',
  baseQuery,
  formatResult: formatRecordDisplay,
  handleSearch(
    qb,
    opts: {
      search?: string
      patient_id?: string | IdSelection
      patient_encounter_id?: string | IdSelection
      s_expression?: string
    },
    trx,
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
    if (opts.s_expression) {
      assert(opts.patient_id)
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
  insertOneNested(
    trx: TrxOrDb,
    {
      patient_id,
      procedure_id,
      patient_encounter_id,
      patient_encounter_employee_id,
      measurement_id = generateUUID(),
      measurement_equality: {
        left: { snomed_concept },
        right: units,
      },
    }: MeasurementInsert,
  ) {
    assert(units.atom === 'units')

    return trx.with(
      'inserting_finding_records',
      (qb) =>
        qb.insertInto('patient_records')
          .values({
            id: measurement_id,
            patient_id,
            patient_encounter_id,
            snomed_concept_id: MEASUREMENT_FINDING_SNOMED_CONCEPT_ID,
            value_snomed_concept_id: null,
          }),
    ).with('inserting_findings', (qb) =>
      qb.insertInto('patient_findings')
        .values({
          id: measurement_id,
          procedure_id,
          patient_encounter_employee_id,
          finding_snomed_concept_id: snomedConceptBase(trx, snomed_concept),
        }))
      .with(
        'inserting_measurements',
        (qb) =>
          qb.insertInto('patient_measurements')
            .values({
              id: measurement_id,
              units: units.units,
              value: units.value.toFixed(),
            }),
      )
      .selectNoFrom([
        success_true,
        sql<true>`true`.as('inserted_new'),
        literalString(measurement_id).as('measurement_id'),
      ])
      .executeTakeFirstOrThrow()
  },
  async insertOneIfNotAlreadyExistsForThisEncounter(
    trx: TrxOrDb,
    {
      patient_id,
      patient_encounter_id,
      patient_encounter_employee_id,
      procedure_id,
      measurement_equality,
    }: Omit<MeasurementInsert, 'measurement_id'>,
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
        measurement_id: already_exists.record_ids[0],
      }
    }

    return patient_measurements.insertOneNested(trx, {
      patient_id,
      patient_encounter_id,
      patient_encounter_employee_id,
      procedure_id,
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

    const findings = await query.execute()
    return findings.map(formatRecordDisplay)
  },
})
