import {
  DateInput,
  GenderSelect,
  TextInput,
} from '../../islands/form/Inputs.tsx'
import FormRow from '../library/FormRow.tsx'
import { RenderedPatient } from '../../types.ts'
import { NationalIdFormGroup } from '../../islands/NationalId.tsx'
import FormSection from '../library/FormSection.tsx'

export default function PatientPersonalSection(
  { patient = {} }: {
    patient?: Partial<RenderedPatient>
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
        </FormRow>
        <NationalIdFormGroup
          national_id_number={patient.national_id_number}
        />
      </FormSection>
    </>
  )
}
