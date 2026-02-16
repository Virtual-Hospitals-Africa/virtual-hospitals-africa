import { sql } from 'kysely'
import { PreviouslyCompletedProcedures, SnomedConcept, TrxOrDbOrQueryCreator } from '../../types.ts'
import { asText, blankSelection, caseWhenMatching, jsonBuildNullableObject, literalString, success_true } from '../helpers.ts'
import { base } from './_base.ts'
import { patient_records, PatientRecordsSearch } from './patient_records.ts'
import generateUUID from '../../util/uuid.ts'
import { formatRecord } from '../../shared/patient_records.ts'
import { satisfyingSExpression } from './s_expression.ts'
import assertHasProperty from '../../util/assertHasProperty.ts'
import { Lang } from '../../shared/s_expression_schemas.ts'
import { inverseSExpressions } from '../../shared/s_expression_inverse.ts'
import isObjectLike from '../../util/isObjectLike.ts'
import { SNOMED_CONCEPT_IDS_TO_WORKFLOW_NAMES } from '../../shared/workflow.ts'

type ProcedureInsert = {
  patient_id: string
  patient_encounter_id: string
  procedure: Lang['procedure']
  employment_id: string
}

export function baseQuery(
  trx: TrxOrDbOrQueryCreator,
  opts: PatientRecordsSearch,
) {
  return patient_records.baseQuery(trx, opts)
    .innerJoin(
      'patient_procedures',
      'patient_procedures.id',
      'patient_records_aggregated.id',
    )
    .leftJoin(
      'patient_records_aggregated as procedures_aggregated',
      'patient_procedures.as_part_of_procedure_id',
      'procedures_aggregated.id',
    )
    .select((eb) => [
      literalString('procedure').$castTo<'procedure'>().as('type'),
      'patient_procedures.employment_id',
      jsonBuildNullableObject(
        eb.ref('procedures_aggregated.id'),
        {
          id: eb.ref('procedures_aggregated.id').$notNull(),
          root_snomed_concept_id: asText(eb, 'procedures_aggregated.root_snomed_concept_id').$notNull(),
          root_snomed_concept_name: eb.ref('procedures_aggregated.root_snomed_concept_name').$notNull(),
          root_snomed_concept_category: eb.ref('procedures_aggregated.root_snomed_concept_category').$notNull(),
          specific_snomed_concept_id: asText(
            eb,
            'procedures_aggregated.specific_snomed_concept_id',
          ).$notNull(),
          specific_snomed_concept_name: eb.ref('procedures_aggregated.specific_snomed_concept_name').$notNull(),
          specific_snomed_concept_category: eb.ref('procedures_aggregated.specific_snomed_concept_category').$notNull(),
          workflow_step_name: caseWhenMatching(eb, eb.ref('procedures_aggregated.specific_snomed_concept_id').$notNull(), SNOMED_CONCEPT_IDS_TO_WORKFLOW_NAMES),
        },
      ).as('as_part_of_procedure'),
    ])
}

export const patient_procedures = base({
  top_level_table: 'patient_procedures',
  baseQuery,
  formatResult: formatRecord,
  async previouslyCompleted(
    trx: TrxOrDbOrQueryCreator,
    {
      patient_encounter_id,
      workflow_snomed_concept,
      workflow_step_snomed_concept,
    }: {
      patient_encounter_id: string
      workflow_snomed_concept: SnomedConcept
      workflow_step_snomed_concept: SnomedConcept | null
    },
  ): Promise<PreviouslyCompletedProcedures> {
    const search_for_concept_ids = workflow_step_snomed_concept ? [workflow_step_snomed_concept.id, workflow_snomed_concept.id] : [workflow_snomed_concept.id]

    const procedures = await trx.selectFrom('patient_procedures')
      .innerJoin(
        'patient_records',
        'patient_procedures.id',
        'patient_records.id',
      )
      .where('specific_snomed_concept_id', 'in', search_for_concept_ids)
      .where('patient_encounter_id', '=', patient_encounter_id)
      .select([
        'patient_records.id',
        'patient_records.specific_snomed_concept_id as snomed_concept_id',
      ])
      .execute()

    const workflow_procedure = procedures.find((p) => p.snomed_concept_id === workflow_snomed_concept.id)
    const workflow_step_procedure = procedures.find((p) => p.snomed_concept_id === workflow_step_snomed_concept?.id)

    return {
      workflow_record_id: workflow_procedure?.id || null,
      workflow_step_record_id: workflow_step_procedure?.id || null,
    }
  },

  insertOneNested(
    trx: TrxOrDbOrQueryCreator,
    {
      patient_id,
      employment_id,
      patient_encounter_id,
      procedure,
    }: ProcedureInsert,
  ) {
    assertHasProperty(procedure, 'root_snomed_concept')
    assertHasProperty(procedure, 'specific_snomed_concept')
    const procedure_id = generateUUID()

    return patient_records.baseInsert(
      trx,
      {
        patient_id,
        patient_encounter_id,
        record_id: procedure_id,
        value_snomed_concept: null,
        ...procedure,
      },
    ).with(
      'inserting_procedure',
      (qb) =>
        qb.insertInto('patient_procedures')
          .values({
            id: procedure_id,
            employment_id,
          }),
    )
      .with(
        'inserting_record_s_expression',
        (qb) =>
          Array.isArray(procedure.value)
            ? qb.insertInto('patient_record_s_expressions')
              .values({
                id: procedure_id,
                s_expression: inverseSExpressions(procedure.value),
              })
            : blankSelection(qb),
      )
      .with(
        'inserting_record_link',
        (qb) =>
          isObjectLike(procedure.value) && procedure.value.atom === 'link'
            ? qb.insertInto('patient_record_links')
              .values({
                id: procedure_id,
                title: procedure.value.title,
                href: procedure.value.href,
                thumbnail_href: procedure.value.thumbnail_href,
              })
            : blankSelection(qb),
      )
      .selectNoFrom([
        success_true,
        sql<true>`true`.as('inserted_new'),
        literalString(procedure_id).as('procedure_id'),
      ])
      .executeTakeFirstOrThrow()
  },

  // TODO: consider doing these in parallel
  async insertOneIfNotAlreadyExistsForThisEncounter(
    trx: TrxOrDbOrQueryCreator,
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
