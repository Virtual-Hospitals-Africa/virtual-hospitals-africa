import { assert } from 'std/assert/assert.ts'
import { sql } from 'kysely'
import {
  IdSelection,
  PreviouslyCompletedProcedures,
  TrxOrDb,
} from '../../types.ts'
import { literalString, success_true } from '../helpers.ts'
import { base } from './_base.ts'
import { patient_records } from './patient_records.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import generateUUID from '../../util/uuid.ts'
import { buildValueDisplay } from '../../shared/patient_records.ts'
import {
  maybeSnomedConceptBase,
  satisfyingSExpression,
  snomedConceptBase,
} from './s_expression.ts'
import assertHasProperty from '../../util/assertHasProperty.ts'
import { Lang } from '../../shared/s_expression_schemas.ts'

type ProcedureInsert =
  & {
    patient_id: string
    patient_encounter_id: string
    procedure: Lang['procedure']
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
  return patient_records.baseQuery(trx)
    .innerJoin(
      'patient_procedures',
      'patient_procedures.id',
      'patient_records.id',
    )
    .select([
      literalString('procedure').$castTo<'procedure'>().as('type'),
      'patient_procedures.by_system',
      'patient_procedures.employment_id',
    ])
}

export const patient_procedures = base({
  top_level_table: 'patient_procedures',
  baseQuery,
  formatResult: (procedure) => ({
    ...procedure,
    ...buildValueDisplay(procedure),
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
    assertHasProperty(procedure, 'snomed_concept')
    const procedure_id = generateUUID()

    let query = trx.with(
      'inserting_procedure_record',
      (qb) =>
        qb.insertInto('patient_records')
          .values({
            id: procedure_id,
            patient_id,
            patient_encounter_id,
            snomed_concept_id: snomedConceptBase(trx, procedure.snomed_concept),
            value_snomed_concept_id: maybeSnomedConceptBase(
              trx,
              procedure.value_snomed_concept,
            ),
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
      qualifier: Lang['qualifier'],
      qualifies_record_id: string,
    ) {
      assertHasProperty(qualifier, 'snomed_concept')
      if (qualifier.atom !== 'qualifier') {
        assertEquals(
          qualifier.atom,
          'not_finding',
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
              snomed_concept_id: snomedConceptBase(
                trx,
                qualifier.snomed_concept,
              ),
              value_snomed_concept_id: maybeSnomedConceptBase(
                trx,
                qualifier.value_snomed_concept,
              ),
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
  async insertOneIfNotAlreadyExistsForThisEncounter(
    trx: TrxOrDb,
    to_insert: ProcedureInsert,
  ) {
    const already_exists = await satisfyingSExpression(
      trx,
      {
        patient_id: to_insert.patient_id,
        patient_encounter_id: to_insert.patient_encounter_id,
        s_expression: to_insert.procedure,
      },
    )

    if (already_exists.satisfies) {
      return {
        success: true,
        inserted_new: false,
        procedure_id: already_exists.record_ids[0],
      }
    }

    return patient_procedures.insertOneNested(trx, to_insert)
  },
})
