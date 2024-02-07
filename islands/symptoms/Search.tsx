import { computed } from '@preact/signals'
import Search from '../Search.tsx'
import cls from '../../util/cls.ts'
import { SymptomOption } from './Section.tsx'
import { useSignal } from '@preact/signals'

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
        {option.name} <em>({option.category})</em>
      </div>
    </div>
  )
}

const matchLower = (a: string, b: string) => a.toLowerCase().includes(b)

export default function SymptomsSearch({
  options,
  add,
}: {
  options: SymptomOption[]
  add(symptom: SymptomOption): void
}) {
  const query = useSignal('')
  const filtered_options = computed(() => {
    const query_value = query.value.toLowerCase()
    if (!query_value) return []
    const matches: SymptomOption[] = []
    for (const option of options) {
      if (
        matchLower(option.name, query_value) ||
        option.aliases.some((alias) => matchLower(alias, query_value))
      ) {
        matches.unshift(option)
      } else if (matchLower(option.category, query_value)) {
        matches.push(option)
      }
    }
    return matches.slice(0, 10)
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
