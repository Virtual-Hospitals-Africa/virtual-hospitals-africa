import { SNOMED_MAP_CATEGORY, SnomedIcd10ConceptMapping, SnomedIcd10MappingResult } from '../shared/snomed_to_icd10.ts'
import cls from '../util/cls.ts'
import type { CdsSnomedRecord } from '../shared/recommended_dose_calculator/lookup.ts'

export const RECOMMENDED_DOSE_CALCULATOR_DISCLAIMER =
  'Clinical decision support only. SNOMED→ICD-10 translations and dose calculations suggest candidates for your review — they are not prescriptions and never auto-select treatment. You remain the final decision-maker for every medication and dose.'

function mapCategoryLabel(map_category_id: string): string | null {
  switch (map_category_id) {
    case SNOMED_MAP_CATEGORY.not_classifiable:
      return 'Not classifiable — please confirm'
    case SNOMED_MAP_CATEGORY.context_dependent:
      return 'Context-dependent mapping — please verify'
    default:
      return null
  }
}

function conceptMappingMessage(mapping: SnomedIcd10ConceptMapping): string | null {
  switch (mapping.status) {
    case 'not_classifiable':
      return 'This SNOMED concept could not be classified to ICD-10 with available data. Please confirm or enter ICD-10 manually.'
    case 'unresolved_context':
      return 'Mapping depends on patient context that could not be resolved. Please confirm the ICD-10 code manually.'
    case 'no_mapping':
      return 'No ICD-10 mapping was found for this SNOMED concept. Please confirm or enter ICD-10 manually.'
    default:
      return null
  }
}

function MappingStatusBadge({ mapping }: { mapping: SnomedIcd10ConceptMapping }) {
  if (mapping.status === 'mapped') return null
  const message = conceptMappingMessage(mapping)
  return (
    <p class='text-sm font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2'>
      {message}
    </p>
  )
}

function CodeDetail({
  code,
}: {
  code: SnomedIcd10ConceptMapping['codes'][number]
}) {
  const category_label = mapCategoryLabel(code.map_category_id)
  const flags = [
    code.is_primary ? 'Primary (used for dose lookup)' : 'Supplementary (audit only)',
    category_label,
    code.resolved_via === 'context' ? 'Resolved from patient sex' : null,
  ].filter(Boolean)

  return (
    <li class='text-sm text-gray-900'>
      <span class='font-medium'>{code.icd10_code}</span>
      {flags.length > 0 && (
        <span class='text-gray-500'>
          {' '}
          — {flags.join(' · ')}
        </span>
      )}
    </li>
  )
}

export function DecisionSupportDisclaimer() {
  return (
    <p class='text-sm text-indigo-900 bg-indigo-50 border border-indigo-100 rounded-md px-4 py-3'>
      {RECOMMENDED_DOSE_CALCULATOR_DISCLAIMER}
    </p>
  )
}

export function SnomedIcd10MappingAudit({
  mappings,
}: {
  mappings: SnomedIcd10MappingResult<CdsSnomedRecord>
}) {
  const entries = [...mappings.by_concept.entries()]
  if (!entries.length) return null

  return (
    <section class='flex flex-col gap-3'>
      <div class='flex flex-col gap-1'>
        <h2 class='text-lg font-semibold text-gray-900'>SNOMED → ICD-10 mapping audit</h2>
        <p class='text-sm text-gray-600'>
          Candidate ICD-10 codes suggested from SNOMED. Primary codes (map group 1) drive dose lookup; supplementary codes are shown for traceability only.
        </p>
      </div>
      <ul class='flex flex-col gap-4'>
        {entries.map(([record, mapping]) => (
          <li
            key={record.specific_snomed_concept_id}
            class={cls(
              'flex flex-col gap-2 rounded-md border px-4 py-3',
              mapping.status === 'mapped' ? 'border-gray-200 bg-white' : 'border-amber-200 bg-amber-50/40',
            )}
          >
            <div class='flex flex-col gap-1'>
              <span class='text-sm font-semibold text-gray-900'>SNOMED {record.specific_snomed_concept_id}</span>
              <MappingStatusBadge mapping={mapping} />
            </div>
            {mapping.codes.length > 0
              ? (
                <ul class='flex flex-col gap-1 list-disc list-inside'>
                  {mapping.codes.map((code) => <CodeDetail key={`${code.map_group}-${code.icd10_code}`} code={code} />)}
                </ul>
              )
              : null}
          </li>
        ))}
      </ul>
    </section>
  )
}
