import { sql, SqlBool } from 'kysely'
import { jsonArrayFrom, literalBoolean } from '../helpers.ts'
import { ensureEncounterId } from './patient_encounters.ts'
import {
  RenderedPatientExamination,
  RenderedPatientExaminationWithRecommendations,
  TrxOrDb,
} from '../../types.ts'
import { literalString } from '../helpers.ts'

function examinationIdentifier(identifier: string) {
  return sql<string>`${identifier}::varchar(80)`.as('examination_identifier')
}

export async function forPatientEncounter(
  trx: TrxOrDb,
  opts: {
    patient_id: string
    encounter_id: string | 'open'
  },
): Promise<RenderedPatientExaminationWithRecommendations[]> {
  const exs = await trx.with('recommended_examinations', (qb) => {
    const patient_encounter = qb.selectFrom('patients')
      .innerJoin('patient_age', 'patient_age.patient_id', 'patients.id')
      .innerJoin(
        'patient_encounters',
        'patient_encounters.patient_id',
        'patients.id',
      ).select([
        'patients.id as patient_id',
        'patient_encounters.id as encounter_id',
      ])
      .where('patients.id', '=', opts.patient_id)
      .where(
        'patient_encounters.id',
        '=',
        ensureEncounterId(trx, opts),
      )

    const head_to_toe_assessment_general = patient_encounter.select(
      examinationIdentifier('head_to_toe_assessment_general'),
    )
    const head_to_toe_assessment_skin = patient_encounter.select(
      examinationIdentifier('head_to_toe_assessment_skin'),
    )
    const head_to_toe_assessment_head_and_neck = patient_encounter.select(
      examinationIdentifier('head_to_toe_assessment_head_and_neck'),
    )
    const head_to_toe_assessment_cardiovascular = patient_encounter.select(
      examinationIdentifier('head_to_toe_assessment_cardiovascular'),
    )
    const head_to_toe_assessment_respiratory = patient_encounter.select(
      examinationIdentifier('head_to_toe_assessment_respiratory'),
    )
    const head_to_toe_assessment_gastrointestinal = patient_encounter.select(
      examinationIdentifier('head_to_toe_assessment_gastrointestinal'),
    )
    const head_to_toe_assessment_neuromuscular = patient_encounter.select(
      examinationIdentifier('head_to_toe_assessment_neuromuscular'),
    )

    const womens_health = patient_encounter
      .where('patients.gender', '=', 'female')
      .where(sql.ref('patient_age.age_years').$castTo<number>(), '>=', 18)
      .select(examinationIdentifier('womens_health_assessment'))

    const mens_health = patient_encounter
      .where('patients.gender', '=', 'male')
      .where(sql.ref('patient_age.age_years').$castTo<number>(), '>=', 18)
      .select(examinationIdentifier('mens_health_assessment'))

    const child_health = patient_encounter
      .where(sql.ref('patient_age.age_years').$castTo<number>(), '<', 18)
      .select(examinationIdentifier('child_health_assessment'))

    const maternity = patient_encounter
      .where('patient_encounters.reason', '=', 'maternity')
      .select(examinationIdentifier('maternity_assessment'))

    return head_to_toe_assessment_general
      .unionAll(head_to_toe_assessment_skin)
      .unionAll(head_to_toe_assessment_head_and_neck)
      .unionAll(head_to_toe_assessment_cardiovascular)
      .unionAll(head_to_toe_assessment_respiratory)
      .unionAll(head_to_toe_assessment_gastrointestinal)
      .unionAll(head_to_toe_assessment_neuromuscular)
      .unionAll(womens_health)
      .unionAll(mens_health)
      .unionAll(child_health)
      .unionAll(maternity)
  })
    .with('patient_examinations_with_recommendations_unordered', (qb) => {
      const recommendations_not_yet_addressed = qb.selectFrom(
        'recommended_examinations',
      )
        .leftJoin(
          'patient_examinations',
          (join) =>
            join
              .onRef(
                'recommended_examinations.encounter_id',
                '=',
                'patient_examinations.encounter_id',
              )
              .onRef(
                'recommended_examinations.examination_identifier',
                '=',
                'patient_examinations.examination_identifier',
              ),
        )
        .where('patient_examinations.id', 'is', null)
        .selectAll('recommended_examinations')
        .select([
          sql<SqlBool>`FALSE`.as('completed'),
          sql<SqlBool>`FALSE`.as('skipped'),
          sql<SqlBool>`FALSE`.as('ordered'),
          sql<SqlBool>`TRUE`.as('recommended'),
          sql<null | string>`NULL`.as('patient_examination_id'),
        ])

      const patient_examinations = qb.selectFrom('patient_examinations')
        .leftJoin(
          'recommended_examinations',
          (join) =>
            join
              .onRef(
                'recommended_examinations.encounter_id',
                '=',
                'patient_examinations.encounter_id',
              )
              .onRef(
                'recommended_examinations.examination_identifier',
                '=',
                'patient_examinations.examination_identifier',
              ),
        )
        .select((eb) => [
          'patient_examinations.patient_id',
          'patient_examinations.encounter_id',
          'patient_examinations.examination_identifier',
          'patient_examinations.completed',
          'patient_examinations.skipped',
          'patient_examinations.ordered',
          eb('recommended_examinations.encounter_id', 'is not', null).as(
            'recommended',
          ),
          'patient_examinations.id as patient_examination_id',
        ])
        .where('patient_examinations.id', '=', opts.patient_id)
        .where(
          'patient_examinations.encounter_id',
          '=',
          ensureEncounterId(trx, opts),
        )

      return recommendations_not_yet_addressed.unionAll(patient_examinations)
    })
    .selectFrom('patient_examinations_with_recommendations_unordered')
    .innerJoin(
      'examinations',
      'examinations.identifier',
      'examination_identifier',
    )
    .selectAll('patient_examinations_with_recommendations_unordered')
    .select([
      'examinations.path',
      'examinations.encounter_step',
    ])
    .orderBy('examinations.order', 'asc')
    .execute()

  return exs.map((ex) => ({
    ...ex,
    href:
      `/app/patients/${opts.patient_id}/encounters/${opts.encounter_id}${ex.path}`,
  }))
}

export async function add(
  trx: TrxOrDb,
  { examinations, encounter_id, patient_id, encounter_provider_id }: {
    patient_id: string
    encounter_id: string
    encounter_provider_id: string
    examinations: {
      during_this_encounter: string[]
      orders: string[]
    }
  },
) {
  const all_examinations = [
    ...examinations.during_this_encounter,
    ...examinations.orders,
  ]

  let delete_query = trx
    .deleteFrom('patient_examinations')
    .where('encounter_id', '=', encounter_id)
    .where('patient_id', '=', patient_id)

  if (all_examinations.length > 0) {
    delete_query = delete_query.where(
      'examination_identifier',
      'not in',
      all_examinations,
    )
  }

  const deleting_examination_not_specified = delete_query.execute()

  all_examinations.length && await trx
    .insertInto('patient_examinations')
    .columns([
      'examination_identifier',
      'patient_id',
      'encounter_id',
      'encounter_provider_id',
      'ordered',
    ])
    .expression((eb) => {
      // examinations requiring insert are those not already present
      const base_insert = eb.selectFrom('examinations')
        .leftJoin('patient_examinations', (join) =>
          join.onRef(
            'patient_examinations.examination_identifier',
            '=',
            'examinations.identifier',
          )
            .on('patient_examinations.encounter_id', '=', encounter_id)
            .on('patient_examinations.patient_id', '=', patient_id))
        .where('patient_examinations.id', 'is', null)
        .select([
          'examinations.identifier as examination_identifier',
          literalString(patient_id).as('patient_id'),
          literalString(encounter_id).as('encounter_id'),
          literalString(encounter_provider_id).as('encounter_provider_id'),
        ])

      const during_this_encounter = base_insert
        .where(
          'examinations.identifier',
          'in',
          examinations.during_this_encounter,
        )
        .select(literalBoolean(false).as('ordered'))

      const orders = base_insert
        .where('examinations.identifier', 'in', examinations.orders)
        .select(literalBoolean(true).as('ordered'))

      if (!examinations.during_this_encounter.length) return orders
      if (!examinations.orders.length) return during_this_encounter
      return during_this_encounter.unionAll(orders)
    })
    .returning('id')
    .execute()

  await deleting_examination_not_specified
}

export function skip(trx: TrxOrDb, values: {
  examination_identifier: string
  patient_id: string
  encounter_id: string
  encounter_provider_id: string
}) {
  return trx
    .insertInto('patient_examinations')
    .values({
      ...values,
      skipped: true,
    })
    .executeTakeFirstOrThrow()
}

export async function getPatientExamination(
  trx: TrxOrDb,
  { patient_id, encounter_id, examination_identifier }: {
    patient_id: string
    encounter_id: string
    examination_identifier: string
  },
): Promise<RenderedPatientExamination> {
  const ex = await trx
    .selectFrom('examinations')
    .where('examinations.identifier', '=', examination_identifier)
    .leftJoin(
      'patient_examinations',
      (join) =>
        join.onRef(
          'patient_examinations.examination_identifier',
          '=',
          'examinations.identifier',
        )
          .on('patient_examinations.patient_id', '=', patient_id)
          .on(
            'patient_examinations.encounter_id',
            '=',
            ensureEncounterId(trx, { patient_id, encounter_id }),
          ),
    )
    .select((eb) => [
      'patient_examinations.id as patient_examination_id',
      'patient_examinations.completed',
      'patient_examinations.skipped',
      'patient_examinations.ordered',
      'examinations.path',
      'examinations.encounter_step',
      // 'examinations.short_name',
      jsonArrayFrom(
        eb.selectFrom('patient_examination_findings')
          .whereRef(
            'patient_examination_findings.patient_examination_id',
            '=',
            'patient_examinations.id',
          )
          .innerJoin(
            'snomed_concepts as sc_findings',
            'sc_findings.snomed_concept_id',
            'patient_examination_findings.snomed_concept_id',
          )
          .select([
            'patient_examination_findings.id as patient_examination_finding_id',
            'sc_findings.snomed_concept_id',
            'sc_findings.snomed_english_term',
            'additional_notes',
          ])
          .select((eb_findings) =>
            jsonArrayFrom(
              eb_findings.selectFrom('patient_examination_finding_body_sites')
                .whereRef(
                  'patient_examination_finding_body_sites.patient_examination_finding_id',
                  '=',
                  'patient_examination_findings.id',
                )
                .innerJoin(
                  'snomed_concepts as sc_body_sites',
                  'sc_body_sites.snomed_concept_id',
                  'patient_examination_finding_body_sites.snomed_concept_id',
                )
                .select([
                  'patient_examination_finding_body_sites.id as patient_examination_finding_body_site_id',
                  'sc_body_sites.snomed_concept_id',
                  'sc_body_sites.snomed_english_term',
                ]),
            ).as('body_sites')
          ),
      ).as('findings'),
    ])
    .executeTakeFirstOrThrow()

  return {
    ...ex,
    examination_identifier,
    href: `/app/patients/${patient_id}/encounters/${encounter_id}${ex.path}`,
  }
}
