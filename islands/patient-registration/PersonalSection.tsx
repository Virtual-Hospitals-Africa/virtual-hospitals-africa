import FormGrid from '../../components/library/FormGrid.tsx'
import { RenderedPatient } from '../../types.ts'
import { SouthAfricanNationalIdFormGroup } from '../SouthAfricanNationalId.tsx'
import FormSection from '../../components/library/FormSection.tsx'
import { DateInput } from '../form/inputs/date.tsx'
import { LanguageSelect } from '../form/inputs/language.tsx'
import { NamesInputs } from './NamesInputs.tsx'
import { SexAndGenderInputs } from './SexAndGenderInputs.tsx'

export default function PatientRegistrationPersonalSection(
  {
    patient = {},
    organization_default_language_code,
    server_country,
    previously_completed_step,
  }: {
    patient: Partial<RenderedPatient>
    organization_default_language_code: string | null
    server_country: string
    previously_completed_step: boolean
  },
) {
  return (
    <FormSection header='Patient Information'>
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
    </FormSection>
  )
}
