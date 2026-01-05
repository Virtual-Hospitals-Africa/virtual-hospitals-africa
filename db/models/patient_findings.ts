import { IdSelection, TrxOrDb, TrxOrDbOrQueryCreator } from '../../types.ts'
import {
  asText,
  jsonBuildObject,
  literalString,
  success_true,
} from '../helpers.ts'
import generateUUID from '../../util/uuid.ts'
import { patient_records } from './patient_records.ts'
import { sql } from 'kysely'
import { base, QueryResult } from './_base.ts'
import { assert } from 'std/assert/assert.ts'
import {
  buildExpression,
  maybeSnomedConceptBase,
  satisfyingSExpression,
  snomedConceptBase,
} from './s_expression.ts'
import { Priority } from '../../shared/priorities.ts'
import { tews_component } from '../../util/validators.ts'
import assertHasProperty from '../../util/assertHasProperty.ts'
import { Lang } from '../../shared/s_expression_schemas.ts'
import { asNode } from '../../shared/s_expression.ts'
import { formatRecord } from '../../shared/patient_records.ts'
import {
  ATTRIBUTE,
  EVENT,
  NO_QUALIFIER,
  UNKNOWN_QUALIFIER,
  YES_QUALIFIER,
} from '../../shared/snomed_concepts.ts'
import { nowInvalidRecords } from './patient_records_base.ts'

type FindingInsert = {
  patient_id: string
  patient_encounter_id: string
  patient_encounter_employee_id: string
  procedure_id: string
  finding: Lang['finding'] | string
}

export function baseQuery(
  trx: TrxOrDbOrQueryCreator,
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
      'snomed_inferred_canonical_name_and_category as procedure_root_snomed_concept',
      'patient_procedure_records.root_snomed_concept_id',
      'procedure_root_snomed_concept.id',
    )
    .innerJoin(
      'snomed_inferred_canonical_name_and_category as procedure_specific_snomed_concept',
      'patient_procedure_records.specific_snomed_concept_id',
      'procedure_specific_snomed_concept.id',
    )
    .select((eb) => [
      literalString('finding').$castTo<'finding'>().as('type'),
      'patient_findings.patient_encounter_employee_id',

      jsonBuildObject({
        record_id: eb.ref('patient_procedure_records.id'),
        root_snomed_concept: jsonBuildObject({
          snomed_concept_id: asText(
            eb,
            'procedure_root_snomed_concept.id',
          ),
          name: eb.ref(
            'procedure_root_snomed_concept.name',
          ),
          category: eb.ref(
            'procedure_root_snomed_concept.category',
          ),
        }),
        specific_snomed_concept: jsonBuildObject({
          snomed_concept_id: asText(
            eb,
            'procedure_specific_snomed_concept.id',
          ),
          name: eb.ref(
            'procedure_specific_snomed_concept.name',
          ),
          category: eb.ref(
            'procedure_specific_snomed_concept.category',
          ),
        }),
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
          'triage_patient_records.id',
          'not in',
          nowInvalidRecords(trx),
        )
        .select('triage_snomed_inferred_canonical_name_and_category.name')
        .$castTo<Priority | null>()
        .as('priority'),

      eb.selectFrom('patient_evaluation_scores')
        .innerJoin(
          'patient_records as score_patient_records',
          'patient_evaluation_scores.id',
          'score_patient_records.id',
        )
        .innerJoin(
          'patient_evaluations as score_evaluations',
          'patient_evaluation_scores.id',
          'score_evaluations.id',
        )
        .whereRef(
          'score_evaluations.evaluates_record_id',
          '=',
          'patient_records.id',
        )
        .where(
          'score_patient_records.id',
          'not in',
          nowInvalidRecords(trx),
        )
        .select('patient_evaluation_scores.score')
        .as('score'),
    ])
}

export type IntermediateFinding = QueryResult<typeof baseQuery>
export type PatientFindingsSearch = {
  patient_id?: string | IdSelection
  patient_encounter_id?: string | IdSelection
  s_expression?: string | Lang['finding']
  search?: string
  not_measurements?: boolean
}

export const patient_findings = base({
  top_level_table: 'patient_findings',
  baseQuery,
  formatResult: (finding) => {
    if (finding.priority) {
      assert(finding.score == null, 'Use score or priority, but not both')
    }
    if (finding.score != null) {
      tews_component.parse(finding.score)
    }

    return formatRecord(finding)
  },
  handleSearch(
    qb,
    opts: PatientFindingsSearch,
    trx,
  ) {
    assert(!opts.search, 'TODO support')
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
    if (opts.not_measurements) {
      qb = qb.leftJoin(
        'patient_measurements',
        'patient_findings.id',
        'patient_measurements.id',
      ).where('patient_measurements.id', 'is', null)
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
      patient_encounter_id,
      patient_encounter_employee_id,
      procedure_id,
      finding,
    }: FindingInsert,
  ) {
    const finding_node = asNode(finding, 'finding')
    assertHasProperty(finding_node, 'root_snomed_concept')
    assertHasProperty(finding_node, 'specific_snomed_concept')

    const finding_id = generateUUID()

    let query = patient_records.baseInsert(
      trx,
      {
        patient_id,
        patient_encounter_id,
        record_id: finding_id,
        ...finding_node,
      },
    ).with('inserting_findings', (qb) =>
      qb.insertInto('patient_findings')
        .values({
          id: finding_id,
          procedure_id,
          patient_encounter_employee_id,
        }))

    for (const attribute of finding_node.attributes) {
      query = attributeCte(query, attribute)
    }
    for (const event of finding_node.events) {
      query = eventCte(query, event)
    }

    const select_query = query.selectNoFrom([
      success_true,
      sql<true>`true`.as('inserted_new'),
      literalString(finding_id).as('finding_id'),
    ])

    return select_query
      .executeTakeFirstOrThrow()

    function attributeCte(
      qb: typeof query,
      attribute: Lang['attribute'],
    ) {
      const attribute_id = generateUUID()
      const id_token = attribute_id.replaceAll('-', '_')
      const { value } = attribute

      return qb.with(
        `inserting_attribute_record_${id_token}`,
        (qb) =>
          qb.insertInto('patient_records')
            .values({
              id: attribute_id,
              patient_id,
              patient_encounter_id,
              root_snomed_concept_id: ATTRIBUTE.id,
              specific_snomed_concept_id: snomedConceptBase(
                trx,
                attribute.specific_snomed_concept,
              ),
              value_snomed_concept_id: maybeSnomedConceptBase(trx, value),
            }),
      ).with(
        `inserting_attribute_qualifier_${id_token}`,
        (qb) =>
          qb.insertInto('patient_record_qualifiers')
            .values({
              id: attribute_id,
              qualifies_record_id: finding_id,
            }),
      ) as unknown as typeof query
    }

    function eventCte(
      qb: typeof query,
      event: Lang['event'],
    ) {
      const event_id = generateUUID()
      const id_token = event_id.replaceAll('-', '_')
      const { value } = event

      return qb.with(
        `inserting_event_record_${id_token}`,
        (qb) =>
          qb.insertInto('patient_records')
            .values({
              id: event_id,
              patient_id,
              patient_encounter_id,
              root_snomed_concept_id: EVENT.id,
              specific_snomed_concept_id: snomedConceptBase(
                trx,
                event.specific_snomed_concept,
              ),
              value_snomed_concept_id: null,
            }),
      ).with(
        `inserting_event_qualifier_${id_token}`,
        (qb) =>
          qb.insertInto('patient_record_qualifiers')
            .values({
              id: event_id,
              qualifies_record_id: finding_id,
            }),
      ).with(
        `inserting_event_${id_token}`,
        (qb) =>
          qb.insertInto('patient_events')
            .values({
              id: event_id,
              datetime: new Date(value.datetime),
            }),
      ) as unknown as typeof query
    }
  },
  async insertOneIfNotAlreadyExistsForThisEncounter(
    trx: TrxOrDb,
    insert: FindingInsert,
  ) {
    const already_exists = await satisfyingSExpression(
      trx,
      {
        patient_id: insert.patient_id,
        patient_encounter_id: insert.patient_encounter_id,
        s_expression: insert.finding,
      },
    )

    if (already_exists.satisfies) {
      return {
        success: true,
        inserted_new: false,
        finding_id: already_exists.record_ids[0],
      }
    }

    return patient_findings.insertOneNested(trx, insert)
  },
  QUALIFIERS_BY_EXISTENCE: {
    Yes: YES_QUALIFIER.id,
    No: NO_QUALIFIER.id,
    Unknown: UNKNOWN_QUALIFIER.id,
  },
})
