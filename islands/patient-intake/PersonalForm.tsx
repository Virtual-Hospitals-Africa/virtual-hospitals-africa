import { useSignal } from '@preact/signals'
import {
  DateInput,
  EthnicitySelect,
  GenderSelect,
  PhoneNumberInput,
  TextInput,
} from '../form/Inputs.tsx'
import FormRow from '../../components/library/FormRow.tsx'
import { ImagePreviewInput } from '../file-preview-input.tsx'
import { PatientIntake } from '../../types.ts'
import NationalIdInput from '../NationalIdInput.tsx'
import NationalIdInputCheckbox from '../NationalIdInputCheckbox.tsx'
import FormSection from '../../components/library/FormSection.tsx'

export default function PatientPersonalForm(
  { patient = {}, previously_completed }: {
    patient?: Partial<PatientIntake>
    previously_completed?: boolean
  },
) {
  const names = patient.name ? patient.name.split(/\s+/) : []
  const no_national_id = useSignal<boolean>(
    !!previously_completed && !patient.national_id_number,
  )
  return (
    <>
      <FormSection header='Patient Information'>
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
          <fieldset>
            <NationalIdInputCheckbox no_national_id={no_national_id} />
            <NationalIdInput
              value={patient.national_id_number}
              no_national_id={no_national_id}
            />
          </fieldset>
          <PhoneNumberInput
            name='phone_number'
            value={patient.phone_number}
          />
        </FormRow>
        <FormRow className='flex-wrap'>
          <ImagePreviewInput
            name='avatar_media'
            label='Profile Picture'
            className='w-36'
            value={patient.avatar_url}
          />
        </FormRow>
      </FormSection>
    </>
  )
}
