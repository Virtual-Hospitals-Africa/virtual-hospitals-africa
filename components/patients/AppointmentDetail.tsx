import { AppointmentWithAllPatientInfo } from '../../types.ts'
import Media from '../library/Media.tsx'
type AppointmentDetailProp = {
  appointment: AppointmentWithAllPatientInfo
  medias: number[]
}

export default function AppointmentDetail(
  { appointment, medias }: AppointmentDetailProp,
) {
  return (
    <div className='py-6 px-4 rounded-md border-2 border-gray-300 bg-gray-300'>
      Hello World
      <span>{medias.map((media) => `test ${media}`)}</span>
      <div>
        {medias.map((media) =>
          Media({ src: `app/medias/${media}`, mime_type: 'jpeg' })
        )}
      </div>
    </div>
  )
}
