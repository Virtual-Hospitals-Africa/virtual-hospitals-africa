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
    option: { id: string; name: string }
    selected: boolean
  }) {
    const patient = option as unknown as RenderedPatient
    const patient_at_facility = waiting_room.find((encounter) => encounter.patient.id === option.id)
    const { text, ...action } = patient_at_facility ? patient_at_facility.actions[0] : {
      text: 'TODO',
      href: 'TODO',
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
            {patient.description}
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
      placeholder='Search existing patients'
    />
  )
}
