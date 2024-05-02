import { computed, useSignal } from '@preact/signals'
import FormRow from '../form/Row.tsx'
import PersonSearch from '../PersonSearch.tsx'
import { Maybe, OrganizationDoctorOrNurse } from '../../types.ts'
import { RadioGroup, TextArea } from '../form/Inputs.tsx'
import ProvidersSelect from '../ProvidersSelect.tsx'
import Form from '../../components/library/Form.tsx'
import { Button } from '../../components/library/Button.tsx'
import { PersonData } from '../../components/library/Person.tsx'
import { ENCOUNTER_REASONS } from '../../shared/encounter.ts'
import { EncounterReason } from '../../db.d.ts'

const radio_group_options = Array.from(ENCOUNTER_REASONS).map((
  value,
) => ({
  value,
}))

export default function AddPatientForm({
  open_encounter,
  providers,
  patient,
}: {
  open_encounter: Maybe<{ encounter_id: string; reason: EncounterReason }>
  providers: OrganizationDoctorOrNurse[]
  patient: { id?: string | 'add'; name: string } | undefined
}) {
  const selected_patient = useSignal<PersonData | undefined>(patient)
  const is_returning_patient = computed(() =>
    !!selected_patient.value && selected_patient.value.id !== 'add'
  )

  return (
    <Form method='POST'>
      <div className='flex flex-col w-full gap-2'>
        <FormRow>
          {open_encounter && (
            <input
              type='hidden'
              name='encounter_id'
              value={open_encounter.encounter_id}
            />
          )}
        </FormRow>
        <FormRow>
          <label className='text-base font-semibold text-gray-900'>
            Patient
          </label>
        </FormRow>
        <FormRow>
          <PersonSearch
            name='patient'
            href='/app/patients'
            label=''
            required
            addable
            value={selected_patient.value}
            readonly={!!patient}
            onSelect={(patient) => selected_patient.value = patient}
          />
        </FormRow>
        <FormRow>
          <label className='text-base font-semibold text-gray-900'>
            Employees
          </label>
        </FormRow>
        <FormRow>
          <ProvidersSelect providers={providers} />
        </FormRow>
        <FormRow>
          <RadioGroup
            name='reason'
            label='Reason for visit'
            options={radio_group_options}
            value={open_encounter?.reason || 'seeking treatment'}
          />
        </FormRow>
        <FormRow>
          <label className='text-base font-semibold text-gray-900'>
            Notes
          </label>
        </FormRow>
        <FormRow>
          <TextArea name='notes' label='' />
        </FormRow>
        <FormRow>
          <Button type='submit' name='waiting_room' value='waiting_room'>
            Add to waiting room
          </Button>
          {selected_patient.value && !is_returning_patient.value && (
            <Button type='submit' name='intake' value='intake'>
              Start Intake
            </Button>
          )}
          {selected_patient.value && is_returning_patient.value && (
            <Button
              href={`/app/patients/${selected_patient.value.id}`}
            >
              Review and begin visit
            </Button>
          )}
        </FormRow>
      </div>
    </Form>
  )
}
