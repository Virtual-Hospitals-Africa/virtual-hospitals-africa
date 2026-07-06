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

export type SnomedIcd10MappingResult<PositiveRecord extends { specific_snomed_concept_id: string }> = {
  by_concept: Map<PositiveRecord, SnomedIcd10ConceptMapping>
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
