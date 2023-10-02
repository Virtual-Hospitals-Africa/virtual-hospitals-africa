import { AppointmentWithAllPatientInfo } from '../../types.ts'
import Media from '../library/Media.tsx'
type AppointmentDetailProp = {
  appointment: AppointmentWithAllPatientInfo
}

export default function AppointmentDetail(
  { appointment }: AppointmentDetailProp,
) {
  return (
    <div className='py-6 px-4 rounded-md border-2 border-gray-300 bg-gray-300'>
      <div>Appointment Medias:</div>
      <div>
        {appointment.media.map((media) => (
          <Media
            src={`/app/calendar/appointments/${appointment.id}/media/${media.media_id}`}
            mime_type={media.mime_type}
          />
        ))}
      </div>
    </div>
  )
}
