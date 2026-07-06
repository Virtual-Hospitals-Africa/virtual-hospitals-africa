import { recommended_doses } from './recommended_doses.ts'
import { snomed_to_icd10 } from './snomed_to_icd10.ts'
import { primaryIcd10CodesFromSnomedMappings } from '../../shared/snomed_to_icd10.ts'
import type { ParsedPatientCase } from '../../shared/recommended_doses.ts'
import type { RecommendedMedicineGroup, RecommendedMedicineOption, RenderedPositiveRecordRelativeToHealthWorker, TrxOrDb } from '../../types.ts'
import compact from '../../util/compact.ts'
import matching from '../../util/matching.ts'

// Medicines are recommended per EML row (one row per form/route/dose spec), so
// the same medicine often matches several times. Group rows sharing a medicine
// name into one recommendation, then group its options by form/route, unioning
// due_to across all of them.
function groupByMedicineName(medicines_with_patient_case: Array<RecommendedMedicineOption & { patient_case: unknown }>): RecommendedMedicineGroup[] {
  const groups = new Map<string, RecommendedMedicineGroup>()
  for (const { patient_case: _patient_case, ...medicine } of medicines_with_patient_case) {
    let group = groups.get(medicine.medicine.name)
    if (!group) {
      group = { medicine_name: medicine.medicine.name, due_to: [], forms: [] }
      groups.set(medicine.medicine.name, group)
    }
    const form_route = compact([medicine.form, medicine.route]).join(' · ')
    let form = group.forms.find(matching({ form_route }))
    if (!form) {
      form = { form_route, options: [] }
      group.forms.push(form)
    }
    form.options.push(medicine)
    for (const record of medicine.due_to) {
      if (!group.due_to.some((existing) => existing.id === record.id)) {
        group.due_to.push(record)
      }
    }
  }
  return [...groups.values()]
}

export const recommended_dose_calculator = {
  async lookup<PositiveRecord extends RenderedPositiveRecordRelativeToHealthWorker>(
    trx: TrxOrDb,
    patient_case: ParsedPatientCase,
    positive_records: PositiveRecord[],
  ): Promise<RecommendedMedicineGroup[]> {
    const mapping_result = await snomed_to_icd10.mapConcepts<PositiveRecord>(
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
