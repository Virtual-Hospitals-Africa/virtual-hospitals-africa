import {
  Maybe,
  TrxOrDb,
} from '../../types.ts'
import { differenceInDays } from '../../util/date.ts'
import { sql } from 'kysely'

type PatientMedicationInsert = {
  id?: Maybe<string>
  dosage: number
  strength: number
  intake_frequency: string
  route: string
  start_date: string
  end_date?: Maybe<string>
  medication_id: string | null
  manufactured_medication_id: string | null
  special_instructions?: Maybe<string>
  schedules?: Maybe<string>
}

type PrescriptionInsert = {
  id: string
  alphanumeric_code
  prescriber_id
  patient_condition_id
  medications?: PatientMedicationInsert[]
}

export function insert(
  trx: TrxOrDb,
  opts: {
    alphanumeric_code: string
    contents: string
  },
) {
  return trx
    .insertInto('prescriptions')
    // deno-lint-ignore no-explicit-any
    .values(opts as any)
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

async function create(
  trx: TrxOrDb,
  contents: PrescriptionInsert,
){
  const patient = await trx
    .selectFrom('patient_conditions')
    .select('patient_id')
    .where('id', '=', contents.patient_condition_id)
    .executeTakeFirstOrThrow();

  const patientID = patient.patient_id

  const prescriptionData =  {
    id: contents.id,
    alphanumeric_code: contents.alphanumeric_code,
    prescriber_id:contents.prescriber_id,
    patient_id: patientID
  }

  const { id: prescription_id } = await trx
    .insertInto('prescriptions')
    .values(prescriptionData)
    .returning('id')
    .executeTakeFirstOrThrow();

    const medications = (contents.medications || []).map((medication) => {
      const start_date = medication.start_date
  
      const { duration, duration_unit } = medication.end_date
        ? {
          duration: differenceInDays(medication.end_date, start_date),
          duration_unit: 'days',
        }
        : { duration: 1, duration_unit: 'indefinitely' }
  
      return {
        patient_condition_id: contents.patient_condition_id,
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

    if (medications.length) {
      await trx
        .insertInto('patient_condition_medications')
        .values(medications)
        .execute();
    }

    return { prescription_id };
}
