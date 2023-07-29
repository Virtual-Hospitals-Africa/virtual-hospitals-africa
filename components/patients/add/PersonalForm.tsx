import {
  DateInput,
  PhoneNumberInput,
  SelectInput,
  TextInput,
} from '../../library/form/Inputs.tsx'
import FormRow from '../../library/form/Row.tsx'
import Buttons from '../../library/form/buttons.tsx'
import FilePreviewInput from '../../../islands/file-preview-input.tsx'
import { AddPatientDataProps } from '../../../routes/app/patients/add.tsx'

type PatientPersonalFormProps = AddPatientDataProps['personal']

export default function PatientPersonalForm({
  first_name = '',
  last_name = '',
  middle_names = '',
  gender = null,
  phone_number = '',
  date_of_birth = '',
  national_id_number = '',
  avatar_media_id,
  avatar_media_name = '',
}: PatientPersonalFormProps) {
  return (
    <>
      <FormRow>
        <TextInput name='first_name' value={first_name} required />
        <TextInput name='middle_names' value={middle_names} />
        <TextInput name='last_name' value={last_name} required />
      </FormRow>
      <FormRow>
        <SelectInput name='gender' required label='Sex/Gender'>
          <option value='female' selected={gender === 'female'}>Female</option>
          <option value='male' selected={gender === 'male'}>Male</option>
          <option value='other' selected={gender === 'other'}>Other</option>
        </SelectInput>
        <DateInput name='date_of_birth' value={date_of_birth} required />
      </FormRow>
      <FormRow>
        <TextInput
          name='national_id_number'
          required
          label='National ID Number'
          value={national_id_number}
        />
        {/* TODO: support non-required phone numbers on the backend */}
        <PhoneNumberInput name='phone_number' value={phone_number} required />
      </FormRow>
      <FormRow className='flex-wrap'>
        <FilePreviewInput
          name='avatar_media'
          label='Photo'
          classNames='w-36 h-36'
          value={avatar_media_id
            ? `/app/patients/avatar/${avatar_media_id}`
            : undefined}
          fileName={avatar_media_name}
        />
      </FormRow>
      <hr className='my-2' />
      <Buttons
        submitText='Next Step'
        cancelHref='/app/patients'
      />
    </>
  )
}
