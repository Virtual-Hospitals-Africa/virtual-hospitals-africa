import { sql } from 'kysely'
import { TrxOrDb } from '../../types.ts'
import { differenceInDays } from '../../util/date.ts'
import { PrescriptionCondition } from './prescriptions.ts'
import { assert } from 'std/assert/assert.ts'

export async function insert(
  trx: TrxOrDb,
  prescription_id: string,
  conditions: PrescriptionCondition[],
) {
  const medications = conditions.flatMap(processMedications)

  assert(
    medications.length > 0,
    'The number of medications in the prescription must be greater than 0.',
  )

  await trx
    .insertInto('prescription_codes')
    .values({
      prescription_id: prescription_id,
    })
    .execute()

  const condition_medications = await trx
    .insertInto('patient_condition_medications')
    .values(medications)
    .returning('id')
    .execute()

  const prescription_medications = condition_medications
    .map((medication) => ({
      patient_condition_medication_id: medication.id,
      prescription_id: prescription_id,
    }))

  await trx
    .insertInto('patient_prescription_medications')
    .values(prescription_medications)
    .execute()
}

export function processMedications(condition: PrescriptionCondition) {
  return (condition.medications || []).map((medication) => {
    const start_date = medication.start_date || condition.start_date

    const { duration, duration_unit } = medication.end_date
      ? {
        duration: differenceInDays(medication.end_date, start_date),
        duration_unit: 'days',
      }
      : { duration: 1, duration_unit: 'indefinitely' }
    return {
      patient_condition_id: condition.patient_condition_id,
      medication_id: (!medication.manufactured_medication_id &&
        medication.medication_id) ||
        null, // omit medication_id if manufactured_medication_id is present
      manufactured_medication_id: medication.manufactured_medication_id ||
        null,
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
}
