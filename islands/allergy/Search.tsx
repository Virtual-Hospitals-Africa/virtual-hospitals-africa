import { Allergy } from '../../types.ts'
import Search from '../Search.tsx'
import cls from '../../util/cls.ts'
import { computed, useSignal } from '@preact/signals'

function AllergyResult({
  option,
  selected,
}: {
  option: Allergy
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

export default function AllergySearch({
  options,
  add,
}: {
  options: Allergy[]
  add(allergy: Allergy): void
}) {
  const query = useSignal('')
  const filtered_options = computed(() => {
    const query_value = query.value
    return query_value.length > 0
      ? options.filter((allergy) =>
        allergy.name.toLowerCase().includes(query_value.toLowerCase())
      )
      : []
  })

  return (
    <Search
      multi
      options={filtered_options.value}
      onQuery={(new_query) => query.value = new_query}
      onSelect={(allergy) => {
        if (allergy) {
          add(allergy)
          query.value = ''
        }
      }}
      Option={AllergyResult}
    />
  )
}
