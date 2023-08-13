import {
  GenderInput,
  PhoneNumberInput,
  TextInput,
} from '../../../library/form/Inputs.tsx'

import FormRow from '../../../library/form/Row.tsx'
import Buttons from '../../../library/form/buttons.tsx'
import { Button } from '../../../library/Button.tsx'

export default function NursePersonalForm() {
  return (
    <>
      <FormRow>
        <TextInput
          name='first_name'
          required
          label='First Name'
        />
        <TextInput
          name='middle_names'
          label='Middle Names'
        />
        <TextInput
          name='last_name'
          required
          label='Last Name'
        />
      </FormRow>
      <FormRow>
        <GenderInput required />
      </FormRow>
      <FormRow>
        <TextInput
          name='national_id'
          required
          placeholder='12345678A12'
          pattern='^[0-9]{8}[a-zA-Z]{1}[0-9]{2}$'
          label='National ID Number'
        />
      </FormRow>
      <FormRow>
        <TextInput name='email' type='email' required label='Email' />
        <PhoneNumberInput
          name='mobile_number'
          required
          label='Mobile Phone Number'
        />
      </FormRow>
      <hr className='my-2' />
      <div className='container grid grid-cols-1'>
        <Button type='submit'>Next</Button>
      </div>
    </>
  )
}
