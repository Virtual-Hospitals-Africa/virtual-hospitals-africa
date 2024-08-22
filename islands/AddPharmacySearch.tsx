import AsyncSearch, { AsyncSearchProps } from './AsyncSearch.tsx'
import { RenderedPharmacy } from '../types.ts'
import cls from '../util/cls.ts'

function PharmacyOption({
  option,
  selected,
}: {
  option: RenderedPharmacy
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
  props: Omit<AsyncSearchProps<RenderedPharmacy>, 'Option' | 'href'>,
) {
  return (
    <AsyncSearch
      {...props}
      href='/regulator/pharmacies/pharmacies'
      Option={PharmacyOption}
    />
  )
}
