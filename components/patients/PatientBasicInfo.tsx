import { RenderedPatient } from '../../types.ts'
import Avatar from '../library/Avatar.tsx'

interface PatientBasicInfoProps {
  patient: RenderedPatient
}

export default function PatientBasicInfo(
  { patient }: PatientBasicInfoProps,
) {

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)


  return (
    <div className="flex items-center">
      <Avatar
        src={patient.avatar_url}
        className="w-20 h-20 rounded-full object-cover mr-4"
        hide_when_empty={false}
      />

      <div>
        <h2 className="font-bold text-gray-800">{patient.name}</h2>
        <p className="text-gray-600">
          {capitalize(patient.gender || '')}, {patient.age_display}
        </p>
        <p className="text-gray-500 mt-1">{patient.nearest_organization}</p>
      </div>
    </div>
  )
}
