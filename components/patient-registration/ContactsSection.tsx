import { RenderedPatient } from '../../types.ts'

export default function PatientContactsSection(
  { patient = {} }: {
    patient?: Partial<RenderedPatient>
  },
) {
  console.log(patient, 'TODO PatientContactsSection')
}
