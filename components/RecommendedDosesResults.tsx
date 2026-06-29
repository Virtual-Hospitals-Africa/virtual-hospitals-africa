import { RecommendedMedication } from './RecommendedMedication.tsx'
import { DecisionSupportDisclaimer, SnomedIcd10MappingAudit } from './SnomedIcd10MappingAudit.tsx'
import type { RecommendedDoseCalculatorLookup } from '../shared/recommended_dose_calculator/lookup.ts'
import type { ParsedPatientCase } from '../shared/recommended_doses.ts'
import { RECOMMENDED_DOSE_CALCULATOR_SUGGESTED_MEDICATIONS_HEADER } from '../shared/snomed_to_icd10.ts'

type RecommendedDosesResultsProps = {
  patient_case: ParsedPatientCase
  lookup: RecommendedDoseCalculatorLookup
  snomed_source_description?: string
  icd10_lookup_description?: string
}

export function RecommendedDosesResults({
  patient_case,
  lookup,
  snomed_source_description =
    'SNOMED concepts from this visit (diagnoses and documented findings) are translated to suggested ICD-10 candidate codes for matching. Supplementary map groups appear in the audit trail below and do not broaden suggestions.',
  icd10_lookup_description =
    'Primary SNOMED-derived candidates only. Supplementary SNOMED map groups are listed in the audit trail below and do not broaden suggestions.',
}: RecommendedDosesResultsProps) {
  const { conditions_for_lookup, mapping_result, matching_medicines } = lookup

  return (
    <div class='flex flex-col gap-6'>
      <DecisionSupportDisclaimer />

      <section class='flex flex-col gap-2'>
        <h2 class='text-lg font-semibold text-gray-900'>Patient Details</h2>
        <dl class='flex flex-col gap-1'>
          <div class='flex gap-4'>
            <dt class='w-32 text-sm font-medium text-gray-500'>Date of Birth</dt>
            <dd class='text-sm text-gray-900'>{patient_case.dob}</dd>
          </div>
          <div class='flex gap-4'>
            <dt class='w-32 text-sm font-medium text-gray-500'>Sex</dt>
            <dd class='text-sm text-gray-900'>{patient_case.sex}</dd>
          </div>
          <div class='flex gap-4'>
            <dt class='w-32 text-sm font-medium text-gray-500'>Height (cm)</dt>
            <dd class='text-sm text-gray-900'>{String(patient_case.height_cm)}</dd>
          </div>
          <div class='flex gap-4'>
            <dt class='w-32 text-sm font-medium text-gray-500'>Weight (kg)</dt>
            <dd class='text-sm text-gray-900'>{String(patient_case.weight_kg)}</dd>
          </div>
        </dl>
      </section>

      <section class='flex flex-col gap-2'>
        <h2 class='text-lg font-semibold text-gray-900'>SNOMED concepts from this visit</h2>
        <p class='text-sm text-gray-600'>{snomed_source_description}</p>
        {patient_case.snomed_concept_ids.length
          ? (
            <ul class='flex flex-col gap-1 list-disc list-inside'>
              {patient_case.snomed_concept_ids.map((snomed_concept_id) => <li key={snomed_concept_id} class='text-sm text-gray-900'>{snomed_concept_id}</li>)}
            </ul>
          )
          : (
            <p class='text-sm text-gray-500'>
              No SNOMED concepts were recorded yet. Complete triage findings or diagnoses to populate suggested dose lookup.
            </p>
          )}
      </section>

      <section class='flex flex-col gap-2'>
        <h2 class='text-lg font-semibold text-gray-900'>ICD-10 codes used for dose lookup</h2>
        <p class='text-sm text-gray-600'>{icd10_lookup_description}</p>
        {conditions_for_lookup.length
          ? (
            <ul class='flex flex-col gap-1 list-disc list-inside'>
              {conditions_for_lookup.map((code) => <li key={code} class='text-sm text-gray-900'>{code}</li>)}
            </ul>
          )
          : <p class='text-sm text-gray-500'>No ICD-10 codes available for lookup from the recorded SNOMED concepts.</p>}
      </section>

      <SnomedIcd10MappingAudit
        snomed_concept_ids={patient_case.snomed_concept_ids}
        mappings={mapping_result}
      />

      <section class='flex flex-col gap-2'>
        <h2 class='text-lg font-semibold text-gray-900'>
          {RECOMMENDED_DOSE_CALCULATOR_SUGGESTED_MEDICATIONS_HEADER}
          {matching_medicines.length > 0 && <span class='ml-2 text-sm font-normal text-gray-500'>({matching_medicines.length})</span>}
        </h2>
        <p class='text-sm text-gray-600'>
          Dose calculations below are suggestions based on the codes above. Review each option before prescribing.
        </p>
        {matching_medicines.length
          ? (
            <div class='flex flex-col gap-4'>
              {matching_medicines.map((med) => (
                <RecommendedMedication
                  key={`${med.atc}-${med.medicine.name}-${med.disorder}`}
                  medicine={med}
                />
              ))}
            </div>
          )
          : (
            <p class='text-sm text-gray-500'>
              {!conditions_for_lookup.length ? 'No ICD-10 codes specified for lookup.' : 'No suggested medications matched the specified ICD-10 codes.'}
            </p>
          )}
      </section>
    </div>
  )
}
