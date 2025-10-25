import FormRow from '../../components/library/FormRow.tsx'
import { Maybe, RenderedPatient } from '../../types.ts'
import { NationalIdFormGroup } from '../../islands/NationalId.tsx'
import FormSection from '../../components/library/FormSection.tsx'
import { effect, useSignal } from '@preact/signals'
import SelectWithOther from '../SelectWithOther.tsx'
import { DateInput } from '../form/inputs/date.tsx'
import { SexSelect } from '../form/inputs/sex.tsx'
import { TextInput } from '../form/inputs/text.tsx'
import { Iso6392BLanguages } from '../../db.d.ts'
import { LanguageInput } from '../form/inputs/language.tsx'

export default function PatientRegistrationPersonalSection(
  { patient = {}, organization_default_language_code, languages }: {
    patient: Partial<RenderedPatient>
    organization_default_language_code: Maybe<string>
    languages: Iso6392BLanguages[]
  },
) {
  const preferred_name_dirty = useSignal<boolean>(!!patient.names?.preferred)
  const preferred_name = useSignal(patient.names?.preferred || '')
  const first_names = useSignal(patient.names?.first || '')

  effect(() => {
    if (!preferred_name_dirty.value) {
      preferred_name.value = first_names.value.trim().split(' ')[0]
    }
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
          <SexSelect value={patient.sex} />
          <SelectWithOther
            placeholder='Gender'
            label='Gender'
            name='gender'
            value={patient.gender ?? undefined}
            options={[
              'man',
              'woman',
              'non-binary',
            ]}
          />
        </FormRow>
        <LanguageInput
          value={patient.preferred_language_code_iso_639_2_b}
          default_language_code={organization_default_language_code}
          languages={languages}
        />
        <NationalIdFormGroup
          national_id_number={patient.national_id_number}
        />
      </FormSection>
    </>
  )
}
