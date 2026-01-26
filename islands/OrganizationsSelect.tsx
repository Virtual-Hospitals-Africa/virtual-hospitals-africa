// import { useSignal } from '@preact/signals'
// import cls from '../util/cls.ts'
// import { OrganizationCard } from './request-review/OrganizationCard.tsx'
// import { HiddenInput } from '../components/library/HiddenInput.tsx'
import { OrganizationLike } from '../types.ts'
import { RadioButtonGroup } from '../components/library/RadioButtonGroup.tsx'

// function OrganizationSelectOption(
//   { organization, selected, toggleSelection }: {
//     organization: OrganizationLike
//     selected: boolean
//     toggleSelection(): void
//   },
// ) {
//   const active = useSignal(false)

//   return (
//     <label
//       className={cls(
//         'relative block cursor-pointer rounded-lg border bg-white px-6 py-4 shadow-sm focus:outline-none sm:flex sm:justify-between',
//         active.value ? 'border-indigo-600 ring-2 ring-indigo-600' : 'border-gray-300',
//       )}
//       onMouseOver={() => active.value = true}
//       onMouseLeave={() => active.value = false}
//     >
//       <input
//         type='checkbox'
//         className='sr-only'
//         aria-labelledby={`organization-${organization.id}-label`}
//         aria-describedby={`organization-${organization.id}-description-0 ${organization.id}-description-1`}
//         onInput={toggleSelection}
//       />
//       <span className='flex items-center gap-3'>
//         <OrganizationCard organization={organization} />
//       </span>
//       <span
//         className={cls(
//           'pointer-events-none absolute -inset-px rounded-lg border-2',
//           active.value ? 'border' : 'border-2',
//           selected ? 'border-indigo-600' : 'border-transparent',
//         )}
//         aria-hidden='true'
//       />
//     </label>
//   )
// }

export default function OrganizationsSelect(
  { organizations }: {
    organizations: OrganizationLike[]
  },
) {
  // const selected = useSignal<OrganizationLike>(organizations[0])

  return (
    <RadioButtonGroup
      name='organization_id'
      variant='panel-with-border'
      options={organizations.map((organization) => ({
        ...organization,
        description: organization.formatted_address,
      }))}
    />
  )
}
