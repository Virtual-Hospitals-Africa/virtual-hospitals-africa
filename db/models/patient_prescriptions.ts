import { Maybe, MedicationSchedule, TrxOrDbOrQueryCreator } from '../../types.ts'

import { base } from './_base.ts'
import { patient_procedures } from './patient_procedures.ts'
import { PatientRecordsSearch } from './patient_records.ts'
import { formatRecord } from '../../shared/patient_records.ts'

export type PrescriptionMedicationInsert = {
  route: string
  patient_condition_id: string
  medication_id: string
  strength: string
  special_instructions?: Maybe<string>
  schedules: MedicationSchedule[]
}

export const patient_prescriptions = base({
  top_level_table: 'patient_prescription_signatures',
  baseQuery(trx: TrxOrDbOrQueryCreator, opts: PatientRecordsSearch) {
    return patient_procedures.baseQuery(trx, opts)
      .innerJoin('patient_prescription_signatures', 'patient_procedures.id', 'patient_prescription_signatures.id')
      .select((eb) => [
        eb.selectFrom('patient_prescription_redemption_codes')
          .whereRef('patient_prescription_signature_id', '=', 'patient_prescription_signatures.id')
          .select('patient_prescription_redemption_codes.alphanumeric_code')
          .as('alphanumeric_code'),
      ])
  },
  formatResult: formatRecord,
})

// export const prescriptions = {
//   getById(
//     trx: TrxOrDbOrQueryCreator,
//     id: string,
//   ): Promise<RenderedPrescription | undefined> {
//     return baseQuery(trx)
//       .where('prescriptions.id', '=', id)
//       .executeTakeFirst()
//   },
//   async upsert(
//     trx: TrxOrDbOrQueryCreator,
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
//     trx: TrxOrDbOrQueryCreator,
//     code: string,
//   ) {
//     return trx
//       .deleteFrom('patient_prescription_redemption_codes')
//       .where('alphanumeric_code', '=', code)
//       .execute()
//   },
//   async getFromReview(
//     trx: TrxOrDbOrQueryCreator,
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
