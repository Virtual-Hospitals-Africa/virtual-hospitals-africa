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
import {
  assertIntakeFrequency,
  dosageDisplay,
  IntakeDosesPerDay,
  intakeFrequencyText,
} from '../../shared/medication.ts'
import omit from '../../util/omit.ts'
import { durationBetween } from '../../util/date.ts'
import { pluralize } from '../../util/pluralize.ts'
import { longFormattedDate } from '../helpers.ts'

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
  options?: {
    omit_filled?: boolean
  },
): Promise<PrescriptionMedication[]> {
  let query = trx
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
    .innerJoin(
      'patient_conditions',
      'patient_conditions.id',
      'patient_condition_medications.patient_condition_id',
    )
    .innerJoin('conditions', 'patient_conditions.condition_id', 'conditions.id')
    .leftJoin(
      'patient_prescription_medications_filled',
      'patient_prescription_medications_filled.patient_prescription_medication_id',
      'patient_prescription_medications.id',
    )
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
      'conditions.name as condition_name',
      eb('patient_prescription_medications_filled.id', 'is not', null).as(
        'is_filled',
      ),
      isoDate(eb.ref('patient_condition_medications.start_date')).$notNull().as(
        'start_date',
      ),
      longFormattedDate('patient_condition_medications.start_date').as(
        'start_date_formatted',
      ),
      sql<
        MedicationSchedule[]
      >`TO_JSON(patient_condition_medications.schedules)`.as('schedules'),
    ])

  if (options?.omit_filled) {
    query = query.where(
      'patient_prescription_medications_filled.id',
      'is',
      null,
    )
  }

  const patient_medications = await query.execute()

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
    .map((m) => {
      const duration = 1 + durationBetween(m.start_date, m.end_date).duration
      return {
        ...m,
        strength_display: `${m.strength}${m.strength_numerator_unit}/${
          m
              .strength_denominator === 1
            ? ''
            : m.strength_denominator
        }${m.strength_denominator_unit}`,
        schedules_display: `${
          intakeFrequencyText(m.intake_frequency)
        } for ${duration} ${pluralize('day', duration)}`,
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

export function describeMedication(
  medication: PrescriptionMedication,
): string {
  assert(typeof medication.start_date === 'string')
  assert(typeof medication.end_date === 'string')
  const duration = durationBetween(medication.start_date, medication.end_date)
    .duration + 1

  assert(typeof medication.intake_frequency === 'string')
  assertIntakeFrequency(medication.intake_frequency)

  const dosesPerDay = IntakeDosesPerDay[medication.intake_frequency]

  const singleDosage = dosageDisplay({
    dosage: medication.dosage / medication.strength_denominator,
    ...omit(medication, ['dosage']),
  })

  const totalDosage = dosageDisplay({
    dosage: medication.dosage / medication.strength_denominator,
    totalDosageMultiplier: duration * dosesPerDay,
    ...omit(medication, ['dosage']),
  })

  return `*${medication.name}* : ${singleDosage} per dose * ${dosesPerDay} ${
    pluralize('dose', dosesPerDay)
  } per day * ${duration} ${pluralize('day', duration)} = ${totalDosage}`
    .toLowerCase()
}
