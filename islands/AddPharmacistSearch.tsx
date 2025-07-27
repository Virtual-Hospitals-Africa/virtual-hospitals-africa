import AsyncSearch, { AsyncSearchProps } from './AsyncSearch.tsx'
import { PharmacistInPharmacy } from '../types.ts'
import cls from '../util/cls.ts'

export type PharmacistOption =
  & Pick<PharmacistInPharmacy, 'id' | 'name'>
  & { removed?: boolean }

function PharmacistOption({
  option,
  selected,
}: {
  option: PharmacistOption
  selected: boolean
}) {
  return (
    <div className='truncate'>
      <span
        className={cls(
          selected && 'font-bold',
        )}
      >
        <b>{option.name}</b>
      </span>
    </div>
  )
}

export default function AddPharmacistSearch(
  props: Omit<AsyncSearchProps<PharmacistOption>, 'Option' | 'search_route'> & {
    country: string
  },
) {
  return (
    <AsyncSearch
      {...props}
      ignore_option_href
      search_route={`/regulator/${props.country}/pharmacists`}
      Option={PharmacistOption}
    />
  )
}
