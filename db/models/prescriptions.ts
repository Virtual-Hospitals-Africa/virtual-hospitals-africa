import { sql } from 'kysely'
import { TrxOrDb } from '../../types.ts'
import { differenceInDays } from '../../util/date.ts'
import { PreExistingConditionUpsert } from './patient_conditions.ts'
import { assert } from 'std/assert/assert.ts'

export function insert(
  trx: TrxOrDb,
  opts: {
    alphanumeric_code: string
    prescriber_id: string
    patient_id: string
  },
) {
  return trx
    .insertInto('prescriptions')
    .values({
      alphanumeric_code: opts.alphanumeric_code,
      prescriber_id: opts.prescriber_id,
      patient_id: opts.patient_id,
    })
    .returningAll()
    .executeTakeFirstOrThrow()
}

export function getById(
  trx: TrxOrDb,
  id: string,
) {
  return trx
    .selectFrom('prescriptions')
    .where('id', '=', id)
    .selectAll()
    .executeTakeFirst()
}

export function getByCode(
  trx: TrxOrDb,
  code: string,
) {
  return trx
    .selectFrom('prescriptions')
    .where('alphanumeric_code', '=', code)
    .selectAll()
    .executeTakeFirst()
}

export async function createPrescription(
  trx: TrxOrDb,
  patient_id: string,
  condition: PreExistingConditionUpsert,
  opts: {
    parent_condition: string,
    alphanumeric_code: string
    prescriber_id: string
    patient_condition_medication_id: string
    pharmacist_id: string
    pharmacy_id: string
  },
) {
  const medications_json = (condition.medications || []).map((medication) => {
    const start_date = medication.start_date || condition.start_date

    const { duration, duration_unit } = medication.end_date
      ? {
        duration: differenceInDays(medication.end_date, start_date),
        duration_unit: 'days',
      }
      : { duration: 1, duration_unit: 'indefinitely' }

    return {
      patient_condition_id: opts.parent_condition,
      medication_id:
        (!medication.manufactured_medication_id && medication.medication_id) ||
        null, // omit medication_id if manufactured_medication_id is present
      manufactured_medication_id: medication.manufactured_medication_id || null,
      strength: medication.strength,
      route: medication.route,
      schedules: sql<string[]>`
        ARRAY[
          ROW(${medication.dosage}, ${medication.intake_frequency}, ${duration}, ${duration_unit})
        ]::medication_schedule[]
      `,
      start_date,
      special_instructions: medication.special_instructions || null,
    }
  })

  // all information of 'patient_condition_medications'
  const patient_condition_medications = await trx
    .insertInto('patient_condition_medications')
    .values(medications_json)
    .returningAll()
    .execute()

    console.log(patient_condition_medications)

  const prescriber_id = await trx
    .selectFrom('patient_condition_medications as pcm')
    .innerJoin('patient_conditions as pc', 'pcm.patient_condition_id', 'pc.id')
    .innerJoin('patients as p', 'pc.patient_id', 'p.id')
    .innerJoin('patient_encounters as pe', 'p.id', 'pe.patient_id')
    .innerJoin('patient_encounter_providers as pep', 'pe.id', 'pep.patient_encounter_id')
    .select('pep.id as patient_encounter_provider_id')
    .where('pcm.patient_condition_id', '=', patient_condition_medications[0].patient_condition_id)
    .executeTakeFirst()

  console.log(prescriber_id)
  // Note that this is executed twice.
  // So this code will crush because of same alphanumeric_code
  assert(prescriber_id)
  // 现在的模拟是
  /*
  一个症状对应了2个药
  有两个症状（所以被执行两次）
  */
  // Q1 
  // 我们是否需要传递验证码而非在这里生成？
  // 如果生成的话，那对于同一个患者必须是一个验证码
  // 如何确保哪些处方是分开的 哪些是一起的
  // Q2
  // 对同一个患者而言验证码应该是同一个
  // 但是此函数被执行两次，alphanumeric_code 是 prescriptions 的 unique
  // 所以崩溃
  const prescription = await trx
    .insertInto('prescriptions')
    .values({
      alphanumeric_code: opts.alphanumeric_code,
      prescriber_id: prescriber_id.patient_encounter_provider_id,
      patient_id: patient_id,
    })
    .returning('id')
    .executeTakeFirstOrThrow()
  
  // console.log(prescription)


  // const patient_prescription_medication = await trx
  //   .insertInto('patient_prescription_medications')
  //   .values({
  //     patient_condition_medication_id: opts.patient_condition_medication_id,
  //     prescription_id: prescription.id,
  //   })
  //   .returning('id')
  //   .executeTakeFirstOrThrow()

  // await trx
  //   .insertInto('patient_prescription_medications_filled')
  //   .values({
  //     patient_prescription_medication_id: patient_prescription_medication.id,
  //     pharmacist_id: opts.pharmacist_id,
  //     pharmacy_id: opts.pharmacy_id,
  //   })
  //   .returningAll()
  //   .executeTakeFirstOrThrow()

  // return prescription
}
