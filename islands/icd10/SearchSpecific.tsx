import { computed, useSignal } from '@preact/signals'
import AsyncSearch from '../AsyncSearch.tsx'
import cls from '../../util/cls.ts'
import { RenderedICD10DiagnosisTreeWithOptionalIncludes } from '../../types.ts'
import { SelectWithOptions } from '../form/Inputs.tsx'

type SubDiag0 = NonNullable<
  RenderedICD10DiagnosisTreeWithOptionalIncludes['sub_diagnoses']
>[0]
type SubDiag1 = NonNullable<SubDiag0['sub_diagnoses']>[0]
type SubDiag2 = NonNullable<SubDiag1['sub_diagnoses']>[0]
type SubDiag3 = NonNullable<SubDiag2['sub_diagnoses']>[0]

function options(sub_diagnoses: {
  code: string
  general: boolean
  name: string
}[]) {
  const opts = sub_diagnoses.map((s) => ({
    value: s.code,
    label: s.name,
  }))
  const general_option = sub_diagnoses.some((sd) => sd.general)
  if (!general_option) {
    opts.unshift({ value: '', label: 'Select' })
  }
  return opts
}

export function ICD10SearchSpecific({
  name,
  label,
  href,
  value,
  className,
}: {
  name: string
  label: string
  href: string
  value?: RenderedICD10DiagnosisTreeWithOptionalIncludes
  className?: string
}) {
  const search = useSignal(value?.description || '')
  const selected_parent = useSignal(value)
  const selected_c0 = useSignal<SubDiag0 | undefined>(undefined)
  const selected_c1 = useSignal<SubDiag1 | undefined>(undefined)
  const selected_c2 = useSignal<SubDiag2 | undefined>(undefined)
  const selected_c3 = useSignal<SubDiag3 | undefined>(undefined)

  const search_terms = computed(() => search.value.split(/\s+/))

  function HighlightedWords(
    { text, selected }: { text: string; selected: boolean },
  ) {
    return (
      <>
        {text.split(/\s+/).map((word, i) => {
          const highlighted = Array.prototype.some.call(
            search_terms.value,
            (search_term) => search_term.toLowerCase() === word.toLowerCase(),
          )
          return (
            <>
              {i > 0 && ' '}
              <span
                key={i}
                className={highlighted
                  ? cls(
                    'p-1 text-white',
                    selected ? 'bg-white' : 'bg-indigo-700',
                  )
                  : 'py-1'}
              >
                {word}
              </span>
            </>
          )
        })}
      </>
    )
  }

  function SymptomOption({
    option,
    selected,
  }: {
    option: RenderedICD10DiagnosisTreeWithOptionalIncludes
    selected: boolean
  }) {
    return (
      <div className='flex flex-col'>
        <div className={cls('truncate text-base', selected && 'font-bold')}>
          <HighlightedWords text={option.name} selected={selected} />
        </div>
        {!!option.includes?.length &&
          (
            <div className={cls('truncate text-xs', selected && 'font-bold')}>
              Includes:&nbsp;
              {option.includes.map((include, i) => (
                <>
                  {i > 0 && ', '}
                  <HighlightedWords
                    key={include.note}
                    selected={selected}
                    text={include.note}
                  />
                </>
              ))}
            </div>
          )}
      </div>
    )
  }

  return (
    <>
      <AsyncSearch
        name={selected_c0.value ? undefined : name}
        no_name_form_data
        required
        search_route={href}
        label={label}
        value={value}
        className={className}
        Option={SymptomOption}
        onQuery={(query) => search.value = query}
        onSelect={(symptom) => {
          const general_subdiagnosis = symptom?.sub_diagnoses?.find((sd) =>
            sd.general
          )
          selected_parent.value = symptom
          selected_c0.value = general_subdiagnosis
          selected_c1.value = undefined
          selected_c2.value = undefined
          selected_c3.value = undefined
        }}
      />
      {!!selected_parent.value?.sub_diagnoses?.length && (
        <SelectWithOptions
          name={selected_c1.value ? null : name}
          label='More specific'
          options={options(selected_parent.value.sub_diagnoses)}
          value={selected_c0.value?.code}
          onChange={(e) => {
            const symptom = selected_parent.value!.sub_diagnoses!.find(
              (s) => s.code === e.currentTarget.value,
            )
            const general_subdiagnosis = symptom?.sub_diagnoses?.find((sd) =>
              sd.general
            )
            selected_c0.value = symptom
            selected_c1.value = general_subdiagnosis
            selected_c2.value = undefined
            selected_c3.value = undefined
          }}
        />
      )}
      {!!selected_c0.value?.sub_diagnoses?.length && (
        <SelectWithOptions
          name={selected_c2.value ? null : name}
          label='Even more specific'
          options={options(selected_c0.value.sub_diagnoses)}
          value={selected_c1.value?.code}
          onChange={(e) => {
            const symptom = selected_c0.value!.sub_diagnoses!.find(
              (s) => s.code === e.currentTarget.value,
            )
            const general_subdiagnosis = symptom?.sub_diagnoses?.find((sd) =>
              sd.general
            )
            selected_c1.value = symptom
            selected_c2.value = general_subdiagnosis
            selected_c3.value = undefined
          }}
        />
      )}
      {!!selected_c1.value?.sub_diagnoses?.length && (
        <SelectWithOptions
          name={selected_c3.value ? null : name}
          label='Even even more specific'
          options={options(selected_c1.value.sub_diagnoses)}
          value={selected_c2.value?.code}
          onChange={(e) => {
            const symptom = selected_c1.value!.sub_diagnoses!.find(
              (s) => s.code === e.currentTarget.value,
            )
            const general_subdiagnosis = symptom?.sub_diagnoses?.find((sd) =>
              sd.general
            )
            selected_c2.value = symptom
            selected_c3.value = general_subdiagnosis
          }}
        />
      )}
      {!!selected_c2.value?.sub_diagnoses?.length && (
        <SelectWithOptions
          name={name}
          label='Even even even more specific'
          options={options(selected_c2.value.sub_diagnoses)}
          value={selected_c3.value?.code}
          onChange={(e) => {
            const symptom = selected_c2.value!.sub_diagnoses!.find(
              (s) => s.code === e.currentTarget.value,
            )
            selected_c3.value = symptom
          }}
        />
      )}
    </>
  )
}
