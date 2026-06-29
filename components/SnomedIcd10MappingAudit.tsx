import {
  conceptMappingClinicianMessage,
  correlationLabel,
  mapCategoryLabel,
  RECOMMENDED_DOSE_CALCULATOR_DISCLAIMER,
  SnomedIcd10ConceptMapping,
  SnomedIcd10MappingResult,
} from '../shared/snomed_to_icd10.ts'
import cls from '../util/cls.ts'

function MappingStatusBadge({ mapping }: { mapping: SnomedIcd10ConceptMapping }) {
  if (mapping.status === 'mapped') return null
  const message = conceptMappingClinicianMessage(mapping)
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
  const correlation_label = correlationLabel(code.correlation_id)
  const flags = [
    code.is_primary ? 'Primary (used for dose lookup)' : 'Supplementary (audit only)',
    category_label,
    correlation_label,
    code.resolved_via === 'context' ? 'Resolved from patient sex' : null,
  ].filter(Boolean)

  return (
    <li class='text-sm text-gray-900'>
      <span class='font-medium'>{code.icd10_code}</span>
      {flags.length > 0 && (
        <span class='text-gray-500'>
          {' '}
          —
          {' '}
          {flags.join(' · ')}
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
  snomed_concept_ids,
  mappings,
}: {
  snomed_concept_ids: string[]
  mappings: SnomedIcd10MappingResult
}) {
  if (!snomed_concept_ids.length) return null

  return (
    <section class='flex flex-col gap-3'>
      <div class='flex flex-col gap-1'>
        <h2 class='text-lg font-semibold text-gray-900'>SNOMED → ICD-10 mapping audit</h2>
        <p class='text-sm text-gray-600'>
          Candidate ICD-10 codes suggested from SNOMED. Primary codes (map group 1) drive dose lookup;
          supplementary codes are shown for traceability only.
        </p>
      </div>
      <ul class='flex flex-col gap-4'>
        {snomed_concept_ids.map((snomed_concept_id) => {
          const mapping = mappings.by_concept.get(snomed_concept_id)
          if (!mapping) return null
          return (
            <li
              key={snomed_concept_id}
              class={cls(
                'flex flex-col gap-2 rounded-md border px-4 py-3',
                mapping.status === 'mapped' ? 'border-gray-200 bg-white' : 'border-amber-200 bg-amber-50/40',
              )}
            >
              <div class='flex flex-col gap-1'>
                <span class='text-sm font-semibold text-gray-900'>SNOMED {snomed_concept_id}</span>
                <MappingStatusBadge mapping={mapping} />
              </div>
              {mapping.codes.length > 0
                ? (
                  <ul class='flex flex-col gap-1 list-disc list-inside'>
                    {mapping.codes.map((code) => (
                      <CodeDetail key={`${code.map_group}-${code.icd10_code}`} code={code} />
                    ))}
                  </ul>
                )
                : null}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
