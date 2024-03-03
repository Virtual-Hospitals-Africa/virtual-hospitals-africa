import { sql, SqlBool } from 'kysely'
import { ExaminationFindings, TrxOrDb } from '../../types.ts'
import { Examination } from '../../shared/examinations.ts'
import { assert } from 'std/assert/assert.ts'

function examinationName(name: Examination) {
  return sql<string>`${name}::varchar(40)`.as('examination_name')
}

export function recommended(
  trx: TrxOrDb,
) {
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

export function upsertFindings(
  trx: TrxOrDb,
  examination_findings: ExaminationFindings,
) {
  assert(
    examination_findings.findings.length === 0,
    'TODO findings not yet implemented',
  )
  return trx
    .insertInto('patient_examinations')
    .values({
      examination_name: examination_findings.examination_name,
      patient_id: examination_findings.patient_id,
      encounter_id: examination_findings.encounter_id,
      encounter_provider_id: examination_findings.encounter_provider_id,
      completed: true,
    })
    .returning('id')
    .executeTakeFirstOrThrow()
}

export function forPatientEncounter(trx: TrxOrDb) {
  return recommended(trx)
    .with('patient_examinations_with_recommendations', (qb) => {
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
          'patient_examinations.examination_name',
          'patient_examinations.completed',
          'patient_examinations.skipped',
          eb('recommended_examinations.encounter_id', 'is not', null).as(
            'recommended',
          ),
        ])

      return recommendations_not_yet_addressed.unionAll(patient_examinations)
    })
}
