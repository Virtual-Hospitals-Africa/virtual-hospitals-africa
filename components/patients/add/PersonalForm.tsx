import {
  DateInput,
  ImageInput,
  PhoneNumberInput,
  SelectInput,
  TextInput,
} from '../../library/form/Inputs.tsx'
import FormRow from '../../library/form/Row.tsx'
import Buttons from '../../library/form/buttons.tsx'

export default function PatientPersonalForm() {
  return (
    <>
      <FormRow>
        <TextInput name='first_name' required />
        <TextInput name='middle_names' />
        <TextInput name='last_name' required />
      </FormRow>
      <FormRow>
        <SelectInput name='gender' required label='Sex/Gender'>
          <option value='female'>Female</option>
          <option value='male'>Male</option>
          <option value='other'>Other</option>
        </SelectInput>
        <DateInput name='date_of_birth' required />
      </FormRow>
      <FormRow>
        <TextInput
          name='national_id_number'
          required
          label='National ID Number'
        />
        {/* TODO: support non-required phone numbers on the backend */}
        <PhoneNumberInput name='phone_number' required />
      </FormRow>
      <FormRow>
        <ImageInput name='avatar_url' label='Photo' />
      </FormRow>
      <hr className='mb-2' />
      <Buttons />
    </>
  )
}
