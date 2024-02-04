import FormRow from '../../components/library/form/Row.tsx'
import PersonSearch from '../../islands/PersonSearch.tsx'
import * as patient_encounters from '../../db/models/patient_encounters.ts'
import { FacilityDoctorOrNurse, Maybe } from '../../types.ts'
import FormButtons from '../../components/library/form/buttons.tsx'
import { RadioGroup, TextArea } from '../../components/library/form/Inputs.tsx'
import ProvidersSelect from '../../islands/ProvidersSelect.tsx'
import Form from '../../components/library/form/Form.tsx'
import { EncounterReason } from '../../db.d.ts'
import { Button } from '../../components/library/Button.tsx'
import { PersonData } from '../../components/library/Person.tsx'
import { signal } from '@preact/signals'

const selectedPatient = signal<PersonData | undefined>(undefined)
const isReturningPatient = signal<boolean>(false)

export default function AddPatientForm({
  open_encounter,
  providers,
  patient,
}: {
  open_encounter: Maybe<{ encounter_id: number; reason: EncounterReason }>
  providers: FacilityDoctorOrNurse[]
  patient: { id?: number; name: string } | undefined
}) {
  return (
    <Form method='post'>
      {open_encounter && (
        <input
          type='hidden'
          name='encounter_id'
          value={open_encounter.encounter_id}
        />
      )}
      <FormRow>
        <PersonSearch
          name='patient'
          href='/app/patients'
          required
          addable
          value={patient}
          disabled={!!patient}
          onSelect={(patient) => {
            selectedPatient.value = patient
            patient?.id !== 'add'
              ? isReturningPatient.value = true
              : isReturningPatient.value = false
          }}
        />
      </FormRow>
      <FormRow>
        <ProvidersSelect providers={providers} />
      </FormRow>
      <FormRow>
        <RadioGroup
          name='reason'
          label='Reason for visit'
          options={patient_encounters.drop_in_reasons.map((
            value,
          ) => ({
            value,
          }))}
          value={open_encounter?.reason || 'seeking treatment'}
        />
      </FormRow>
      <FormRow>
        <TextArea name='notes' />
      </FormRow>
      <FormRow>
        <FormButtons submitText='Add to waiting room' />
        {selectedPatient.value && isReturningPatient && (
          <Button
            href={`/app/patients/${selectedPatient.value.id}`}
          >
            Review and begin visit
          </Button>
        )}
        {selectedPatient.value && !isReturningPatient && (
          <Button>Start Intake</Button>
        )}
      </FormRow>
    </Form>
  )
}
