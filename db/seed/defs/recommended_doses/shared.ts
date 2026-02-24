// import type { DurationUnits, Prescriber } from '../../../../db.d.ts'
// import type { PrescriptionFrequency } from '../../../../shared/prescription.ts'
// import { Maybe, NonEmptyArray } from '../../../../types.ts'

// // ─── Types for EML recommended-dose ETL ──────────────────────────────────────

// type ICD10IndicationsCodes = { type: 'codes'; codes: string[] }
// type ICD10Indications =
//   | ICD10IndicationsCodes
//   | { type: 'and'; indications: ICD10IndicationsCodes[] }

// type ExactValueOrRange = number | [number, number]
// export type ParsedMedicine = {
//   medicine_name: string
//   atc: string
//   form: string
//   route: string
//   aware: null | 'Watch' | 'Access' | 'Reserve'
//   acute_chronic: null | 'Acute' | 'Chronic'
//   prescriber: Prescriber | null
//   special_instructions: string | null
//   icd10_indications: ICD10Indications
//   dose_recommendations: NonEmptyArray<{
//     age_years_range: {
//       min: number
//       max?: Maybe<number>
//     }
//     ingredients: {
//       name: string
//       strength: null | {
//         value: number
//         units: string
//       }
//     }[]
//     dosage_units: string
//     schedules: NonEmptyArray<{
//       frequencies: NonEmptyArray<PrescriptionFrequency>
//       dosage: {
//         value: ExactValueOrRange
//         per_time?: 'min' | 'hr' | 'day'
//         per_size?: 'kg' | 'm2'
//         max?: {
//           value: number
//           per_time?: 'min' | 'hr' | 'day'
//           per_size?: 'kg' | 'm2'
//         }
//       }
//       duration: null | {
//         value: ExactValueOrRange
//         units: DurationUnits
//       }
//     }>
//   }>
// }

// export type ResolvedRecommendedDose = {
//   medicine_snomed_concept_id: string
//   atc: string
//   form_snomed_concept_id: string
//   route_snomed_concept_id: string
//   age_years_low: number
//   age_years_high: number | null
//   prescriber: Prescriber
//   special_instructions: string | null
//   regulatory_agency_id: string
//   schedules: any[]
//   indication_snomed_concept_ids: string[]
// }

// // ─── Types retained from inventory-medication ETL (used by lookup.ts) ─────────
// export type ParsedDoseBase<Ingredient> = {
//   value: string
//   description: string
//   ingredients: Ingredient[]
// }

// export type ParsedDose = ParsedDoseBase<ParsedIngredient>
// export type ParsedDoseWhoseIngredientsAreSnomedConcepts = ParsedDoseBase<ParsedIngredient & { snomed_concept_id: string }>

// export type ParsedMedicationBase<Dose> = {
//   form: string
//   routes: string[]
//   doses: Dose[]
//   trade_name: string
//   registration_no: string
//   applicant_name: string
//   manufacturers: string
//   country: string
// }

// export type ParsedMedication = ParsedMedicationBase<ParsedDose>

// export type ParsedMedicationWhoseIngredientsAreSnomedConcepts = ParsedMedicationBase<ParsedDoseWhoseIngredientsAreSnomedConcepts>

// export type ParsedMedicationWithSnomedConceptMedicinalProduct = ParsedMedicationWhoseIngredientsAreSnomedConcepts & { snomed_concept_id: string }
