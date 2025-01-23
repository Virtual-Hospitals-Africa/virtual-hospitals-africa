import {
  DateInput,
  EthnicitySelect,
  GenderSelect,
  PhoneNumberInput,
  TextInput,
} from '../../islands/form/Inputs.tsx'
import FormRow from '../library/FormRow.tsx'
import { PatientIntake } from '../../types.ts'
import { NationalIdFormGroup } from '../../islands/NationalId.tsx'
import FormSection from '../library/FormSection.tsx'

export default function PatientSection(
  { patient = {} }: {
    patient?: Partial<PatientIntake>
  },
) {
  const names = patient.name ? patient.name.split(/\s+/) : []

  return (
    <>
      <FormSection header='Patient Information'>
        <FormRow>
          <TextInput
            name='first_name'
            value={names[0]}
            required
          />
          <TextInput name='middle_names' value={names.slice(1, -1).join(' ')} />
          <TextInput
            name='last_name'
            value={names.slice(-1)[0]}
            required
          />
        </FormRow>
        <FormRow>
          <GenderSelect value={patient.gender} />
          <DateInput
            name='date_of_birth'
            value={patient.date_of_birth}
            required
          />
          <EthnicitySelect value={patient.ethnicity} />
          <PhoneNumberInput
            name='phone_number'
            value={patient.phone_number}
          />
        </FormRow>
        <NationalIdFormGroup
          national_id_number={patient.national_id_number}
        />
      </FormSection>
    </>
  )
}
