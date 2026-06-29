// SNOMED CT → ICD-10 complex map constants and decision-support framing.
// See docs/clinical_decision_support/recommended_dose_calculator.md

export const SNOMED_ICD10_COMPLEX_MAP_REFSET_ID = '447562003'

// IFA rule context concepts (International Edition ICD-10 complex map).
export const SNOMED_IFA_FEMALE_CONCEPT_ID = '248152002'
export const SNOMED_IFA_MALE_CONCEPT_ID = '248153007'
export const SNOMED_IFA_AGE_AT_ONSET_CONCEPT_ID = '445518008'

export const SNOMED_MAP_CATEGORY = {
  properly_classified: '447637006',
  not_classifiable: '447638001',
  context_dependent: '447639009',
} as const

export const SNOMED_MAP_CORRELATION = {
  not_specified: '447561005',
  exact: '447561009',
  narrower: '447562005',
  broader: '447563000',
  partial_overlap: '447564006',
} as const

export type SnomedIcd10PatientContext = {
  sex: 'male' | 'female'
  dob: string
}

export type SnomedIcd10MapStatus =
  | 'mapped'
  | 'not_classifiable'
  | 'unresolved_context'
  | 'no_mapping'

export type SnomedIcd10ResolvedVia = 'unconditional' | 'context' | 'fallback'

export type SnomedIcd10CodeMapping = {
  icd10_code: string
  map_group: number
  is_primary: boolean
  map_category_id: string
  correlation_id: string
  map_rule: string
  map_advice: string | null
  resolved_via: SnomedIcd10ResolvedVia
}

export type SnomedIcd10ConceptMapping = {
  snomed_concept_id: string
  status: SnomedIcd10MapStatus
  codes: SnomedIcd10CodeMapping[]
}

export type SnomedIcd10MappingResult = {
  by_concept: Map<string, SnomedIcd10ConceptMapping>
}

// EML dose lookup matches on primary ICD-10 codes (map group 1) from SNOMED only.
// Supplementary manifestation / external-cause codes remain visible in the audit trail
// but are not used to broaden medication suggestions.
export function primaryIcd10CodesFromSnomedMappings(
  mappings: Iterable<SnomedIcd10ConceptMapping>,
): string[] {
  const codes: string[] = []
  for (const mapping of mappings) {
    for (const code of mapping.codes) {
      if (code.is_primary && !codes.includes(code.icd10_code)) {
        codes.push(code.icd10_code)
      }
    }
  }
  return codes
}

export function mapCategoryLabel(map_category_id: string): string | null {
  switch (map_category_id) {
    case SNOMED_MAP_CATEGORY.properly_classified:
      return null
    case SNOMED_MAP_CATEGORY.not_classifiable:
      return 'Not classifiable — please confirm'
    case SNOMED_MAP_CATEGORY.context_dependent:
      return 'Context-dependent mapping — please verify'
    default:
      return null
  }
}

export function correlationLabel(correlation_id: string): string | null {
  switch (correlation_id) {
    case SNOMED_MAP_CORRELATION.not_specified:
      return null
    case SNOMED_MAP_CORRELATION.exact:
      return 'Exact match'
    case SNOMED_MAP_CORRELATION.narrower:
      return 'Narrower than source (approximate)'
    case SNOMED_MAP_CORRELATION.broader:
      return 'Broader than source (approximate)'
    case SNOMED_MAP_CORRELATION.partial_overlap:
      return 'Partial overlap (approximate)'
    default:
      return null
  }
}

export function conceptMappingClinicianMessage(mapping: SnomedIcd10ConceptMapping): string | null {
  switch (mapping.status) {
    case 'not_classifiable':
      return 'This SNOMED concept could not be classified to ICD-10 with available data. Please confirm or enter ICD-10 manually.'
    case 'unresolved_context':
      return 'Mapping depends on patient context that could not be resolved (e.g. sex-specific rules without a matching patient sex). Please confirm the ICD-10 code manually.'
    case 'no_mapping':
      return 'No ICD-10 mapping was found for this SNOMED concept. Please confirm or enter ICD-10 manually.'
    default:
      return null
  }
}

export const RECOMMENDED_DOSE_CALCULATOR_DISCLAIMER =
  'Clinical decision support only. SNOMED→ICD-10 translations and dose calculations suggest candidates for your review — they are not prescriptions and never auto-select treatment. You remain the final decision-maker for every medication and dose.'

export const RECOMMENDED_DOSE_CALCULATOR_SNOMED_FIELD_HELP =
  'Optional. Each SNOMED concept is translated to suggested ICD-10 candidate code(s) for matching — never applied without your review.'

export const RECOMMENDED_DOSE_CALCULATOR_SUBMIT_LABEL = 'Review suggested doses'

export const RECOMMENDED_DOSE_CALCULATOR_SUGGESTED_MEDICATIONS_HEADER =
  'Suggested medications (for your review)'
