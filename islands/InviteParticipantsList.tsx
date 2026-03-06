import { Signal, useSignal } from '@preact/signals'
import { RenderedEmployeeWithPresence } from '../types.ts'
import { ProviderSelectOption } from './ProvidersSelect.tsx'

export function InviteParticipantsFormFields({
  facility_employees,
  hospital_employees,
  selected,
}: {
  facility_employees: RenderedEmployeeWithPresence[]
  hospital_employees: RenderedEmployeeWithPresence[]
  selected: Signal<Set<RenderedEmployeeWithPresence>>
}) {
  const all_employees = [...facility_employees, ...hospital_employees]

  return (
    <div className='space-y-6'>
      {facility_employees.length > 0 && (
        <div>
          <h2 className='text-lg font-semibold text-gray-900 mb-3'>
            Your Facility
          </h2>
          <fieldset className='grid grid-cols-1 gap-2'>
            {facility_employees.map((employee) => (
              <ProviderSelectOption
                key={employee.employee_id}
                provider={employee}
                selected={selected.value.has(employee)}
                toggleSelection={() => {
                  const new_selected = new Set(selected.value)
                  if (selected.value.has(employee)) {
                    new_selected.delete(employee)
                  } else {
                    new_selected.add(employee)
                  }
                  selected.value = new_selected
                }}
              />
            ))}
          </fieldset>
        </div>
      )}

      {hospital_employees.length > 0 && (
        <div>
          <h2 className='text-lg font-semibold text-gray-900 mb-3'>
            Nearest Hospital
          </h2>
          <fieldset className='grid grid-cols-1 gap-2'>
            {hospital_employees.map((employee) => (
              <ProviderSelectOption
                key={employee.employee_id}
                provider={employee}
                selected={selected.value.has(employee)}
                toggleSelection={() => {
                  const new_selected = new Set(selected.value)
                  if (selected.value.has(employee)) {
                    new_selected.delete(employee)
                  } else {
                    new_selected.add(employee)
                  }
                  selected.value = new_selected
                }}
              />
            ))}
          </fieldset>
        </div>
      )}

      {all_employees.length === 0 && (
        <p className='text-gray-500 text-center py-8'>
          No health workers available at this time.
        </p>
      )}
    </div>
  )
}

export default function InviteParticipantsList(props: {
  facility_employees: RenderedEmployeeWithPresence[]
  hospital_employees: RenderedEmployeeWithPresence[]
}) {
  const selected = useSignal<Set<RenderedEmployeeWithPresence>>(new Set())

  return (
    <div className='max-w-4xl mx-auto px-4 py-8'>
      <h1 className='text-2xl font-bold text-gray-900 mb-6'>
        Invite Participants to Consultation
      </h1>

      <InviteParticipantsFormFields {...props} selected={selected} />
      {selected.value.size > 0 && (
        <input
          type='hidden'
          name='participant_emails'
          value={JSON.stringify([...selected.value].map((p) => p.email))}
        />
      )}
    </div>
  )
}
