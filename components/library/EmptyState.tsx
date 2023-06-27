import cls from '../../util/cls.ts'
import { PlusIcon } from '../heroicons.tsx'
import MakeAppointmentIcon from '../icons/make-appointment.tsx'

export default function EmptyState({ className }: { className?: string }) {
  return (
    <div className={cls('text-center', className)}>
      <MakeAppointmentIcon className='mx-auto h-12 w-12 text-gray-400' />

      <h3 className='mt-2 text-sm font-semibold text-gray-900'>
        No appointments
      </h3>
      <p className='mt-1 text-sm text-gray-500'>
        Create an appointment with a new or existing patient
      </p>
      <div className='mt-6'>
        <button
          type='button'
          className='inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
        >
          <PlusIcon
            className='-ml-0.5 mr-1.5 h-5 w-5 white'
            aria-hidden='true'
          />
          New Appointment
        </button>
      </div>
    </div>
  )
}
