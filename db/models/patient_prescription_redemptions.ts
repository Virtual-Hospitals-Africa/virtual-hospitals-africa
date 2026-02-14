// import { sql } from 'kysely'
// import { Maybe, MedicationSchedule, RenderedPrescription, RenderedPrescriptionWithMedications, TrxOrDb } from '../../types.ts'
// import { drugs } from './drugs.ts'
// import { assert } from 'std/assert/assert.ts'

// export type PrescriptionMedicationInsert = {
//   route: string
//   patient_condition_id: string
//   medication_id: string
//   strength: string
//   special_instructions?: Maybe<string>
//   schedules: MedicationSchedule[]
// }

// function baseQuery(trx: TrxOrDb) {
//   return trx
//     .selectFrom('patient_prescriptions')
//     .leftJoin(
//       'patient_prescription_redemption_codes',
//       'prescriptions.id',
//       'patient_prescription_redemption_codes.prescription_id',
//     )
//     .innerJoin(
//       'employment',
//       'employment.id',
//       'prescriptions.prescriber_id',
//     )
//     .innerJoin(
//       'health_workers',
//       'health_workers.id',
//       'employment.health_worker_id',
//     )
//     .leftJoin(
//       'doctor_registration_details',
//       'doctor_registration_details.id',
//       'health_workers.id',
//     )
//     .selectAll('prescriptions')
//     .select('patient_prescription_redemption_codes.alphanumeric_code')
//     // TODO: remove this once nurses can prescribe medications
//     .select(sql<string>`'Dr. ' || health_workers.name`.as('prescriber_name'))
//     .select('health_workers.email as prescriber_email')
//     .select(
//       'doctor_registration_details.mobile_number as prescriber_mobile_number',
//     )
// }

// export const prescriptions = {
//   getById(
//     trx: TrxOrDb,
//     id: string,
//   ): Promise<RenderedPrescription | undefined> {
//     return baseQuery(trx)
//       .where('prescriptions.id', '=', id)
//       .executeTakeFirst()
//   },
//   getByCode(
//     trx: TrxOrDb,
//     code: string,
//   ) {
//     return trx
//       .selectFrom('patient_prescription_redemption_codes')
//       .innerJoin(
//         'prescriptions',
//         'prescriptions.id',
//         'patient_prescription_redemption_codes.prescription_id',
//       )
//       .where('alphanumeric_code', '=', code)
//       .select('prescriptions.id')
//       .select('patient_prescription_redemption_codes.created_at')
//       .select('patient_prescription_redemption_codes.updated_at')
//       .select('prescriptions.prescriber_id')
//       .select('prescriptions.patient_id')
//       .select('patient_prescription_redemption_codes.alphanumeric_code')
//       .executeTakeFirst()
//   },
//   async upsert(
//     trx: TrxOrDb,
//     { prescribing, ...to_insert }:
//       & {
//         prescriber_id: string
//         patient_id: string
//         prescribing: PrescriptionMedicationInsert[]
//       }
//       & ({
//         doctor_review_id: string
//         patient_encounter_id?: never
//       } | {
//         doctor_review_id?: never
//         patient_encounter_id: string
//       }),
//   ) {
//     // TODO remove old medications

//     assert(prescribing.length > 0)

//     const prescription = await trx
//       .insertInto('prescriptions')
//       .values(to_insert)
//       .returningAll()
//       .executeTakeFirstOrThrow()

//     await trx
//       .insertInto('patient_prescription_redemption_codes')
//       .values({ prescription_id: prescription.id })
//       .executeTakeFirstOrThrow()

//     const condition_medications = await trx
//       .insertInto('patient_condition_medications')
//       .values(
//         prescribing.map((
//           {
//             schedules,
//             route,
//             patient_condition_id,
//             medication_id,
//             strength,
//             special_instructions,
//           },
//         ) => ({
//           route,
//           patient_condition_id,
//           medication_id,
//           strength,
//           special_instructions,
//           schedules: sql<string[]>`
//           ARRAY[${
//             sql.raw(
//               schedules.map((schedule) => `ROW('${schedule.dosage}', '${schedule.frequency}', ${schedule.duration}, '${schedule.duration_unit}')`).join(','),
//             )
//           }]::medication_schedule[]
//         `,
//         })),
//       )
//       .returning('id')
//       .execute()

//     const prescriptions = condition_medications
//       .map((medication) => ({
//         patient_condition_medication_id: medication.id,
//         prescription_id: prescription.id,
//       }))

//     await trx
//       .insertInto('prescriptions')
//       .values(prescriptions)
//       .execute()

//     return prescription
//   },
//   deleteCode(
//     trx: TrxOrDb,
//     code: string,
//   ) {
//     return trx
//       .deleteFrom('patient_prescription_redemption_codes')
//       .where('alphanumeric_code', '=', code)
//       .execute()
//   },
//   async getFromReview(
//     trx: TrxOrDb,
//     { review_id }: { review_id: string },
//   ): Promise<RenderedPrescriptionWithMedications | null> {
//     const prescription = await baseQuery(trx)
//       .where('prescriptions.doctor_review_id', '=', review_id)
//       .executeTakeFirst()

//     if (!prescription) return null

//     const medications_of_prescription = await prescriptions
//       .getByPrescriptionId(
//         trx,
//         prescription.id,
//       )

//     const drug_ids = medications_of_prescription.map((m) => m.drug_id)

//     const drugs_of_medications = await drugs.getByIds(trx, drug_ids)

//     const medications_with_drugs = medications_of_prescription.map(
//       (medication) => {
//         const drug = drugs_of_medications.find((drug) => drug.id === medication.drug_id)
//         assert(drug)
//         return { ...medication, drug }
//       },
//     )

//     return {
//       ...prescription,
//       medications: medications_with_drugs,
//     }
//   },
// }
