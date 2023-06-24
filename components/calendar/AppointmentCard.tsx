import { FunctionComponent, h } from 'preact'
import { HealthWorkerAppointment } from '../../types.ts'
import {
  ConfirmedButton,
  DeniedButton,
  NullButton,
  PendingButtons,
} from './Buttons.tsx'

const AppointmentCard: FunctionComponent<HealthWorkerAppointment> = ({
  stripeColor,
  start,
  patientName,
  patientAge,
  facilityName,
  durationMinutes,
  status,
}) => {
  return (
    <div className='mb-4'>
      <div className='relative flex border border-gray-300 rounded shadow-lg overflow-hidden'>
        <div className={`w-6 h-full ${stripeColor} absolute`}></div>
        <div className='pl-10 p-3 space-y-2'>
          <div className='font-semibold text-2xl text-green-600'>
            {start.hour}:{start.minute}
          </div>
          <div className='font-semibold text-xl'>{patientName}</div>
          <div className='text-xl text-gray-500'>Age: {patientAge}</div>
          <div className='text-xl pb-8 text-gray-500'>{facilityName}</div>
        </div>
        <div className='px-1 absolute text-green-700 font-bold text-xl bg-blue-50 top-2 right-2'>
          {durationMinutes} mins
        </div>
        {status === null && <NullButton />}
        {status === 'pending' && <PendingButtons />}
        {status === 'denied' && <DeniedButton />}
        {status === 'confirmed' && <ConfirmedButton />}
      </div>
    </div>
  )
}

export default AppointmentCard
