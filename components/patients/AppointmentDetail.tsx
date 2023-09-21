import { Appointment } from '../../types.ts'
import MediaItem from '../media/MediaItem.tsx'
type AppointmentDetailProp = {
  appointment: Appointment,
  medias: {binary_data:BinaryData, mime_type:string} []
}

export default function AppointmentDetail(
  { appointment, medias }: AppointmentDetailProp,
){
  return <div className='py-6 px-4 rounded-md border-2 border-gray-300 bg-gray-300'>Hello World
  <div>{medias.map(media => MediaItem(media))}</div>
  </div>
}