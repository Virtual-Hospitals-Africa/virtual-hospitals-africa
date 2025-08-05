import Avatar from '../../components/library/Avatar.tsx'
import { RenderedPatient } from '../../types.ts'

export type PatientDrawerCardStatus =
  | 'Emergency'
  | 'Very Urgent'
  | 'Urgent'
  | 'Routine'
  | 'Facility Transfer'
  | 'Deceased'

interface PatientDrawerCardProps {
  patient: RenderedPatient
  status: PatientDrawerCardStatus
}

const statusClasses: Record<PatientDrawerCardStatus, {
  bg: string
  text: string
}> = {
  'Emergency': { bg: 'bg-red-100', text: 'text-red-800' },
  'Very Urgent': { bg: 'bg-orange-100', text: 'text-orange-700' },
  'Urgent': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  'Routine': { bg: 'bg-green-100', text: 'text-green-800' },
  'Facility Transfer': { bg: 'bg-purple-100', text: 'text-purple-800' },
  'Deceased': { bg: 'bg-blue-100', text: 'text-blue-800' },
}

function getInitials(name: string) {
  const names = name.split(' ')
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

export function PatientDrawerCard(
  { patient, status }: PatientDrawerCardProps,
) {
  const statusClass = statusClasses[status]
  const initials = getInitials(patient.name)

  return (
    <div
      className={`rounded-lg p-4 ${statusClass.bg}`}
    >
      <div className='flex items-center gap-3'>
        <Avatar
          src={patient.avatar_url}
          initials={initials}
          className='h-14 w-14'
        />
        <div className='flex-1'>
          <div className='flex items-center justify-between'>
            <p className='text-lg font-semibold text-gray-800'>
              {patient.name}
            </p>
            {
              /* <a href={`/app/patients/${patient.id}`} className="text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a> */
            }
          </div>
          <div className='text-sm text-gray-600'>
            <span>{patient.gender}</span>
            {patient.age_display && <span>&bull; {patient.age_display}</span>}
          </div>
        </div>
      </div>
      <hr className='my-3 border-t border-gray-200' />
      <div className='flex items-center justify-between'>
        <span className={`font-semibold ${statusClass.text}`}>
          {status}
        </span>
        <button className='text-sm text-gray-600 hover:text-gray-800'>
          Change
        </button>
      </div>
    </div>
  )
}
