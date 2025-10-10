import { ActionButton } from '../../components/library/ActionButton.tsx'
import { RenderedPatient, RenderedWaitingRoom } from '../../types.ts'
import cls from '../../util/cls.ts'
import AsyncSearch from '../AsyncSearch.tsx'

export function AddPatientSearch({
  // organization_id,
  waiting_room,
}: {
  organization_id: string
  waiting_room: RenderedWaitingRoom[]
}) {
  function PatientOption({
    option,
    selected,
  }: {
    option: RenderedPatient
    selected: boolean
  }) {
    const patient_in_organization = waiting_room.find((encounter) =>
      encounter.patient.id === option.id
    )
    const { text, ...action } = patient_in_organization
      ? patient_in_organization.actions[0]
      : {
        text: 'blah',
        href: 'foo',
        method: 'POST' as const,
      }

    return (
      <ActionButton action={action}>
        <div className='truncate'>
          <span
            className={cls(
              selected && 'font-bold',
            )}
          >
            <b>{option.name}</b>
          </span>
          <div className={cls('text-xs', selected && 'font-bold')}>
            {option.description}
          </div>
          <span
            className={cls(
              'absolute inset-y-0 right-0 flex items-center pr-4',
              'text-indigo-600',
            )}
          >
            {text}
          </span>
        </div>
      </ActionButton>
    )
  }

  return (
    <AsyncSearch
      name='patient'
      search_route='/app/patients'
      label=''
      Option={PatientOption}
      // addable={{
      //   href:
      //     `/app/organizations/${organization_id}/patients/new/registration?patient_name=`,
      // }}
    />
  )
}
