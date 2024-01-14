import { computed, useSignal } from '@preact/signals'
import Search from '../Search.tsx'
import cls from '../../util/cls.ts'
import { SymptomOption } from './Section.tsx'

function SymptomsResult({
  option,
  selected,
}: {
  option: SymptomOption
  selected: boolean
}) {
  return (
    <div className='flex flex-col'>
      <div className={cls('truncate text-base', selected && 'font-bold')}>
        {option.name}
      </div>
    </div>
  )
}

export default function SymptomsSearch({
  options,
  add,
}: {
  options: SymptomOption[]
  add(symptom: SymptomOption): void
}) {
  const query = useSignal('')
  const filtered_options = computed(() => {
    const query_value = query.value
    return query_value.length > 0
      ? options.filter((symptom) =>
        symptom.name.toLowerCase().includes(query_value.toLowerCase())
      )
      : []
  })

  return (
    <Search
      multi
      options={filtered_options.value}
      onQuery={(new_query) => query.value = new_query}
      onSelect={(symptom) => {
        if (symptom) {
          add(symptom)
          query.value = ''
        }
      }}
      Option={SymptomsResult}
    />
  )
}
