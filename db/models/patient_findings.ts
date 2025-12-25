import { IdSelection, TrxOrDb } from '../../types.ts'
import {
  asText,
  jsonBuildObject,
  literalString,
  success_true,
} from '../helpers.ts'
import generateUUID from '../../util/uuid.ts'
import {
  patient_records,
  RECORD_NOW_INVALID_CONCEPT_ID,
} from './patient_records.ts'
import { QueryCreator, sql } from 'kysely'
import { base } from './_base.ts'
import { assert } from 'std/assert/assert.ts'
import { DB } from '../../db.d.ts'
import { ParsedExpressionOf } from '../../shared/s_expression.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { buildExpression, satisfyingSExpression } from './s_expression.ts'
import { exists } from '../../util/exists.ts'
import { Priority } from '../../shared/priorities.ts'

export const YES_QUALIFIER_SNOMED_CONCEPT_ID = '373066001' // |Yes (qualifier value)|
export const NO_QUALIFIER_SNOMED_CONCEPT_ID = '373067005' // |No (qualifier value)|
export const UNKNOWN_QUALIFIER_SNOMED_CONCEPT_ID = '261665006' // |Unknown (qualifier value)|
export const NO_KNOWN_QUALIFIER_SNOMED_CONCEPT_ID = '1381510001' // |No known (qualifier value)|
export const ACTIVE_QUALIFIER_SNOMED_CONCEPT_ID = '55561003' // |Active (qualifier value)|
export const STATUS_ATTRIBUTE_SNOMED_CONCEPT_ID = '263490005'
export const SELF_REPORTED_QUALIFIER_SNOMED_CONCEPT_ID = '1156040003' // |Self reported (qualifier value)|
export const CLINICAL_FINDING_SNOMED_CONCEPT_ID = '404684003' // |Clinical finding (finding)|

type FindingInsert = {
  patient_id: string
  patient_encounter_id: string
  patient_encounter_employee_id: string
  procedure_id: string
  finding: ParsedExpressionOf<'finding'>
}

export function baseQuery(
  trx: TrxOrDb | QueryCreator<DB>,
) {
  return patient_records.baseQuery(trx)
    .innerJoin(
      'patient_findings',
      'patient_findings.id',
      'patient_records.id',
    )
    .innerJoin(
      'patient_procedures',
      'patient_findings.procedure_id',
      'patient_procedures.id',
    )
    .innerJoin(
      'patient_records as patient_procedure_records',
      'patient_procedures.id',
      'patient_procedure_records.id',
    )
    .innerJoin(
      'snomed_inferred_canonical_name_and_category as patient_procedure_snomed_inferred_canonical_name_and_category',
      'patient_procedure_records.snomed_concept_id',
      'patient_procedure_snomed_inferred_canonical_name_and_category.id',
    )
    .select((eb) => [
      literalString('finding').$castTo<'finding'>().as('type'),
      'patient_findings.patient_encounter_employee_id',

      jsonBuildObject({
        record_id: eb.ref('patient_procedure_records.id'),
        snomed_concept_id: asText(
          eb,
          'patient_procedure_records.snomed_concept_id',
        ),
        name: eb.ref(
          'patient_procedure_snomed_inferred_canonical_name_and_category.name',
        ),
      }).as('as_part_of_procedure'),

      eb.selectFrom('patient_triage_level')
        .innerJoin(
          'patient_records as triage_patient_records',
          'patient_triage_level.id',
          'triage_patient_records.id',
        )
        .innerJoin(
          'patient_evaluations as triage_evaluations',
          'patient_triage_level.id',
          'triage_evaluations.id',
        )
        .innerJoin(
          'snomed_inferred_canonical_name_and_category as triage_snomed_inferred_canonical_name_and_category',
          'triage_patient_records.value_snomed_concept_id',
          'triage_snomed_inferred_canonical_name_and_category.id',
        )
        .whereRef(
          'triage_evaluations.evaluates_record_id',
          '=',
          'patient_records.id',
        )
        .where(
          (eb_patient_triage_level) =>
            eb_patient_triage_level(
              'triage_patient_records.id',
              'not in',
              eb_patient_triage_level.selectFrom(
                'patient_records as now_invalid_patient_records',
              ).innerJoin(
                'patient_evaluations as now_invalid_patient_evaluations',
                'now_invalid_patient_records.id',
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
        .select('triage_snomed_inferred_canonical_name_and_category.name')
        .$castTo<Priority | null>()
        .as('priority'),
    ])
}

type PatientFindingsSearch = {
  patient_id: string | IdSelection
  patient_encounter_id?: string | IdSelection
  s_expression?: string | ParsedExpressionOf<'finding'>
  search?: string
}

export const patient_findings = base({
  top_level_table: 'patient_findings',
  baseQuery,
  formatResult: (x) => x,
  handleSearch(
    qb,
    opts: PatientFindingsSearch,
    trx,
  ) {
    assert(!opts.search, 'TODO support')
    assert(
      opts.patient_id,
      'For now, you must always provide a patient_id as part of a query',
    )
    // if (opts.search) {
    //   qb = qb.where(
    //     'snomed_inferred_canonical_name_and_category.name',
    //     'ilike',
    //     `%${opts.search}%`,
    //   )
    // }
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
      patient_encounter_id,
      patient_encounter_employee_id,
      procedure_id,
      finding,
    }: FindingInsert,
  ) {
    const finding_id = generateUUID()

    let query = trx.with(
      'inserting_finding_records',
      (qb) =>
        qb.insertInto('patient_records')
          .values({
            id: finding_id,
            patient_id,
            patient_encounter_id,
            snomed_concept_id: exists(finding.snomed_concept_id),
            value_snomed_concept_id: finding.value_snomed_concept_id,
          }),
    ).with('inserting_findings', (qb) =>
      qb.insertInto('patient_findings')
        .values({
          id: finding_id,
          procedure_id,
          patient_encounter_employee_id,
        }))

    function qualifierCte(
      qb: typeof query,
      qualifier:
        | ParsedExpressionOf<'qualifier'>
        | ParsedExpressionOf<'not_qualifier'>,
      qualifies_record_id: string,
    ) {
      if (qualifier.atom !== 'qualifier') {
        assertEquals(
          qualifier.atom,
          'not_qualifier',
          'we can omit not_qualifier expressions upon insert, but not sure what is going on here',
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

    for (const qualifier of finding.qualifiers) {
      query = qualifierCte(query, qualifier, finding_id)
    }

    return query
      .selectNoFrom([
        success_true,
        sql<true>`true`.as('inserted_new'),
        literalString(finding_id).as('record_id'),
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
      finding,
    }: FindingInsert,
  ) {
    const already_exists = await satisfyingSExpression(
      trx,
      {
        patient_id,
        patient_encounter_id,
        s_expression: finding,
      },
    )

    if (already_exists.satisfies) {
      return {
        success: true,
        inserted_new: false,
        record_id: already_exists.record_ids[0],
      }
    }

    return patient_findings.insertOneNested(trx, {
      patient_id,
      patient_encounter_id,
      patient_encounter_employee_id,
      procedure_id,
      finding,
    })
  },
  CLINICAL_FINDING_SNOMED_CONCEPT_ID,
  STATUS_ATTRIBUTE_SNOMED_CONCEPT_ID,
  SELF_REPORTED_QUALIFIER_SNOMED_CONCEPT_ID,
  QUALIFIERS_BY_EXISTENCE: {
    Yes: YES_QUALIFIER_SNOMED_CONCEPT_ID,
    No: NO_QUALIFIER_SNOMED_CONCEPT_ID,
    Unknown: UNKNOWN_QUALIFIER_SNOMED_CONCEPT_ID,
  },
})
