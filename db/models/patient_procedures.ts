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
import generateUUID from '../../util/uuid.ts'
import { formatRecordDisplay } from '../../shared/patient_records.ts'
import { satisfyingSExpression } from './s_expression.ts'
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
    ...formatRecordDisplay(procedure),
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

    return patient_records.baseInsert(
      trx,
      {
        patient_id,
        patient_encounter_id,
        record_id: procedure_id,
        ...procedure,
      },
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
      .selectNoFrom([
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
