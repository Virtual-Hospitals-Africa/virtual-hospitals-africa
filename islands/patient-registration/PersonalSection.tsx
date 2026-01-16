import FormGrid from '../../components/library/FormGrid.tsx'
import { RenderedPatient } from '../../types.ts'
import { SouthAfricanNationalIdFormGroup } from '../SouthAfricanNationalId.tsx'
import FormSection from '../../components/library/FormSection.tsx'
import { DateInput } from '../form/inputs/date.tsx'
import { LanguageSelect } from '../form/inputs/language.tsx'
import { NamesInputs } from './NamesInputs.tsx'
import { SexAndGenderInputs } from './SexAndGenderInputs.tsx'
import { asResult } from '../../util/asResult.ts'
import { TargetedClipboardEvent } from 'preact'

function devModeFillFormOnJsonPaste(event: TargetedClipboardEvent<HTMLElement>) {
  const pasted_text = event.clipboardData?.getData('text')?.trim()
  if (!pasted_text) return
  if (pasted_text[0] !== '{') return
  const json = asResult(() => JSON.parse(pasted_text))
  if (!json.success) return
  for (const key in json.value) {
    const input = event.currentTarget.querySelector(`[name="${key}"]`) as HTMLInputElement
    if (!input) continue
    input.value = json.value[key]
    input.dispatchEvent(new Event('input'))
  }
}

export default function PatientRegistrationPersonalSection(
  {
    header,
    patient = {},
    organization_default_language_code,
    server_country,
    previously_completed_step,
    include_language_and_national_id_inputs,
  }: {
    header: string
    patient: Partial<RenderedPatient>
    organization_default_language_code: string | null
    server_country: string
    previously_completed_step: boolean
    include_language_and_national_id_inputs: boolean
  },
) {
  return (
    <FormSection
      header={header}
      onPaste={devModeFillFormOnJsonPaste}
    >
      <FormGrid columns={3}>
        <NamesInputs names={patient.names || {}} />
        <DateInput
          name='date_of_birth'
          value={patient.date_of_birth}
          required
        />
        <SexAndGenderInputs
          sex={patient.sex ?? null}
          gender={patient.gender ?? null}
        />
      </FormGrid>
      {include_language_and_national_id_inputs && (
        <>
          <hr className='border-gray-300' />
          <FormGrid columns={2}>
            <LanguageSelect
              value={patient.preferred_language_code_iso_639_2_b}
              default_language_code={organization_default_language_code}
              server_country={server_country}
            />
            <SouthAfricanNationalIdFormGroup
              national_id_number={patient.national_id_number}
              previously_completed_step={previously_completed_step}
            />
          </FormGrid>
        </>
      )}
    </FormSection>
  )
}
