import {
  DateInput,
  GenderInput,
  NationalIdInput,
  PhoneNumberInput,
  TextInput,
} from '../../library/form/Inputs.tsx'
import FormRow from '../../library/form/Row.tsx'
import FilePreviewInput from '../../../islands/file-preview-input.tsx'
import { OnboardingPatient } from '../../../types.ts'

export default function PatientPersonalForm(
  { patient = {} }: { patient?: Partial<OnboardingPatient> },
) {
  const names = patient.name ? patient.name.split(/\s+/) : []

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
        <GenderInput value={patient.gender} />
        <DateInput
          name='date_of_birth'
          value={patient.date_of_birth}
          required
        />
      </FormRow>
      <FormRow>
        <NationalIdInput value={patient.national_id_number} />
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
