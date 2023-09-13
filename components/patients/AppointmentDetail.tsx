import { AppointmentWithAllPatientInfo } from '../../types.ts'
import Media from '../library/Media.tsx'
type AppointmentDetailProp = {
  appointment: AppointmentWithAllPatientInfo
  mediaFiles: {
    media_id: number
    mime_type: string
  }[]
}

export default function AppointmentDetail(
  { appointment, mediaFiles }: AppointmentDetailProp,
) {
  return (
    <div className='py-6 px-4 rounded-md border-2 border-gray-300 bg-gray-300'>
      <div>Appointment Medias:</div>
      <div>
        {mediaFiles.map((media) =>
          Media({
            src: `../appointments/${appointment.id}/media/${media.media_id}`,
            mime_type: media.mime_type,
          })
        )}
      </div>
    </div>
  )
}
