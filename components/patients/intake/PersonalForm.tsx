import {
  CheckboxInput,
  DateInput,
  EthnicitySelect,
  GenderSelect,
  PhoneNumberInput,
  TextInput,
} from '../../library/form/Inputs.tsx'
import FormRow from '../../library/form/Row.tsx'
import { ImagePreviewInput } from '../../../islands/file-preview-input.tsx'
import { PatientIntake } from '../../../types.ts'
import NationalIdInput from '../../../islands/NationalIdInput.tsx'
import { useSignal } from '@preact/signals'
import NationalIdInputCheckbox from '../../../islands/NationalIdInputCheckbox.tsx'

export default function PatientPersonalForm(
  { patient = {} }: { patient?: Partial<PatientIntake> },
) {
  const names = patient.name ? patient.name.split(/\s+/) : []
  const no_national_id = useSignal<boolean>(!patient.national_id_number)
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
        <GenderSelect value={patient.gender} />
        <DateInput
          name='date_of_birth'
          value={patient.date_of_birth}
          required
        />
        <EthnicitySelect value={patient.ethnicity} />
      </FormRow>
      <FormRow>
        <NationalIdInputCheckbox no_national_id={no_national_id} />
        <NationalIdInput
          value={patient.national_id_number}
          no_national_id={no_national_id}
        />
        <PhoneNumberInput
          name='phone_number'
          value={patient.phone_number}
        />
      </FormRow>
      <FormRow className='flex-wrap'>
        <ImagePreviewInput
          name='avatar_media'
          label='Photo'
          className='w-36 h-36'
          value={patient.avatar_url}
        />
      </FormRow>
    </>
  )
}
