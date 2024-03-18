import { QueryCreator, SelectQueryBuilder, sql, SqlBool } from 'kysely'
import { assert } from 'std/assert/assert.ts'
import { assertOr400 } from '../../util/assertOr.ts'
import { jsonArrayFrom, now } from '../helpers.ts'
import { DB, ExaminationFindingType } from '../../db.d.ts'
import { isISODateString } from '../../util/date.ts'
import { RenderedPatientExamination, TrxOrDb } from '../../types.ts'
import { Examination } from '../../shared/examinations.ts'
import { QueryCreatorWithCommonTableExpression } from 'kysely/parser/with-parser.js'

function examinationName(name: Examination) {
  return sql<Examination>`${name}::varchar(40)`.as('examination_name')
}

export function recommended(
  trx: TrxOrDb,
): QueryCreatorWithCommonTableExpression<
  DB,
  'recommended_examinations',
  (
    qb: QueryCreator<DB>,
  ) => SelectQueryBuilder<
    DB,
    'patients' | 'patient_age' | 'patient_encounters',
    {
      patient_id: number
      encounter_id: number
      examination_name: Examination
    }
  >
> {
  return trx.with('recommended_examinations', (qb) => {
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

    const head_to_toe = patient_encounter.select(
      examinationName('Head-to-toe Assessment'),
    )

    const womens_health = patient_encounter
      .where('patients.gender', '=', 'female')
      .where(sql.ref('patient_age.age_years').$castTo<number>(), '>=', 18)
      .select(examinationName("Women's Health Assessment"))

    const mens_health = patient_encounter
      .where('patients.gender', '=', 'male')
      .where(sql.ref('patient_age.age_years').$castTo<number>(), '>=', 18)
      .select(examinationName("Men's Health Assessment"))

    const child_health = patient_encounter
      .where(sql.ref('patient_age.age_years').$castTo<number>(), '<', 18)
      .select(examinationName('Child Health Assessment'))

    const maternity = patient_encounter
      .where('patient_encounters.reason', '=', 'maternity')
      .select(examinationName('Maternity Assessment'))

    return head_to_toe
      .unionAll(womens_health)
      .unionAll(mens_health)
      .unionAll(child_health)
      .unionAll(maternity)
  })
}

export function forPatientEncounter(
  trx: TrxOrDb,
) {
  return recommended(trx)
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
                'recommended_examinations.examination_name',
                '=',
                'patient_examinations.examination_name',
              ),
        )
        .where('patient_examinations.id', 'is', null)
        .selectAll('recommended_examinations')
        .select([
          sql<SqlBool>`FALSE`.as('completed'),
          sql<SqlBool>`FALSE`.as('skipped'),
          sql<SqlBool>`FALSE`.as('ordered'),
          sql<SqlBool>`TRUE`.as('recommended'),
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
                'recommended_examinations.examination_name',
                '=',
                'patient_examinations.examination_name',
              ),
        )
        .select((eb) => [
          'patient_examinations.patient_id',
          'patient_examinations.encounter_id',
          eb.ref('patient_examinations.examination_name').$castTo<Examination>()
            .as('examination_name'),
          'patient_examinations.completed',
          'patient_examinations.skipped',
          'patient_examinations.ordered',
          eb('recommended_examinations.encounter_id', 'is not', null).as(
            'recommended',
          ),
        ])

      return recommendations_not_yet_addressed.unionAll(patient_examinations)
    })
    .with(
      'patient_examinations_with_recommendations',
      (qb) =>
        qb.selectFrom('patient_examinations_with_recommendations_unordered')
          .selectAll('patient_examinations_with_recommendations_unordered')
          .innerJoin('examinations', 'examinations.name', 'examination_name')
          .orderBy('examinations.order', 'asc'),
    )
}

export async function add(
  trx: TrxOrDb,
  { examinations, encounter_id, patient_id, encounter_provider_id }: {
    patient_id: number
    encounter_id: number
    encounter_provider_id: number
    examinations: {
      during_this_encounter: Examination[]
      orders: Examination[]
    }
  },
) {
  const all_examinations = [
    ...examinations.during_this_encounter,
    ...examinations.orders,
  ]
  const deleting_examination_not_specified = trx
    .deleteFrom('patient_examinations')
    .where('encounter_id', '=', encounter_id)
    .where('patient_id', '=', patient_id)
    .where('examination_name', 'not in', all_examinations)
    .execute()

  await trx
    .insertInto('patient_examinations')
    .columns([
      'examination_name',
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
            'patient_examinations.examination_name',
            '=',
            'examinations.name',
          )
            .on('patient_examinations.encounter_id', '=', encounter_id)
            .on('patient_examinations.patient_id', '=', patient_id))
        .where('patient_examinations.id', 'is', null)
        .select((eb) => [
          'examinations.name as examination_name',
          eb.lit(patient_id).as('patient_id'),
          eb.lit(encounter_id).as('encounter_id'),
          eb.lit(encounter_provider_id).as('encounter_provider_id'),
        ])

      const during_this_encounter = base_insert
        .where('examinations.name', 'in', examinations.during_this_encounter)
        .select((eb) => [
          eb.lit<boolean>(false).as('ordered'),
        ])

      const orders = base_insert
        .where('examinations.name', 'in', examinations.orders)
        .select((eb) => [
          eb.lit(true).as('ordered'),
        ])

      return during_this_encounter.unionAll(orders)
    })
    .returning('id')
    .execute()

  await deleting_examination_not_specified
}

export function skip(trx: TrxOrDb, values: {
  examination_name: Examination
  patient_id: number
  encounter_id: number
  encounter_provider_id: number
}) {
  return trx
    .insertInto('patient_examinations')
    .values({
      ...values,
      skipped: true,
    })
    .executeTakeFirstOrThrow()
}

function getFindings(trx: TrxOrDb, examination_name: string) {
  return trx
    .selectFrom('examinations')
    .innerJoin(
      'examination_categories',
      'examinations.name',
      'examination_categories.examination_name',
    )
    .innerJoin(
      'examination_findings',
      'examination_categories.id',
      'examination_findings.examination_category_id',
    )
    .where('examinations.name', '=', examination_name)
    .selectAll('examination_findings')
    .select('category')
    .execute()
}

function assertFindingType(examination_finding: {
  options: string[] | null
  required: boolean
  type: ExaminationFindingType
  // deno-lint-ignore no-explicit-any
}, value: any) {
  assert(value != null, 'Value must be present')
  switch (examination_finding.type) {
    case 'boolean': {
      return assertOr400(
        value === true || value === false,
        'Value must be a boolean',
      )
    }
    case 'integer': {
      return assertOr400(
        typeof value === 'number' && Math.floor(value) === value,
        'Value must be a number',
      )
    }
    case 'float': {
      return assertOr400(typeof value === 'number', 'Value must be a float')
    }
    case 'string': {
      return assertOr400(typeof value === 'string', 'Value must be a string')
    }
    case 'date': {
      return assertOr400(
        isISODateString(value),
        'Value must be an ISO date string',
      )
    }
    case 'select':
    case 'multiselect': {
      return assertOr400(
        typeof value === 'string' &&
          examination_finding.options?.includes(value),
        `Value must be one of (${examination_finding.options?.join(', ')})`,
      )
    }
    default: {
      throw new Error(
        `Unknown examination finding type ${examination_finding.type}`,
      )
    }
  }
}

export async function upsertFindings(
  trx: TrxOrDb,
  {
    patient_id,
    encounter_id,
    encounter_provider_id,
    examination_name,
    skipped,
    values,
  }: {
    patient_id: number
    encounter_id: number
    encounter_provider_id: number
    examination_name: string
    skipped?: boolean
    values: Record<string, Record<string, unknown>>
  },
): Promise<void> {
  const getting_examination_findings = getFindings(trx, examination_name)

  const updating_patient_examination = trx
    .insertInto('patient_examinations')
    .values({
      examination_name,
      encounter_id,
      encounter_provider_id,
      completed: !skipped,
      skipped,
      patient_id: trx.selectFrom('patient_encounters')
        .where('id', '=', encounter_id)
        .where('patient_id', '=', patient_id)
        .select('patient_id'),
    })
    .onConflict((oc) =>
      oc.constraint('patient_examination_unique').doUpdateSet({
        encounter_provider_id,
        completed: true,
      })
    )
    .returning('id')
    .executeTakeFirstOrThrow()

  const removing = trx
    .deleteFrom('patient_examination_findings')
    .where(
      'patient_examination_id',
      'in',
      trx.selectFrom('patient_examinations')
        .select('id')
        .where('encounter_id', '=', encounter_id)
        .where('examination_name', '=', examination_name),
    )
    .where('patient_examination_findings.created_at', '<=', now)
    .execute()

  const examination_findings = await getting_examination_findings
  const patient_examination = await updating_patient_examination

  const required_findings = new Set(
    examination_findings.filter((f) => f.required),
  )

  const patient_findings_to_insert: {
    patient_examination_id: number
    examination_finding_id: number
    // deno-lint-ignore no-explicit-any
    value: any
  }[] = []

  for (const [category, findings] of Object.entries(values)) {
    for (const [finding_name, value] of Object.entries(findings)) {
      const examination_finding = examination_findings.find(
        (f) => f.name === finding_name && f.category === category,
      )
      assertOr400(
        examination_finding,
        `Finding ${category}.${finding_name} not found`,
      )
      assertFindingType(examination_finding, value)
      // TODO assert dependent values are unanswered if dependent on is unanswered

      patient_findings_to_insert.push({
        patient_examination_id: patient_examination.id,
        examination_finding_id: examination_finding.id,
        value,
      })
      required_findings.delete(examination_finding)
    }
  }

  assertOr400(
    required_findings.size === 0,
    `Required findings not found: ${
      Array.from(required_findings)
        .map((f) => `${f.category}.${f.name}`)
        .join(', ')
    }`,
  )

  const adding = patient_findings_to_insert.length && trx
    .insertInto('patient_examination_findings')
    .values(patient_findings_to_insert)
    .execute()

  await Promise.all([removing, adding])
}

export function getPatientExamination(
  trx: TrxOrDb,
  { patient_id, encounter_id, examination_name }: {
    patient_id: number
    encounter_id: number
    examination_name: string
  },
): Promise<RenderedPatientExamination> {
  return trx
    .selectFrom('examinations')
    .where('examinations.name', '=', examination_name)
    .leftJoin(
      'patient_examinations',
      (join) =>
        join.onRef(
          'patient_examinations.examination_name',
          '=',
          'examinations.name',
        )
          .on('patient_examinations.patient_id', '=', patient_id)
          .on('patient_examinations.encounter_id', '=', encounter_id),
    )
    .select((eb) => [
      eb.fn.coalesce('patient_examinations.completed', sql<boolean>`FALSE`).as(
        'completed',
      ),
      eb.fn.coalesce('patient_examinations.skipped', sql<boolean>`FALSE`).as(
        'skipped',
      ),
      jsonArrayFrom(
        eb.selectFrom('examination_categories')
          .whereRef(
            'examination_categories.examination_name',
            '=',
            'examinations.name',
          )
          .select((eb_category) => [
            'examination_categories.category',
            jsonArrayFrom(
              eb_category
                .selectFrom('examination_findings')
                .whereRef(
                  'examination_findings.examination_category_id',
                  '=',
                  'examination_categories.id',
                )
                .leftJoin(
                  'patient_examination_findings',
                  (join) =>
                    join.onRef(
                      'patient_examination_findings.examination_finding_id',
                      '=',
                      'examination_findings.id',
                    )
                      .onRef(
                        'patient_examination_findings.patient_examination_id',
                        '=',
                        'patient_examinations.id',
                      ),
                )
                .select([
                  'examination_findings.name',
                  'examination_findings.label',
                  'examination_findings.type',
                  'examination_findings.required',
                  'examination_findings.options',
                  'patient_examination_findings.value',
                ])
                .orderBy('examination_findings.order', 'asc'),
            ).as('findings'),
          ])
          .orderBy('examination_categories.order', 'asc'),
      )
        .as('categories'),
    ])
    .executeTakeFirstOrThrow()
}
