import Avatar from '../../components/library/Avatar.tsx'
import { SelectedPatient } from '../../types.ts'

export function SendToSelectedPatient(
  { patient }: { patient: SelectedPatient },
) {
  return (
    <div className='px-3 py-2'>
      <div className='flex items-center'>
        <Avatar src={patient.avatar_url} className='mr-4' />
        <div>
          <h2 className='text-sm font-sans font-medium text-gray-900 leading-normal'>
            {patient.name}
          </h2>
          {patient.description && (
            <p className='text-sm font-sans text-gray-500 leading-normal'>
              {patient.description}
            </p>
          )}
          <p className='truncate text-xs font-ubuntu text-gray-500 whitespace-pre-line'>
            <a href={patient.actions.clinical_notes} className='text-blue-500'>
              📎 Clinical Notes
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
