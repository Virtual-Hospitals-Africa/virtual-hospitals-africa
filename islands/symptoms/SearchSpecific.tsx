import AsyncSearch from '../AsyncSearch.tsx'
import cls from '../../util/cls.ts'
import { RenderedICD10Diagnosis } from '../../types.ts'
import { useSignal } from '@preact/signals'
import { SelectWithOptions } from '../../components/library/form/Inputs.tsx'

function SymptomOption({
  option,
  selected,
}: {
  option: RenderedICD10Diagnosis
  selected: boolean
}) {
  return (
    <div className='flex flex-col'>
      <div className={cls('truncate text-base', selected && 'font-bold')}>
        {option.name}
      </div>
      {option.includes &&
        (
          <div className={cls('truncate text-xs', selected && 'font-bold')}>
            {option.includes}
          </div>
        )}
    </div>
  )
}

type SubDiag0 = NonNullable<RenderedICD10Diagnosis['sub_diagnoses']>[0]
type SubDiag1 = NonNullable<SubDiag0['sub_diagnoses']>[0]
type SubDiag2 = NonNullable<SubDiag1['sub_diagnoses']>[0]
type SubDiag3 = NonNullable<SubDiag2['sub_diagnoses']>[0]

export function SearchSpecificSymptom({
  name,
  value,
}: {
  name: string
  value?: RenderedICD10Diagnosis
}) {
  const selected_parent = useSignal(value)
  const selected_c0 = useSignal<SubDiag0 | undefined>(undefined)
  const selected_c1 = useSignal<SubDiag1 | undefined>(undefined)
  const selected_c2 = useSignal<SubDiag2 | undefined>(undefined)
  const selected_c3 = useSignal<SubDiag3 | undefined>(undefined)

  return (
    <>
      <AsyncSearch
        name={selected_c0.value ? undefined : name}
        required
        href='/app/symptoms'
        label='Symptom'
        value={value}
        Option={SymptomOption}
        onSelect={(symptom) => {
          selected_parent.value = symptom
          selected_c0.value = undefined
          selected_c1.value = undefined
          selected_c2.value = undefined
          selected_c3.value = undefined
        }}
      />
      {!!selected_parent.value?.sub_diagnoses?.length && (
        <SelectWithOptions
          name={selected_c1.value ? null : name}
          label='More specific'
          options={selected_parent.value.sub_diagnoses.map((s) => ({
            value: s.code,
            label: s.description,
          }))}
          value={selected_c0.value?.code}
          onChange={(e) => {
            selected_c0.value = selected_parent.value!.sub_diagnoses!.find(
              (s) => s.code === e.target.value,
            )
            selected_c1.value = undefined
            selected_c2.value = undefined
            selected_c3.value = undefined
          }}
        />
      )}
      {!!selected_c0.value?.sub_diagnoses?.length && (
        <SelectWithOptions
          name={selected_c2.value ? null : name}
          label='Even more specific'
          options={selected_c0.value.sub_diagnoses.map((s) => ({
            value: s.code,
            label: s.description,
          }))}
          value={selected_c1.value?.code}
          onChange={(e) => {
            selected_c1.value = selected_c0.value!.sub_diagnoses!.find(
              (s) => s.code === e.target.value,
            )
            selected_c2.value = undefined
            selected_c3.value = undefined
          }}
        />
      )}
      {!!selected_c1.value?.sub_diagnoses?.length && (
        <SelectWithOptions
          name={selected_c3.value ? null : name}
          label='Even even more specific'
          options={selected_c1.value.sub_diagnoses.map((s) => ({
            value: s.code,
            label: s.description,
          }))}
          value={selected_c2.value?.code}
          onChange={(e) => {
            selected_c2.value = selected_c1.value!.sub_diagnoses!.find(
              (s) => s.code === e.target.value,
            )
            selected_c3.value = undefined
          }}
        />
      )}
      {!!selected_c2.value?.sub_diagnoses?.length && (
        <SelectWithOptions
          name={name}
          label='Even even even more specific'
          options={selected_c2.value.sub_diagnoses.map((s) => ({
            value: s.code,
            label: s.description,
          }))}
          value={selected_c3.value?.code}
          onChange={(e) => {
            selected_c3.value = selected_c2.value!.sub_diagnoses!.find(
              (s) => s.code === e.target.value,
            )
          }}
        />
      )}
    </>
  )
}
