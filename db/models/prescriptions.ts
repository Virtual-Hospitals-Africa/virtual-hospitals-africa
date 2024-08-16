import { sql } from 'kysely'
import {
  MedicationSchedule,
  PatientMedicationUpsert,
  TrxOrDb,
} from '../../types.ts'
import * as medications from './medications.ts'
import { isoDate } from '../helpers.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { durationEndDate } from '../../util/date.ts'

export type PrescriptionCondition = {
  patient_condition_id: string
  start_date: string
  medications: PatientMedicationUpsert[]
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

export async function insert(
  trx: TrxOrDb,
  values: {
    prescriber_id: string
    patient_id: string
    prescribing: PrescriptionCondition[]
  },
) {
  const prescription = await trx
    .insertInto('prescriptions')
    .values({
      prescriber_id: values.prescriber_id,
      patient_id: values.patient_id,
    })
    .returningAll()
    .executeTakeFirstOrThrow()

  await medications.insert(
    trx,
    prescription.id,
    values.prescribing,
  )

  return prescription
}

export async function getMedicationsByPrescriptionId(
  trx: TrxOrDb,
  prescription_id: string,
) {
  const patient_medications = await trx
    .selectFrom('prescriptions')
    .innerJoin(
      'patient_prescription_medications',
      'prescriptions.id',
      'patient_prescription_medications.prescription_id',
    )
    .innerJoin(
      'patient_condition_medications',
      'patient_prescription_medications.patient_condition_medication_id',
      'patient_condition_medications.id',
    )
    .innerJoin(
      'medications',
      'patient_condition_medications.medication_id',
      'medications.id',
    )
    .innerJoin('drugs', 'medications.drug_id', 'drugs.id')
    .where('prescriptions.id', '=', prescription_id)
    .select((eb) => [
      'drugs.generic_name as name',
      'medications.form',
      'patient_condition_medications.route',
      'patient_condition_medications.strength',
      'medications.strength_numerator_unit',
      'medications.strength_denominator',
      'medications.strength_denominator_unit',
      'medications.strength_denominator_is_units',
      'patient_condition_medications.special_instructions',
      isoDate(eb.ref('patient_condition_medications.start_date')).as(
        'start_date',
      ),
      sql<
        MedicationSchedule[]
      >`TO_JSON(patient_condition_medications.schedules)`.as('schedules'),
    ])
    .execute()

  return patient_medications
    .map(({ schedules, ...medication }) => {
      assertEquals(schedules.length, 1)
      assert(medication.start_date)
      const [schedule] = schedules
      const end_date = durationEndDate(medication.start_date, schedule)
      assert(
        end_date,
        'Every medication must have an end date on the prescription.',
      )
      return {
        ...medication,
        intake_frequency: schedule.frequency,
        end_date: end_date,
        dosage: schedule.dosage,
        strength: Number(medication.strength),
        strength_denominator: Number(medication.strength_denominator),
      }
    })
}
