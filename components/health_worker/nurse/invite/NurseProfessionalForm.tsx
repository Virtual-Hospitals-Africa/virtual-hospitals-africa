import {
  DateInput,
  SelectInput,
  TextInput,
} from '../../../library/form/Inputs.tsx'

import FormRow from '../../../library/form/Row.tsx'
import Buttons from '../../../library/form/buttons.tsx'
import { NurseSpecialities } from '../../../../types.ts'

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
        <SelectInput name='speciality' label='Speciality' required>
          {NurseSpecialities.map((speciality) => (
            <option
              value={speciality}
              label={prettierSpecialityName(speciality)}
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

function prettierSpecialityName(specialityName: string): string {
  const name = specialityName.replaceAll('\_', ' ')
  return name.charAt(0).toUpperCase() + name.slice(1)
}
