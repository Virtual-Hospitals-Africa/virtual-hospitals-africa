import AsyncSearch, { AsyncSearchPropsSingular } from './AsyncSearch.tsx'
import { PharmacistInPharmacy } from '../types.ts'
import cls from '../util/cls.ts'

// export type PharmacyOption = Omit<PharmacistInPharmacy, 'actions' | 'admins'>
export type PharmacyOption =
  & Pick<PharmacistInPharmacy, 'id' | 'name' | 'is_admin'>
  & { removed?: boolean }

function PharmacyOption({
  option,
  selected,
}: {
  option: PharmacyOption
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

export default function AddPharmacySearch(
  props:
    & Omit<AsyncSearchPropsSingular<PharmacyOption>, 'Option' | 'search_route'>
    & {
      country: string
    },
) {
  return (
    <AsyncSearch
      {...props}
      ignore_option_href
      search_route={`/regulator/${props.country}/pharmacies`}
      Option={PharmacyOption}
    />
  )
}
