import { PatientFamily, PatientIntake } from '../../../types.ts'
import PatientFamilyForm from '../../../islands/family/Form.tsx'

export default function FamilyForm(
  { patient = {}, family }: {
    patient?: Partial<PatientIntake>
    family: PatientFamily
  },
) {
  const age_number =
    (patient.age?.age_unit === 'year' ? patient.age?.age_number : 0) ?? 0
  return (
    <>
      <section>
        <PatientFamilyForm family={family} age={age_number} />
      </section>
    </>
  )
}
