import type { AppliedDose, Medicine, ParsedPatientCase } from '../recommended_doses.ts'
import type { SnomedIcd10MappingResult } from '../snomed_to_icd10.ts'

// Minimal record used by the standalone CDS tool (plain SNOMED concept ID, not a full encounter record).
export type CdsSnomedRecord = { specific_snomed_concept_id: string }

export type RecommendedMedicineWithPatientCase = Omit<Medicine, 'schedules'> & {
  patient_case: ParsedPatientCase
  schedules: AppliedDose[]
  due_to: CdsSnomedRecord[]
}

export type RecommendedDoseCalculatorLookup = {
  mapping_result: SnomedIcd10MappingResult<CdsSnomedRecord>
  conditions_for_lookup: string[]
  matching_medicines: RecommendedMedicineWithPatientCase[]
}
