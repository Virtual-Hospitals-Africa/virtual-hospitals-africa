import { recommended_doses } from './recommended_doses.ts'
import { snomed_to_icd10 } from './snomed_to_icd10.ts'
import { primaryIcd10CodesFromSnomedMappings } from '../../shared/snomed_to_icd10.ts'
import type { ParsedPatientCase } from '../../shared/recommended_doses.ts'
import type { RecommendedMedicineGroup, RecommendedMedicineOption, RenderedPositiveRecordRelativeToHealthWorker, TrxOrDb } from '../../types.ts'

// Medicines are recommended per EML row (one row per form/route/dose spec), so
// the same medicine often matches several times. Group rows sharing a medicine
// name into one recommendation with multiple options, unioning their due_to.
function groupByMedicineName(medicines_with_patient_case: Array<RecommendedMedicineOption & { patient_case: unknown }>): RecommendedMedicineGroup[] {
  const groups = new Map<string, RecommendedMedicineGroup>()
  for (const { patient_case: _patient_case, ...medicine } of medicines_with_patient_case) {
    const group = groups.get(medicine.medicine.name)
    if (!group) {
      groups.set(medicine.medicine.name, {
        name: medicine.medicine.name,
        due_to: [...medicine.due_to],
        options: [medicine],
      })
      continue
    }
    group.options.push(medicine)
    for (const record of medicine.due_to) {
      if (!group.due_to.some((existing) => existing.id === record.id)) {
        group.due_to.push(record)
      }
    }
  }
  return [...groups.values()]
}

export const recommended_dose_calculator = {
  async lookup(
    trx: TrxOrDb,
    patient_case: ParsedPatientCase,
    positive_records: RenderedPositiveRecordRelativeToHealthWorker[],
  ): Promise<RecommendedMedicineGroup[]> {
    const mapping_result = await snomed_to_icd10.mapConcepts(
      trx,
      patient_case,
      positive_records,
    )
    const sources = [...mapping_result.by_concept.entries()].flatMap(([record, mapping]) => {
      const codes = primaryIcd10CodesFromSnomedMappings([mapping])
      return codes.length ? [{ due_to: record, codes }] : []
    })
    const matching_medicines = await recommended_doses.getRecommendedDosesWithPatientCaseApplied(patient_case, sources)
    return groupByMedicineName(matching_medicines)
  },
}
