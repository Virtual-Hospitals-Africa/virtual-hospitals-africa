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

/*
  - Update the Layout component to be grey
  - Move the title up
  - Update the left sidebar to include the health worker's profile
  - Update the FormRow component to be a CSS Grid
    - by default all of the children will divide the space evenly with 32px of separation
    - Enable a property to be set on the TextInput (or other inputs) whereby a field can take up more of the grid (such as 2/3 of the space = 8 columns)
  - Make a card component that flexes left to right
  - Update FormSection component to be laid out vertically
  - Update ButtonsContainer on patient intake page to be position: `fixed` to the bottom of the screen
  - Update form inputs to those documented in the design
  - Wire these form inputs up to the backend where appropriate
*/

export default function PatientSection(
  { patient = {} }: {
    patient?: Partial<PatientIntake>
  },
) {
  const names = patient.name ? patient.name.split(/\s+/) : []

  return (
    <>
      <FormSection header='General'>
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
