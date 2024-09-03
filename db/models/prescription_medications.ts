import { sql } from 'kysely'
import {
  MedicationSchedule,
  PrescriptionMedication,
  TrxOrDb,
} from '../../types.ts'
import { assert } from 'std/assert/assert.ts'
import { PrescriptionMedicationsFilled } from '../../db.d.ts'

export async function getByPrescriptionId(
  trx: TrxOrDb,
  prescription_id: string,
  options?: {
    unfilled?: boolean
    filled?: boolean
  },
): Promise<PrescriptionMedication[]> {
  let query = trx
    .selectFrom('prescriptions')
    .innerJoin(
      'prescription_medications',
      'prescriptions.id',
      'prescription_medications.prescription_id',
    )
    .innerJoin(
      'patient_condition_medications',
      'prescription_medications.patient_condition_medication_id',
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
      'prescription_medications_filled',
      'prescription_medications_filled.prescription_medication_id',
      'prescription_medications.id',
    )
    .where('prescriptions.id', '=', prescription_id)
    .select((eb) => [
      'prescription_medications.id as prescription_medication_id',
      'patient_condition_medications.patient_condition_id',
      'patient_conditions.condition_id',
      'drugs.generic_name as drug_generic_name',
      'drugs.id as drug_id',
      'medications.form',
      'medications.id as medication_id',
      'patient_condition_medications.route',
      'patient_condition_medications.strength as strength_numerator',
      'medications.strength_numerator_unit',
      'medications.strength_denominator',
      'medications.strength_denominator_unit',
      'medications.strength_denominator_is_units',
      'patient_condition_medications.special_instructions',
      'conditions.name as condition_name',
      eb('prescription_medications_filled.id', 'is not', null).as(
        'is_filled',
      ),
      sql<
        MedicationSchedule[]
      >`TO_JSON(patient_condition_medications.schedules)`.as('schedules'),
    ])
    .orderBy('drugs.generic_name asc')

  if (options?.unfilled) {
    assert(!options.filled)
    query = query.where(
      'prescription_medications_filled.id',
      'is',
      null,
    )
  }
  if (options?.filled) {
    assert(!options.unfilled)
    query = query.where(
      'prescription_medications_filled.id',
      'is not',
      null,
    )
  }

  const patient_medications = await query.execute()

  return patient_medications
    .map(({ strength_numerator, strength_denominator, ...medication }) => ({
      ...medication,
      strength_numerator: Number(strength_numerator),
      strength_denominator: Number(strength_denominator),
    }))
}

export function fill(
  trx: TrxOrDb,
  dispensed_medications: Omit<
    PrescriptionMedicationsFilled,
    'id' | 'created_at' | 'updated_at'
  >[],
) {
  return trx
    .insertInto('prescription_medications_filled')
    .values(dispensed_medications)
    .returningAll()
    .execute()
}

export function undoFill(
  trx: TrxOrDb,
  { prescription_id }: { prescription_id: string },
) {
  return trx
    .deleteFrom('prescription_medications_filled')
    .where('prescription_medication_id', 'in', eb => 
      eb.selectFrom('prescription_medications')
        .where('prescription_id', '=', prescription_id)
        .select('id')
      )
    .execute()
}
