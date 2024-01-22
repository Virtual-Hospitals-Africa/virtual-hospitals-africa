import { getIntakeReview } from '../../../db/models/patients.ts'
import { DescriptionList } from '../../library/DescriptionList.tsx'

export default function PatientReview(
  { patient }: {
    patient: Awaited<ReturnType<typeof getIntakeReview>>
  },
) {
  return (
    <DescriptionList
      title='Review Patient Details'
      items={[
        { label: 'Name', children: patient.name },
        { label: 'Phone', children: patient.phone_number },
        { label: 'Date of Birth', children: patient.date_of_birth },
        { label: 'Address', children: patient.address },
      ]}
    />
  )
}
