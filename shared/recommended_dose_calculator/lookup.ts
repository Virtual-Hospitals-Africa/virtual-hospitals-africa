import type { AppliedDose, Medicine, ParsedPatientCase } from '../recommended_doses.ts'
import type { SnomedIcd10MappingResult } from '../snomed_to_icd10.ts'

export type RecommendedMedicineWithPatientCase = Omit<Medicine, 'schedules'> & {
  patient_case: ParsedPatientCase
  schedules: AppliedDose[]
}

export type RecommendedDoseCalculatorLookup = {
  mapping_result: SnomedIcd10MappingResult
  conditions_for_lookup: string[]
  matching_medicines: RecommendedMedicineWithPatientCase[]
}
