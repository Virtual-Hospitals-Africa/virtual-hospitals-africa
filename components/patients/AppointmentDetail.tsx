import { Appointment } from '../../types.ts'

type AppointmentDetailProp = {
  appointment: Appointment,
  medias: BinaryData[]
}

export default function AppointmentDetail(
  { appointment, medias }: AppointmentDetailProp,
){
  return <div className='py-6 px-4 rounded-md border-2 border-gray-300 bg-gray-300'>Hello</div>
}