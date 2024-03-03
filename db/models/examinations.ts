import { sql } from 'kysely'
import { TrxOrDb } from '../../types.ts'
import { Examination } from '../../shared/examinations.ts'

function examinationName(name: Examination) {
  return sql<string>`${name}`.as('examination_name')
}

export function recommended(
  trx: TrxOrDb,
  { patient_id, encounter_id }: { patient_id: number; encounter_id: number },
) {
  const patient_encounter = trx.selectFrom('patients')
    .where('patients.id', '=', patient_id)
    .innerJoin('patient_age', 'patient_age.patient_id', 'patients.id')
    .innerJoin(
      'patient_encounters',
      (join) =>
        join.onRef('patient_encounters.patient_id', '=', 'patients.id')
          .on('patient_encounters.id', '=', encounter_id),
    )

  const head_to_toe = trx.selectNoFrom(
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
}
