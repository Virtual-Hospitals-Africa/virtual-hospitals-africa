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
      'patient_prescription_medications.id as patient_prescription_medication_id',
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
    .map(({ schedules, patient_prescription_medication_id, ...medication }) => {
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
        patient_prescription_medication_id,
      }
    })
}

export async function getPrescriberByPrescriptionId(
  trx: TrxOrDb,
  prescription_id: string,
) {
  assert(typeof prescription_id === 'string')
  const prescriber = await trx
    .selectFrom('prescriptions')
    .innerJoin(
      'patient_encounter_providers',
      'patient_encounter_providers.id',
      'prescriptions.prescriber_id',
    )
    .innerJoin(
      'employment',
      'employment.id',
      'patient_encounter_providers.provider_id',
    )
    .innerJoin(
      'health_workers',
      'health_workers.id',
      'employment.health_worker_id',
    )
    .where('prescriptions.id', '=', prescription_id)
    .select('health_workers.name')
    .executeTakeFirst()

  return prescriber
}

export async function dispenseMedications(
  trx: TrxOrDb,
  DispensedMedications: {
    patient_prescription_medication_id: string,
    pharmacist_id: string,
    pharmacy_id: string,
  }[]
){
  return await trx
  .insertInto('patient_prescription_medications_filled')
  .values(DispensedMedications)
  .returningAll()
  .execute()
}

export async function getFilledMedicationsByPrescriptionId(
  trx: TrxOrDb,
  prescription_id: string,
){
  return await trx
    .selectFrom('patient_prescription_medications')
    .innerJoin(
      'patient_prescription_medications_filled',
      'patient_prescription_medications_filled.patient_prescription_medication_id',
      'patient_prescription_medications.id',
    )
    .where('patient_prescription_medications.prescription_id', '=', prescription_id)
    .select('patient_prescription_medications_filled.patient_prescription_medication_id')
    .orderBy('patient_prescription_medications_filled.created_at', 'desc')
    .execute()
}

export async function deleteFilledMedications(
  trx: TrxOrDb,
  filledMedications: {
    patient_prescription_medication_id: string,
  }[]
) {
  const idsToDelete = filledMedications.map(medication => medication.patient_prescription_medication_id);
  return await trx
  .deleteFrom('patient_prescription_medications_filled')
  .where('patient_prescription_medication_id', 'in', idsToDelete)
  .execute()
}
