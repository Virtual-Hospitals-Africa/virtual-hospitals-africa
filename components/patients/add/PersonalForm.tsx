import {
  DateInput,
  PhoneNumberInput,
  SelectInput,
  TextInput,
} from '../../library/form/Inputs.tsx'
import FormRow from '../../library/form/Row.tsx'
import FilePreviewInput from '../../../islands/file-preview-input.tsx'
import { OnboardingPatient } from '../../../types.ts'

export default function PatientPersonalForm(
  { patient = {} }: { patient?: Partial<OnboardingPatient> },
) {
  const names = patient.name ? patient.name.split(/\W+/) : []

  return (
    <>
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
        <SelectInput name='gender' required label='Sex/Gender'>
          <option value='female' selected={patient.gender === 'female'}>
            Female
          </option>
          <option value='male' selected={patient.gender === 'male'}>
            Male
          </option>
          <option value='other' selected={patient.gender === 'other'}>
            Other
          </option>
        </SelectInput>
        <DateInput
          name='date_of_birth'
          value={patient.date_of_birth}
          required
        />
      </FormRow>
      <FormRow>
        <TextInput
          name='national_id_number'
          required
          label='National ID Number'
          value={patient.national_id_number}
        />
        {/* TODO: support non-required phone numbers on the backend */}
        <PhoneNumberInput
          name='phone_number'
          value={patient.phone_number}
        />
      </FormRow>
      <FormRow className='flex-wrap'>
        <FilePreviewInput
          name='avatar_media'
          label='Photo'
          classNames='w-36 h-36'
          value={patient.avatar_url}
        />
      </FormRow>
    </>
  )
}
