import { AppointmentWithAllPatientInfo } from '../../types.ts'
import Media from '../library/Media.tsx'
type AppointmentDetailProp = {
  appointment: AppointmentWithAllPatientInfo
  medias: {
    media_id: number
    mime_type: string
  }[]
}

export default function AppointmentDetail(
  { appointment, medias }: AppointmentDetailProp,
) {
  return (
    <div className='py-6 px-4 rounded-md border-2 border-gray-300 bg-gray-300'>
      <div>Appointment Medias:</div>
      <div>
        {medias.map((media) =>
          Media({
            src: `${appointment.id}/media/${media.media_id}`,
            mime_type: media.mime_type,
          })
        )}
      </div>
    </div>
  )
}
