// import type { InsertObject } from 'kysely'
// import type { DB } from '../../../../db.d.ts'
// import type { TrxOrDb } from '../../../../types.ts'
// import generateUUID from '../../../../util/uuid.ts'
// import { insertChunks } from '../../../helpers.ts'
// import type { ResolvedRecommendedDose } from './shared.ts'

// export async function insertRecommendedDoses(
//   trx: TrxOrDb,
//   resolved_doses: ResolvedRecommendedDose[],
// ) {
//   for (const { schedules, indication_snomed_concept_ids, ...dose } of resolved_doses) {
//     const insert_doses: InsertObject<DB, 'recommended_doses'>[] = []
//     const insert_schedules: InsertObject<DB, 'recommended_dose_schedules'>[] = []
//     const insert_ingredients: InsertObject<DB, 'recommended_dose_ingredients'>[] = []
//     const insert_ingredient_strengths: InsertObject<DB, 'recommended_dose_ingredient_strengths'>[] = []
//     const insert_indications: InsertObject<DB, 'recommended_dose_indications'>[] = []
//     const recommended_dose_id = generateUUID()

//     insert_doses.push({
//       id: recommended_dose_id,
//       ...dose,
//     })

//     for (const [schedule_index, { ingredients, ...schedule }] of schedules.entries()) {
//       const schedule_id = generateUUID()

//       insert_schedules.push({
//         id: schedule_id,
//         recommended_dose_id,
//         ...schedule,
//         order: schedule_index,
//       })

//       for (const ingredient of ingredients) {
//         const id = generateUUID()
//         insert_ingredients.push({
//           id,
//           recommended_dose_schedule_id: schedule_id,
//           active_ingredient_snomed_concept_id: ingredient.active_ingredient_snomed_concept_id,
//         })
//         if (ingredient.strength) {
//           insert_ingredient_strengths.push({
//             id,
//             units_snomed_concept_id: ingredient.strength.units_snomed_concept_id,
//             value: ingredient.strength.value,
//             value_low: ingredient.strength.value_low,
//             value_high: ingredient.strength.value_high,
//           })
//         }
//       }
//     }

//     for (const indication_snomed_concept_id of indication_snomed_concept_ids) {
//       insert_indications.push({
//         recommended_dose_id,
//         indication_snomed_concept_id,
//       })
//     }
//     console.log({ insert_doses, insert_schedules, insert_ingredients, insert_ingredient_strengths, insert_indications })
//     await insertChunks(trx, 'recommended_doses', insert_doses)
//     await insertChunks(trx, 'recommended_dose_schedules', insert_schedules)
//     await insertChunks(trx, 'recommended_dose_ingredients', insert_ingredients)
//     await insertChunks(trx, 'recommended_dose_ingredient_strengths', insert_ingredient_strengths)
//     await insertChunks(trx, 'recommended_dose_indications', insert_indications)
//   }
// }

// // import type { InsertObject } from 'kysely'
// // import type { DB, MedicationFrequency } from '../../../../db.d.ts'
// // import type { TrxOrDb } from '../../../../types.ts'
// // import generateUUID from '../../../../util/uuid.ts'
// // import { insertChunks } from '../../../helpers.ts'
// // import type { ResolvedRecommendedDose } from './shared.ts'
// // import { DOSAGES } from '../../../../shared/prescription.ts'

// // export async function insertRecommendedDoses(
// //   trx: TrxOrDb,
// //   resolved_doses: ResolvedRecommendedDose[],
// // ) {
// //   const insert_doses: InsertObject<DB, 'recommended_doses'>[] = []
// //   const insert_schedules: InsertObject<DB, 'recommended_dose_schedules'>[] = []
// //   const insert_ingredient_strengths: InsertObject<DB, 'recommended_dose_ingredient_strengths'>[] = []
// //   const insert_indications: InsertObject<DB, 'recommended_dose_indications'>[] = []

// //   for (const { schedules, indication_snomed_concept_ids, ...dose } of resolved_doses) {
// //     const recommended_dose_id = generateUUID()

// //     insert_doses.push({
// //       id: recommended_dose_id,
// //       ...dose
// //     })

// //     for (const [schedule_index, {  ingredient_strengths, ...schedule}] of schedules.entries()) {
// //       const schedule_id = generateUUID()

// //       insert_schedules.push({
// //         id: schedule_id,
// //         recommended_dose_id,
// //         // PrescriptionFrequency and MedicationFrequency share the same string union
// //         frequency: schedule.frequency as MedicationFrequency,
// //         dosage: schedule.dosage,
// //         duration: schedule.duration,
// //         duration_unit: schedule.duration_unit,
// //         order: schedule_index,
// //       })

// //       for (const strength of ingredient_strengths) {
// //         insert_ingredient_strengths.push({
// //           id: generateUUID(),
// //           recommended_dose_schedule_id: schedule_id,
// //           ...strength
// //         })
// //       }
// //     }

// //     for (const indication_snomed_concept_id of indication_snomed_concept_ids) {
// //       insert_indications.push({
// //         recommended_dose_id,
// //         indication_snomed_concept_id,
// //       })
// //     }
// //   }

// //   console.log(
// //     `Inserting: ${insert_doses.length} recommended_doses, ` +
// //       `${insert_schedules.length} schedules, ` +
// //       `${insert_ingredient_strengths.length} ingredient_strengths, ` +
// //       `${insert_indications.length} indications`,
// //   )

// //   await insertChunks(trx, 'recommended_doses', insert_doses)
// //   await insertChunks(trx, 'recommended_dose_schedules', insert_schedules)
// //   await insertChunks(trx, 'recommended_dose_ingredient_strengths', insert_ingredient_strengths)
// //   await insertChunks(trx, 'recommended_dose_indications', insert_indications)
// // }
