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
  patient_condition_ids: any[],
  conditions: PreExistingConditionUpsert[],
) {
  let prescriber_id: any
  const patient_condition_medications_ids: any[] =  []
  for(let i = 0; i < conditions.length; i++){
    const condition = conditions[i]
    const current_patient_condition_id = patient_condition_ids[i]
    const medications_json = (condition.medications || []).map((medication) => {
      const start_date = medication.start_date || condition.start_date
  
      const { duration, duration_unit } = medication.end_date
        ? {
          duration: differenceInDays(medication.end_date, start_date),
          duration_unit: 'days',
        }
        : { duration: 1, duration_unit: 'indefinitely' }
  
      return {
        patient_condition_id: current_patient_condition_id,
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
      patient_condition_medications.forEach(record => {
        patient_condition_medications_ids.push(record.id)
      })
      
      if(!prescriber_id){
        prescriber_id = await trx
        .selectFrom('patient_condition_medications as pcm')
        .innerJoin('patient_conditions as pc', 'pcm.patient_condition_id', 'pc.id')
        .innerJoin('patients as p', 'pc.patient_id', 'p.id')
        .innerJoin('patient_encounters as pe', 'p.id', 'pe.patient_id')
        .innerJoin('patient_encounter_providers as pep', 'pe.id', 'pep.patient_encounter_id')
        .select('pep.id as patient_encounter_provider_id')
        .where('pcm.patient_condition_id', '=', patient_condition_medications[0].patient_condition_id)
        .executeTakeFirst()
          
        console.log(prescriber_id)
      }
      assert(prescriber_id)
  }

  const existCodesObj = await trx
    .selectFrom('prescriptions')
    .select('alphanumeric_code')
    .execute()

  const existCodesArray = existCodesObj.map(row => row.alphanumeric_code);
  let alphanumeric_code: string
  do{
    alphanumeric_code = Math.floor(100000 + Math.random() * 900000).toString()
  } while (
    existCodesArray.includes(alphanumeric_code)
  )

  const prescription = await trx
    .insertInto('prescriptions')
    .values({
      alphanumeric_code: alphanumeric_code, 
      prescriber_id: prescriber_id.patient_encounter_provider_id,
      patient_id: patient_id,
    })
    .returning('id')
    .executeTakeFirstOrThrow()
  
   console.log(prescription)

   const patient_condition_medication_datas = (patient_condition_medications_ids || []).map((patient_condition_medications_id) => ({
    patient_condition_medication_id: patient_condition_medications_id,
    prescription_id: prescription.id,
  }))
  console.log(patient_condition_medication_datas)

  const patient_prescription_medication = await trx
    .insertInto('patient_prescription_medications')
    .values(patient_condition_medication_datas)
    .execute()

    return prescription
}
