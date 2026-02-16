import { IdSelection, InsertRows, TrxOrDb, TrxOrDbOrQueryCreator } from '../../types.ts'
import { arrayAggIds, literalString, success_true } from '../helpers.ts'
import generateUUID from '../../util/uuid.ts'
import { sql } from 'kysely'
import { base } from './_base.ts'
import { assert } from 'std/assert/assert.ts'
import { buildExpression, satisfyingSExpression, snomedConceptBase } from './s_expression.ts'
import { baseQuery as findingsBaseQuery } from './patient_findings.ts'
import { formatRecord } from '../../shared/patient_records.ts'
import { Comparisons, Lang } from '../../shared/s_expression_schemas.ts'
import { isMeasurement } from '../../shared/vitals.ts'
import { MEASUREMENT_FINDING } from '../../shared/snomed_concepts.ts'
import { baseInsertMany } from './patient_records.ts'

type MeasurementInsert = {
  patient_id: string
  procedure_id: string
  patient_encounter_id: string
  patient_encounter_employee_id: string
  measurement_id?: string
  measurement_comparison: Lang[Comparisons]
}

type MeasurementsInsert = {
  patient_id: string
  procedure_id: string
  patient_encounter_id: string
  patient_encounter_employee_id: string
  measurements: Array<{
    measurement_id?: string
    measurement_comparison: Lang[Comparisons]
  }>
}

export function baseQuery(
  trx: TrxOrDbOrQueryCreator,
  opts: { search?: string; patient_id?: string | IdSelection; patient_encounter_id?: string | IdSelection; s_expression?: string },
) {
  return findingsBaseQuery(trx)
    .innerJoin(
      'patient_measurements',
      'patient_findings.id',
      'patient_measurements.id',
    )
    .$if(!!opts.patient_id, (qb) => qb.where('patient_records_aggregated.patient_id', '=', opts.patient_id!))
    .$if(!!opts.patient_encounter_id, (qb) => qb.where('patient_records_aggregated.patient_encounter_id', '=', opts.patient_encounter_id!))
    .$if(!!opts.s_expression, (qb) =>
      qb.where(
        'patient_records_aggregated.id',
        'in',
        buildExpression(
          trx,
          {
            patient_id: opts.patient_id,
            patient_encounter_id: opts.patient_encounter_id,
          },
          opts.s_expression!,
        ),
      ))
}

export const patient_measurements = base({
  top_level_table: 'patient_findings',
  baseQuery,
  formatResult(measurement) {
    const formatted = formatRecord(measurement)
    assert(isMeasurement(formatted))
    return formatted
  },
  insertMany(
    trx: TrxOrDb,
    {
      patient_id,
      procedure_id,
      patient_encounter_id,
      patient_encounter_employee_id,
      measurements,
    }: MeasurementsInsert,
  ) {
    if (measurements.length === 0) {
      throw new Error('insertMany requires at least one measurement')
    }

    // Parse measurements and generate IDs
    const records = measurements.map(({ measurement_id = generateUUID(), measurement_comparison }) => {
      const { left: { snomed_concept, units }, right: value } = measurement_comparison
      return {
        patient_id,
        patient_encounter_id,
        record_id: measurement_id,
        root_snomed_concept: { atom: 'snomed_concept' as const, ...MEASUREMENT_FINDING } as Lang['snomed_concept'],
        specific_snomed_concept: snomed_concept,
        value_snomed_concept: null,
        units,
        value: value.toFixed(),
      }
    })

    const measurement_values: InsertRows<'patient_measurements'> = records.map(({ record_id, units, value }) => ({
      id: record_id,
      units,
      value,
    }))

    return baseInsertMany(trx, records)
      .with(
        'inserting_findings',
        (qb) =>
          qb.insertInto('patient_findings').values(
            records.map(({ record_id }) => ({
              id: record_id,
              procedure_id,
              patient_encounter_employee_id,
            })),
          ),
      )
      .with(
        'inserting_measurements',
        (qb) => qb.insertInto('patient_measurements').values(measurement_values),
      )
      .selectFrom('inserting_records')
      .select((eb) => [
        success_true,
        arrayAggIds(eb.ref('inserting_records.id')).as('measurement_ids'),
      ])
      .executeTakeFirstOrThrow()
  },
  insertOneNested(
    trx: TrxOrDb,
    {
      patient_id,
      procedure_id,
      patient_encounter_id,
      patient_encounter_employee_id,
      measurement_id = generateUUID(),
      measurement_comparison: {
        left: { snomed_concept, units },
        right: value,
      },
    }: MeasurementInsert,
  ) {
    return trx.with(
      'inserting_finding_records',
      (qb) =>
        qb.insertInto('patient_records')
          .values({
            id: measurement_id,
            patient_id,
            patient_encounter_id,
            root_snomed_concept_id: MEASUREMENT_FINDING.id,
            specific_snomed_concept_id: snomedConceptBase(trx, snomed_concept),
            value_snomed_concept_id: null,
          }),
    ).with('inserting_findings', (qb) =>
      qb.insertInto('patient_findings')
        .values({
          id: measurement_id,
          procedure_id,
          patient_encounter_employee_id,
        }))
      .with(
        'inserting_measurements',
        (qb) =>
          qb.insertInto('patient_measurements')
            .values({
              id: measurement_id,
              units,
              value: value.toFixed(),
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
      measurement_comparison,
    }: Omit<MeasurementInsert, 'measurement_id'>,
  ) {
    const already_exists = await satisfyingSExpression(
      trx,
      {
        patient_id,
        patient_encounter_id,
        s_expression: measurement_comparison,
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
      measurement_comparison,
    })
  },
})
