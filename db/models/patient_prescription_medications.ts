// import { sql } from 'kysely'
// import { MedicationSchedule, PrescriptionMedication, TrxOrDbOrQueryCreator } from '../../types.ts'
// import { assert } from 'std/assert/assert.ts'
// import { PrescriptionMedicationsFilled } from '../../db.d.ts'

// export const prescriptions = {
//   baseQuery(trx: TrxOrDbOrQueryCreator) {
//     return trx
//       .selectFrom('prescriptions')
//       .innerJoin(
//         'prescriptions',
//         'prescriptions.id',
//         'prescriptions.prescription_id',
//       )
//       .innerJoin(
//         'medications',
//         'patient_condition_medications.medication_id',
//         'medications.id',
//       )
//       .innerJoin('drugs', 'medications.drug_id', 'drugs.id')
//       .innerJoin(
//         'patient_conditions',
//         'patient_conditions.id',
//         'patient_condition_medications.patient_condition_id',
//       )
//       .innerJoin(
//         'conditions',
//         'patient_conditions.condition_id',
//         'conditions.id',
//       )
//       .leftJoin(
//         'prescriptions_filled',
//         'prescriptions_filled.prescription_id',
//         'prescriptions.id',
//       )
//       .select((eb) => [
//         'prescriptions.id as prescription_id',
//         'patient_condition_medications.patient_condition_id',
//         'patient_conditions.condition_id',
//         'drugs.generic_name as drug_generic_name',
//         'drugs.id as drug_id',
//         'medications.form',
//         'medications.id as medication_id',
//         'patient_condition_medications.route',
//         'patient_condition_medications.strength as strength_numerator',
//         'medications.strength_numerator_unit',
//         'medications.strength_denominator',
//         'medications.strength_denominator_unit',
//         'medications.description_is_units',
//         'patient_condition_medications.special_instructions',
//         'conditions.name as condition_name',
//         eb('prescriptions_filled.id', 'is not', null).as(
//           'is_filled',
//         ),
//         sql<
//           MedicationSchedule[]
//         >`TO_JSON(patient_condition_medications.schedules)`.as('schedules'),
//       ])
//       .orderBy('drugs.generic_name', 'asc')
//   },
//   getByPrescriptionId(
//     trx: TrxOrDbOrQueryCreator,
//     prescription_id: string,
//     options?: {
//       unfilled?: boolean
//       filled?: boolean
//     },
//   ): Promise<PrescriptionMedication[]> {
//     let query = prescriptions.baseQuery(trx).where(
//       'prescriptions.id',
//       '=',
//       prescription_id,
//     )

//     if (options?.unfilled) {
//       assert(!options.filled)
//       query = query.where(
//         'prescriptions_filled.id',
//         'is',
//         null,
//       )
//     }
//     if (options?.filled) {
//       assert(!options.unfilled)
//       query = query.where(
//         'prescriptions_filled.id',
//         'is not',
//         null,
//       )
//     }

//     return query.execute()
//   },
//   getById(
//     trx: TrxOrDbOrQueryCreator,
//     prescription_id: string,
//   ): Promise<PrescriptionMedication> {
//     return prescriptions.baseQuery(trx)
//       .where('prescriptions.id', '=', prescription_id)
//       .executeTakeFirstOrThrow()
//   },
//   fill(
//     trx: TrxOrDbOrQueryCreator,
//     dispensed_medications: Omit<
//       PrescriptionMedicationsFilled,
//       'id' | 'created_at' | 'updated_at'
//     >[],
//   ) {
//     return trx
//       .insertInto('prescriptions_filled')
//       .values(dispensed_medications)
//       .returningAll()
//       .execute()
//   },
//   undoFill(
//     trx: TrxOrDbOrQueryCreator,
//     { prescription_id }: { prescription_id: string },
//   ) {
//     return trx
//       .deleteFrom('prescriptions_filled')
//       .where(
//         'prescription_id',
//         'in',
//         (eb) =>
//           eb.selectFrom('prescriptions')
//             .where('prescription_id', '=', prescription_id)
//             .select('id'),
//       )
//       .execute()
//   },
// }
