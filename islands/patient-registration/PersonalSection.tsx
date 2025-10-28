import FormRow from '../../components/library/FormRow.tsx'
import { Maybe, RenderedPatient, Sex } from '../../types.ts'
import { NationalIdFormGroup } from '../../islands/NationalId.tsx'
import FormSection from '../../components/library/FormSection.tsx'
import { useSignal, useSignalEffect } from '@preact/signals'
import SelectWithOther from '../SelectWithOther.tsx'
import { DateInput } from '../form/inputs/date.tsx'
import { TextInput } from '../form/inputs/text.tsx'
import { LanguageSelect } from '../form/inputs/language.tsx'
import { SelectWithOptions } from '../form/inputs/select_with_options.tsx'

function genderOptions(sex: Sex) {
  switch (sex) {
    case 'female':
      return ['Woman', 'Trans man', 'Prefer not to say']
    case 'male':
      return ['Man', 'Trans woman', 'Prefer not to say']
    case 'other':
      return []
    case 'prefer not to say':
      return ['Prefer not to say']
  }
}

export default function PatientRegistrationPersonalSection(
  { patient = {}, organization_default_language_code, server_country }: {
    patient: Partial<RenderedPatient>
    organization_default_language_code: string | null
    server_country: string
  },
) {
  const preferred_name_dirty = useSignal<boolean>(!!patient.names?.preferred)
  const preferred_name = useSignal(patient.names?.preferred || '')
  const first_names = useSignal(patient.names?.first || '')
  const sex = useSignal(patient.sex)
  const gender = useSignal(patient.gender)
  const gender_dirty = useSignal(!!patient.gender)
  const gender_options = useSignal([
    'man',
    'woman',
    'non-binary',
  ])

  useSignalEffect(() => {
    if (!preferred_name_dirty.value) {
      preferred_name.value = first_names.value.trim().split(' ')[0]
    }
  })

  useSignalEffect(() => {
    if (!sex.value) return
    if (gender_dirty.value) return
    gender_options.value = genderOptions(sex.value)
    gender.value = gender_options.value[0]
    console.log('here', gender_options.value, gender.value)
  })

  console.log({
    patient,
    organization_default_language_code,
    server_country,
    preferred_name_dirty: preferred_name_dirty.value,
    preferred_name: preferred_name.value,
    first_names: first_names.value,
    sex: sex.value,
    gender: gender.value,
    gender_dirty: gender_dirty.value,
    gender_options: gender_options.value,
  })

  return (
    <>
      <FormSection header='Patient Information'>
        <FormRow>
          <TextInput
            name='first_names'
            signal={first_names}
            required
            placeholder='Given names'
          />
          <TextInput
            name='surname'
            value={patient.names?.surname}
            required
            placeholder='Family name'
          />
          <TextInput
            name='preferred_name'
            signal={preferred_name}
            required
            onInput={() => {
              preferred_name_dirty.value = true
            }}
            placeholder='Preferred name'
          />
        </FormRow>
        <FormRow>
          <DateInput
            name='date_of_birth'
            value={patient.date_of_birth}
            required
          />
          <SelectWithOptions
            required
            name='sex'
            label='Sex'
            onChange={(event) =>
              sex.value = event.currentTarget.value as Maybe<Sex>}
            blank_option
            value={sex.value ?? undefined}
            options={[
              'male',
              'female',
              'other',
              'prefer not to say',
            ]}
          />
          <SelectWithOther
            required
            placeholder='Gender'
            label='Gender'
            name='gender'
            signal={gender}
            onSelect={(value) => {
              gender.value = value
              gender_dirty.value = true
            }}
            options={gender_options.value}
          />
        </FormRow>
        <LanguageSelect
          value={patient.preferred_language_code_iso_639_2_b}
          default_language_code={organization_default_language_code}
          server_country={server_country}
        />
        <NationalIdFormGroup
          national_id_number={patient.national_id_number}
        />
      </FormSection>
    </>
  )
}
