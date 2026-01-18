import { useSignal } from '@preact/signals'
import FormGrid from '../components/library/FormGrid.tsx'
import FormSection from '../components/library/FormSection.tsx'
import { Separator } from '../components/Separator.tsx'
import { RenderedPatient } from '../types.ts'
import AsyncSearch from './AsyncSearch.tsx'
import { DateInput } from './form/inputs/date.tsx'
import { SexAndGenderInputs } from './patient-registration/SexAndGenderInputs.tsx'

export function ReturningOrNewPatient(_props: {
  patient: RenderedPatient
}) {
  const patient_found = useSignal<null | RenderedPatient>(null)

  return (
    <>
      <FormSection header='Patient'>
        <AsyncSearch
          name='patient'
          search_route='/app/patients'
          label='Patient'
          skip_blank_search
          placeholder='Find or enter a patient'
          required
          addable={{
            formatDisplay(query: string) {
              return `Add "${query}" as a new patient`
            },
          }}
          onSelect={(patient) => {
            if (patient && patient.id !== 'add') {
              patient_found.value = patient as RenderedPatient
            }
          }}
        />
      </FormSection>
      <Separator />
      <FormSection header='Demographics'>
        <FormGrid columns={3}>
          <DateInput
            name='date_of_birth'
            value={patient_found.value?.date_of_birth}
            required
            readonly={!!patient_found.value}
          />
          <SexAndGenderInputs
            key={patient_found.value?.sex}
            sex={patient_found.value?.sex ?? null}
            gender={patient_found.value?.gender ?? null}
            readonly={!!patient_found.value}
          />
        </FormGrid>
      </FormSection>
    </>
  )
}
