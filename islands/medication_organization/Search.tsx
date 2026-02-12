import { RenderedOrganizationMedication } from '../../types.ts'
import AsyncSearch, { AsyncSearchPropsSingular } from '../AsyncSearch.tsx'
import cls from '../../util/cls.ts'

function MedicationOrganizationOption({
  option,
  selected,
}: {
  option: RenderedOrganizationMedication
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
        <b>{option.name}</b>
        <p>{option.applicant_name}</p>
        {/* TODO ingredients/strengths */}
        {/* <div>{option.form} ({option.strength_summary})</div> */}
      </span>
    </div>
  )
}

export function MedicationOrganizationSearch(
  props:
    & Omit<
      AsyncSearchPropsSingular<RenderedOrganizationMedication>,
      'Option' | 'search_route'
    >
    & {
      organization_id: string
    },
) {
  return (
    <AsyncSearch
      search_route={`/app/organizations/${props.organization_id}/medications`}
      Option={MedicationOrganizationOption}
      {...props}
    />
  )
}

// export function AddMedicineSearch(
//   { organization_id }: { organization_id: string },
// ) {
//   return (
//     <MedicationInventorySearch
//       optionHref={(option) => `/app/organizations/${organization_id}/inventory/add_medicine?medication_id=${option.id}`}
//     />
//   )
// }
