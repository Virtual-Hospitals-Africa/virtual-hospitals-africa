import AsyncSearch, { AsyncSearchProps } from './AsyncSearch.tsx'
import { PharmacistInPharmacy } from '../types.ts'
import cls from '../util/cls.ts'

// export type PharmacyOption = Omit<PharmacistInPharmacy, 'actions' | 'supervisors'>
export type PharmacyOption =
  & Pick<PharmacistInPharmacy, 'id' | 'name' | 'is_supervisor'>
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
  props: Omit<AsyncSearchProps<PharmacyOption>, 'Option' | 'href'>,
) {
  return (
    <AsyncSearch
      {...props}
      href='/regulator/pharmacies/pharmacies'
      Option={PharmacyOption}
    />
  )
}
