import { recommended_doses } from './recommended_doses.ts'
import { snomed_to_icd10 } from './snomed_to_icd10.ts'
import type { ParsedPatientCase } from '../../shared/recommended_doses.ts'
import type { RecommendedDoseCalculatorLookup } from '../../shared/recommended_dose_calculator/lookup.ts'
import type { TrxOrDb } from '../../types.ts'

export type { RecommendedDoseCalculatorLookup } from '../../shared/recommended_dose_calculator/lookup.ts'

export const recommended_dose_calculator = {
  async lookup(
    trx: TrxOrDb,
    patient_case: ParsedPatientCase,
  ): Promise<RecommendedDoseCalculatorLookup> {
    const mapping_result = await snomed_to_icd10.mapConcepts(
      trx,
      patient_case.snomed_concept_ids,
      { sex: patient_case.sex, dob: patient_case.dob },
    )
    const primary_snomed_icd10 = snomed_to_icd10.primaryIcd10CodesForLookup(mapping_result)
    const conditions_for_lookup = [...patient_case.conditions, ...primary_snomed_icd10]
    const matching_medicines = await recommended_doses.getRecommendedDosesWithPatientCaseApplied({
      ...patient_case,
      conditions: conditions_for_lookup,
    })

    return {
      mapping_result,
      conditions_for_lookup,
      matching_medicines,
    }
  },
}
