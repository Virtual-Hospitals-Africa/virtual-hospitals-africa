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

export default function PatientPersonalForm(
  { initialData = {} }: { initialData: Partial<PatientPersonalFormProps> },
) {
  return (
    <>
      <FormRow>
        <TextInput
          name='first_name'
          value={initialData.first_name}
          required
        />
        <TextInput name='middle_names' value={initialData.middle_names} />
        <TextInput
          name='last_name'
          value={initialData.last_name}
          required
        />
      </FormRow>
      <FormRow>
        <SelectInput name='gender' required label='Sex/Gender'>
          <option value='female' selected={initialData.gender === 'female'}>
            Female
          </option>
          <option value='male' selected={initialData.gender === 'male'}>
            Male
          </option>
          <option value='other' selected={initialData.gender === 'other'}>
            Other
          </option>
        </SelectInput>
        <DateInput
          name='date_of_birth'
          value={initialData.date_of_birth}
          required
        />
      </FormRow>
      <FormRow>
        <TextInput
          name='national_id_number'
          required
          label='National ID Number'
          value={initialData.national_id_number}
        />
        {/* TODO: support non-required phone numbers on the backend */}
        <PhoneNumberInput
          name='phone_number'
          value={initialData.phone_number}
          required
        />
      </FormRow>
      <FormRow className='flex-wrap'>
        <FilePreviewInput
          name='avatar_media'
          label='Photo'
          classNames='w-36 h-36'
          value={initialData.avatar_media_id
            ? `/app/patients/avatar/${initialData.avatar_media_id}`
            : undefined}
          fileName={initialData.avatar_media_name}
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
