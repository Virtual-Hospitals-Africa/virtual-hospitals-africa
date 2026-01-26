import { useSignal } from '@preact/signals'
import { RenderedEmployee } from '../types.ts'
import cls from '../util/cls.ts'
import Avatar from '../components/library/Avatar.tsx'
import words from '../util/words.ts'
import { ActionButton } from '../components/library/ActionButton.tsx'

type EmployeeWithPresence = RenderedEmployee & {
  at_work: boolean
}

function ParticipantOption({
  employee,
  selected,
  toggleSelection,
}: {
  employee: EmployeeWithPresence
  selected: boolean
  toggleSelection: () => void
}) {
  const active = useSignal(false)

  return (
    <label
      className={cls(
        'relative block cursor-pointer rounded-lg border bg-white px-6 py-4 shadow-sm focus:outline-none sm:flex sm:justify-between',
        active.value ? 'border-indigo-600 ring-2 ring-indigo-600' : 'border-gray-300',
      )}
      onMouseOver={() => active.value = true}
      onMouseLeave={() => active.value = false}
    >
      <input
        type='checkbox'
        className='sr-only'
        aria-labelledby={`participant-${employee.employee_id}-label`}
        onInput={toggleSelection}
        checked={selected}
      />
      <span className='flex items-center gap-3'>
        <div className='relative'>
          <Avatar
            src={employee.avatar_url}
            className='h-14 w-14'
          />
          {employee.at_work && <span className='absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full bg-green-400 ring-2 ring-white' />}
        </div>
        <span className='flex flex-col'>
          <span
            id={`participant-${employee.employee_id}-label`}
            className='font-medium text-gray-900 text-md flex items-center gap-2'
          >
            {employee.name}
            {employee.at_work && <span className='text-xs text-green-600 font-normal'>Online</span>}
          </span>
          {employee.profession && (
            <span className='text-gray-500 text-sm'>
              <span className='block sm:inline capitalize'>
                {employee.profession}
              </span>
              {employee.specialty && (
                <>
                  <span className='hidden sm:mx-1 sm:inline' aria-hidden='true'>
                    ·
                  </span>
                  <span className='block sm:inline capitalize'>
                    {words(employee.specialty).join(' ')}
                  </span>
                </>
              )}
            </span>
          )}
          <span className='text-gray-400 text-xs'>{employee.email}</span>
        </span>
      </span>
      <span
        className={cls(
          'pointer-events-none absolute -inset-px rounded-lg border-2',
          active.value ? 'border' : 'border-2',
          selected ? 'border-indigo-600' : 'border-transparent',
        )}
        aria-hidden='true'
      />
    </label>
  )
}

export default function InviteParticipantsList({
  facility_employees,
  hospital_employees,
  hangout_link,
}: {
  facility_employees: EmployeeWithPresence[]
  hospital_employees: EmployeeWithPresence[]
  hangout_link: string
}) {
  const selected = useSignal<Set<EmployeeWithPresence>>(new Set())

  const all_employees = [...facility_employees, ...hospital_employees]

  return (
    <div className='max-w-4xl mx-auto px-4 py-8'>
      <h1 className='text-2xl font-bold text-gray-900 mb-6'>
        Invite Participants to Consultation
      </h1>

        <div className='space-y-6'>
          {facility_employees.length > 0 && (
            <div>
              <h2 className='text-lg font-semibold text-gray-900 mb-3'>
                Your Facility
              </h2>
              <fieldset className='grid grid-cols-1 gap-2'>
                {facility_employees.map((employee) => (
                  <ParticipantOption
                    key={employee.employee_id}
                    employee={employee}
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
                  <ParticipantOption
                    key={employee.employee_id}
                    employee={employee}
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

          {selected.value.size > 0 && (
            <input
              type='hidden'
              name='participant_emails'
              value={JSON.stringify([...selected.value].map((p) => p.email))}
            />
          )}
        </div>
    </div>
  )
}
