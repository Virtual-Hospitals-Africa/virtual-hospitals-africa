import {
  DateInput,
  SelectInput,
  TextInput,
} from '../../../library/form/Inputs.tsx'

import FormRow from '../../../library/form/Row.tsx'
import Buttons from '../../../library/form/buttons.tsx'
import { NurseSpecialties } from '../../../../types.ts'

export default function NurseProfessionalForm() {
  return (
    <>
      <FormRow>
        <DateInput
          name='date_of_first_practice'
          required
          label='Date of First Practice'
        />
        <TextInput
          name='ncz_registration_number'
          required
          placeholder='GN123456'
          pattern='^[a-zA-Z]{2}[0-9]{6}$'
          label='Nurses Council of Zimbabwe Registration Number'
        />
      </FormRow>
      <FormRow>
        <SelectInput name='specialty' label='Specialty' required>
          {NurseSpecialties.map((specialty) => (
            <option
              value={specialty}
              label={prettierSpecialtyName(specialty)}
            >
            </option>
          ))}
        </SelectInput>
      </FormRow>
      <hr className='my-2' />
      <Buttons
        submitText='Next'
        cancelText='Back'
      />
    </>
  )
}

function prettierSpecialtyName(specialtyName: string): string {
  const name = specialtyName.replaceAll('\_', ' ')
  return name.charAt(0).toUpperCase() + name.slice(1)
}
