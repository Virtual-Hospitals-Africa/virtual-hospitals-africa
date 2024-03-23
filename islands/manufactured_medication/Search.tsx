import { ManufacturedMedicationSearchResult } from '../../types.ts'
import AsyncSearch, { AsyncSearchProps } from '../AsyncSearch.tsx'
import cls from '../../util/cls.ts'

function ManufacturedMedicationOption({
  option,
  selected,
}: {
  option: ManufacturedMedicationSearchResult
  selected: boolean
}) {
  return (
    <div className='flex items-center'>
      <span
        className={cls(
          'ml-3 truncate',
          selected && 'font-bold',
        )}
      >
        <b>{option.trade_name}</b>
        <p>{option.applicant_name}</p>
        <div>{option.form} ({option.strength_summary})</div>
        {option.generic_name !== option.name && (
          <div className='text-s italic'>
            {option.generic_name}
          </div>
        )}
      </span>
    </div>
  )
}

export default function ManufacturedMedicationSearch(
  props: Omit<
    AsyncSearchProps<ManufacturedMedicationSearchResult>,
    'Option' | 'href'
  >,
) {
  return (
    <AsyncSearch
      href='/app/manufactured_medications'
      Option={ManufacturedMedicationOption}
      {...props}
    />
  )
}

export function AddMedicineSearch({ facility_id }: { facility_id: number }) {
  return (
    <ManufacturedMedicationSearch
      optionHref={(option) =>
        `/app/facilities/${facility_id}/inventory/add_medicine?manufactured_medication_id=${option.id}`}
    />
  )
}
