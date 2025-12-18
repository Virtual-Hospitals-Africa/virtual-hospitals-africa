import { assert } from 'std/assert/assert.ts'
import { sql } from 'kysely'
import {
  IdSelection,
  PreviouslyCompletedProcedures,
  RenderedFindingQualifierRelativeToHealthWorker,
  TrxOrDb,
} from '../../types.ts'
import { jsonArrayFrom, literalString, success_true } from '../helpers.ts'
import { base } from './_base.ts'
import { patient_record_qualifiers } from './patient_record_qualifiers.ts'
import { RECORD_NOW_INVALID_CONCEPT_ID } from './patient_records.ts'
import {
  ParsedExpression,
  ParsedProcedureExpression,
} from '../../shared/s_expression.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import generateUUID from '../../util/uuid.ts'
import { buildValueDisplay } from '../../shared/patient_records.ts'

type ProcedureInsert =
  & {
    patient_id: string
    patient_encounter_id: string
    procedure: ParsedProcedureExpression
  }
  & (
    {
      employment_id: string
      by_system?: never
    } | {
      employment_id?: never
      by_system: true
    }
  )

export function baseQuery(
  trx: TrxOrDb,
) {
  return trx.selectFrom('patient_procedures')
    .innerJoin(
      'patient_records',
      'patient_procedures.id',
      'patient_records.id',
    )
    .innerJoin(
      'snomed_inferred_canonical_name_and_category',
      'patient_records.snomed_concept_id',
      'snomed_inferred_canonical_name_and_category.id',
    )
    .leftJoin(
      'snomed_inferred_canonical_name_and_category as value_snomed_inferred_canonical_name_and_category',
      'patient_records.value_snomed_concept_id',
      'value_snomed_inferred_canonical_name_and_category.id',
    )
    .select((eb) => [
      'patient_records.id as record_id',
      'patient_records.created_at',
      'patient_records.snomed_concept_id',
      'patient_records.patient_encounter_id',
      // 'patient_findings.patient_encounter_employee_id',
      'snomed_inferred_canonical_name_and_category.name',

      'patient_records.value_snomed_concept_id',
      'value_snomed_inferred_canonical_name_and_category.name as value_name',

      jsonArrayFrom(
        patient_record_qualifiers.baseQuery(trx, 'qualifiers_1' as const)
          .where(
            'qualifiers_1.qualifies_record_id',
            '=',
            eb.ref('patient_records.id'),
          )
          .select((eb_qualifiers1) => [
            jsonArrayFrom(
              patient_record_qualifiers.baseQuery(trx, 'qualifiers_2' as const)
                .where(
                  'qualifiers_2.qualifies_record_id',
                  '=',
                  eb_qualifiers1.ref('qualifiers_1.record_id'),
                )
                .select((_eb_qualifiers2) => [
                  // At max depth, just return an empty array
                  sql<
                    RenderedFindingQualifierRelativeToHealthWorker[]
                  >`ARRAY[]::int[]`.as(
                    'qualifiers',
                  ),
                ]),
            ).as('qualifiers'),
          ]),
      ).as('qualifiers'),
    ])
    .where(
      (eb) =>
        eb(
          'patient_records.id',
          'not in',
          eb.selectFrom(
            'patient_records as now_invalid_patient_records',
          ).innerJoin(
            'patient_evaluations as now_invalid_patient_evaluations',
            'now_invalid_patient_evaluations.id',
            'now_invalid_patient_evaluations.id',
          ).where(
            'now_invalid_patient_records.snomed_concept_id',
            'in',
            RECORD_NOW_INVALID_CONCEPT_ID,
          )
            .select('now_invalid_patient_evaluations.evaluates_record_id')
            .distinct(),
        ),
    )
}

export const patient_procedures = base({
  top_level_table: 'patient_procedures',
  baseQuery,
  formatResult: (procedure) => ({
    ...procedure,
    value_display: buildValueDisplay(procedure),
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
  async previouslyCompleted(
    trx: TrxOrDb,
    {
      patient_encounter_id,
      workflow_snomed_concept_id,
      workflow_step_snomed_concept_id,
    }: {
      patient_encounter_id: string
      workflow_snomed_concept_id: string
      workflow_step_snomed_concept_id: string | null
    },
  ): Promise<PreviouslyCompletedProcedures> {
    const search_for_concept_ids = workflow_step_snomed_concept_id
      ? [workflow_step_snomed_concept_id, workflow_snomed_concept_id]
      : [workflow_snomed_concept_id]

    const procedures = await trx.selectFrom('patient_procedures')
      .innerJoin(
        'patient_records',
        'patient_procedures.id',
        'patient_records.id',
      )
      .where('snomed_concept_id', 'in', search_for_concept_ids)
      .where('patient_encounter_id', '=', patient_encounter_id)
      .select([
        'patient_records.id',
        'patient_records.snomed_concept_id',
      ])
      .execute()

    const workflow_procedure = procedures.find((p) =>
      p.snomed_concept_id === workflow_snomed_concept_id
    )
    const workflow_step_procedure = procedures.find((p) =>
      p.snomed_concept_id === workflow_step_snomed_concept_id
    )

    return {
      workflow_record_id: workflow_procedure?.id || null,
      workflow_step_record_id: workflow_step_procedure?.id || null,
    }
  },

  insertOneNested(
    trx: TrxOrDb,
    {
      patient_id,
      patient_encounter_id,
      procedure,
      employment_id,
      by_system,
    }: ProcedureInsert,
  ) {
    const procedure_id = generateUUID()

    let query = trx.with(
      'inserting_procedure_record',
      (qb) =>
        qb.insertInto('patient_records')
          .values({
            id: procedure_id,
            patient_id,
            patient_encounter_id,
            snomed_concept_id: procedure.snomed_concept_id,
            value_snomed_concept_id: procedure.value_snomed_concept_id,
          }),
    ).with(
      'inserting_procedure',
      (qb) =>
        qb.insertInto('patient_procedures')
          .values({
            id: procedure_id,
            employment_id,
            by_system: by_system || false,
          }),
    )

    function qualifierCte(
      qb: typeof query,
      qualifier: ParsedExpression,
      qualifies_record_id: string,
    ) {
      if (qualifier.type !== 'qualifier') {
        assertEquals(
          qualifier.type,
          'not',
          'we can omit not expressions upon insert, but not sure what is going on here',
        )
        return qb
      }
      const id = generateUUID()
      const id_token = id.replaceAll('-', '_')

      let next_query = qb.with(
        `inserting_qualifier_record_${id_token}`,
        (qb) =>
          qb.insertInto('patient_records')
            .values({
              id,
              patient_id,
              patient_encounter_id,
              snomed_concept_id: qualifier.snomed_concept_id,
              value_snomed_concept_id: qualifier.value_snomed_concept_id,
            }),
      ).with(
        `inserting_qualifiers_${id_token}`,
        (qb) =>
          qb.insertInto('patient_record_qualifiers')
            .values({
              id,
              qualifies_record_id,
            }),
      ) as unknown as typeof query

      for (const sub_qualifier of qualifier.qualifiers) {
        next_query = qualifierCte(
          next_query,
          sub_qualifier,
          id,
        ) as unknown as typeof query
      }

      return next_query
    }

    for (const qualifier of procedure.qualifiers) {
      query = qualifierCte(query, qualifier, procedure_id)
    }

    return query.selectNoFrom([
      success_true,
      sql<true>`true`.as('inserted_new'),
      literalString(procedure_id).as('procedure_id'),
    ])
      .executeTakeFirstOrThrow()
  },
})
