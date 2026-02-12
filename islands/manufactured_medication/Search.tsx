import { RenderedMedication } from '../../types.ts'
import AsyncSearch, { AsyncSearchPropsSingular } from '../AsyncSearch.tsx'
import cls from '../../util/cls.ts'

function MedicationOption({
  option,
  selected,
}: {
  option: RenderedMedication
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

export default function MedicationSearch(
  props: Omit<
    AsyncSearchPropsSingular<RenderedMedication>,
    'Option' | 'search_route'
  >,
) {
  return (
    <AsyncSearch
      search_route='/app/medications'
      Option={MedicationOption}
      {...props}
    />
  )
}

export function AddMedicineSearch(
  { organization_id }: { organization_id: string },
) {
  return (
    <MedicationSearch
      optionHref={(option) => `/app/organizations/${organization_id}/inventory/add_medicine?medication_id=${option.id}`}
    />
  )
}
