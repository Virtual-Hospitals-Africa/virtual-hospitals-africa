import {
  IdSelection,
  MostRecentVitalMeasurement,
  PreviouslyCompletedProcedures,
  TrxOrDb,
} from '../../types.ts'
import {
  blankSelection,
  jsonArrayFrom,
  jsonObjectFrom,
  literalString,
  success_true,
} from '../helpers.ts'
import generateUUID from '../../util/uuid.ts'
import { QueryCreator, sql } from 'kysely'
import { base } from './_base.ts'
import { assert } from 'std/assert/assert.ts'
import { DB } from '../../db.d.ts'
import { ParsedComparatorExpression } from '../../shared/s_expression.ts'
import { satisfyingSExpression } from './s_expression.ts'
import { patient_findings } from './patient_findings.ts'
import * as patient_encounter_employees from './patient_encounter_employees.ts'
import { buildValueDisplay } from '../../shared/patient_records.ts'
import assertLength from '../../util/assertLength.ts'

export const MEASUREMENT_FINDING_SNOMED_CONCEPT_ID = '118245000' // |Measurement finding (finding)|

type MeasurementInsert = {
  patient_id: string
  patient_encounter_id: string
  patient_encounter_employee_id: string
  employment_id: string
  workflow_snomed_concept_id: string
  workflow_step_snomed_concept_id: string | null
  previously_completed_procedures: PreviouslyCompletedProcedures
  measurement_equality: ParsedComparatorExpression<'='>
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

function valueDisplay(
  { value, units }: { value: string | number; units: string },
): string {
  switch (units) {
    case '°C':
    case '%':
      return `${value}${units}`
    default:
      return `${value} ${units}`
  }
}

export const patient_measurements = base({
  top_level_table: 'patient_findings',
  baseQuery,
  formatResult: (
    { value_name, value_snomed_concept_id, ...measurement_intermediate },
  ) => {
    assert(!value_name)
    assert(!value_snomed_concept_id)
    assertLength(measurement_intermediate.qualifiers, 1)

    return {
      ...measurement_intermediate,
      value_display: buildValueDisplay({
        ...measurement_intermediate,
        value_name: valueDisplay(measurement_intermediate),
      }),
    }
  },
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
    assert(units.type === 'units')

    const previously_completed_procedure_record_id =
      workflow_step_snomed_concept_id
        ? previously_completed_procedures.workflow_step_record_id
        : previously_completed_procedures.workflow_record_id

    const procedure_id = previously_completed_procedure_record_id ||
      generateUUID()

    const measurement_id = generateUUID()
    const qualifier_id = generateUUID()

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
      ).with(
        `inserting_qualifier_record`,
        (qb) =>
          qb.insertInto('patient_records')
            .values({
              id: qualifier_id,
              patient_id,
              patient_encounter_id,
              snomed_concept_id,
            }),
      ).with(
        `inserting_qualifier`,
        (qb) =>
          qb.insertInto('patient_record_qualifiers')
            .values({
              id: qualifier_id,
              qualifies_record_id: measurement_id,
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
    { patient_id, snomed_concept_ids }: {
      patient_id: string
      snomed_concept_ids: string[]
    },
  ): Promise<MostRecentVitalMeasurement[]> {
    const findings = await trx.with(
      'ranked_findings',
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
          .$if(!!snomed_concept_ids.length, (qb) =>
            qb.where(
              'patient_records.snomed_concept_id',
              'in',
              snomed_concept_ids,
            ))
          .orderBy('patient_records.created_at', 'desc')
          .selectAll('patient_records')
          .select([
            'patient_findings.patient_encounter_employee_id',
            'patient_findings.procedure_id',
          ])
          .select([
            'patient_measurements.value',
            'patient_measurements.units',
          ])
          .select(
            sql`ROW_NUMBER() OVER (PARTITION BY snomed_concept_id ORDER BY created_at DESC)`
              .as('rank'),
          ),
    ).selectFrom('ranked_findings')
      .where('ranked_findings.rank', '=', 1)
      .select([
        'ranked_findings.id as finding_id',
        'ranked_findings.snomed_concept_id',
        'ranked_findings.value',
        'ranked_findings.units',
        'ranked_findings.created_at',
        'ranked_findings.patient_encounter_id',
      ])
      .select(sql<'manual'>`'manual'`.as('finding_type'))
      .select((eb) => [
        jsonObjectFrom(
          patient_encounter_employees.baseQuery(trx)
            .where(
              'patient_encounter_employees.id',
              '=',
              eb.ref('ranked_findings.patient_encounter_employee_id'),
            ),
        ).$notNull().as('provider'),
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
              sql<string | null>`null`.as('note'),
            ])
            .whereRef(
              'ranked_findings.id',
              '=',
              'patient_evaluations.evaluates_record_id',
            ),
        ).as('evaluations'),
      ])
      .execute()

    return findings.map(({ value, units, ...finding }) => ({
      ...finding,
      value_display: valueDisplay(
        { value, units },
      ),
    }))
  },
})
