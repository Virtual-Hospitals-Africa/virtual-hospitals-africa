import { sql } from 'kysely'
import {
  MedicationSchedule,
  PatientMedicationUpsert,
  PrescriptionMedication,
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

export type MedicationsFilled = {
  patient_prescription_medication_id: string
  pharmacist_id: string
  pharmacy_id?: string
}

export function getById(
  trx: TrxOrDb,
  id: string,
) {
  return trx
    .selectFrom('prescriptions')
    .innerJoin(
      'prescription_codes',
      'prescriptions.id',
      'prescription_codes.prescription_id',
    )
    .where('prescriptions.id', '=', id)
    // .selectAll()
    .select('prescriptions.id')
    .select('prescription_codes.created_at')
    .select('prescription_codes.updated_at')
    .select('prescriptions.prescriber_id')
    .select('prescriptions.patient_id')
    .select('prescription_codes.alphanumeric_code')
    .executeTakeFirst()
}

export function getByCode(
  trx: TrxOrDb,
  code: string,
) {
  return trx
    .selectFrom('prescription_codes')
    .innerJoin(
      'prescriptions',
      'prescriptions.id',
      'prescription_codes.prescription_id',
    )
    .where('alphanumeric_code', '=', code)
    .select('prescriptions.id')
    .select('prescription_codes.created_at')
    .select('prescription_codes.updated_at')
    .select('prescriptions.prescriber_id')
    .select('prescriptions.patient_id')
    .select('prescription_codes.alphanumeric_code')
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

  const prescription_medications = await medications.insert(
    trx,
    prescription.id,
    values.prescribing,
  )

  if (prescription_medications.length) {
    // TODO
  }

  return prescription
}

export async function getMedicationsByPrescriptionId(
  trx: TrxOrDb,
  prescription_id: string,
): Promise<PrescriptionMedication[]> {
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

export function getPrescriberByPrescriptionId(
  trx: TrxOrDb,
  prescription_id: string,
) {
  return trx
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
}

export function dispenseMedications(
  trx: TrxOrDb,
  dispensed_medications: MedicationsFilled[],
) {
  return trx
    .insertInto('patient_prescription_medications_filled')
    .values(dispensed_medications)
    .returningAll()
    .execute()
}

export function getFilledMedicationsByPrescriptionId(
  trx: TrxOrDb,
  prescription_id: string,
) {
  return trx
    .selectFrom('patient_prescription_medications')
    .innerJoin(
      'patient_prescription_medications_filled',
      'patient_prescription_medications_filled.patient_prescription_medication_id',
      'patient_prescription_medications.id',
    )
    .where(
      'patient_prescription_medications.prescription_id',
      '=',
      prescription_id,
    )
    .select(
      'patient_prescription_medications_filled.patient_prescription_medication_id',
    )
    .orderBy('patient_prescription_medications_filled.created_at', 'desc')
    .execute()
}

export function deleteFilledMedicationsById(
  trx: TrxOrDb,
  filled_id: string[],
) {
  return trx
    .deleteFrom('patient_prescription_medications_filled')
    .where('patient_prescription_medication_id', 'in', filled_id)
    .execute()
}

export function deleteCode(
  trx: TrxOrDb,
  code: string,
) {
  return trx
    .deleteFrom('prescription_codes')
    .where('alphanumeric_code', '=', code)
    .execute()
}
