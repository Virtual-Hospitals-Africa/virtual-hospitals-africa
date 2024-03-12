import { signal } from '@preact/signals'
import FormRow from '../../components/library/form/Row.tsx'
import PersonSearch from '../PersonSearch.tsx'
import { FacilityDoctorOrNurse, Maybe } from '../../types.ts'
import FormButtons from '../../components/library/form/buttons.tsx'
import { RadioGroup, TextArea } from '../../components/library/form/Inputs.tsx'
import ProvidersSelect from '../ProvidersSelect.tsx'
import Form from '../../components/library/form/Form.tsx'
import { Button } from '../../components/library/Button.tsx'
import { PersonData } from '../../components/library/Person.tsx'
import { ENCOUNTER_REASONS } from '../../shared/encounter.ts'
import { EncounterReason } from '../../db.d.ts'

const selectedPatient = signal<PersonData | undefined>(undefined)
const isReturningPatient = signal<boolean>(false)

export default function AddPatientForm({
  open_encounter,
  providers,
  patient,
}: {
  open_encounter: Maybe<{ encounter_id: number; reason: EncounterReason }>
  providers: FacilityDoctorOrNurse[]
  patient: { id?: number | 'add'; name: string } | undefined
}) {
  return (
    <Form method='post'>
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
            value={patient}
            disabled={!!patient}
            onSelect={(patient) => {
              selectedPatient.value = patient
              selectedPatient.value?.id === 'add'
                ? isReturningPatient.value = false
                : isReturningPatient.value = true
            }}
          />
        </FormRow>
        <FormRow>
          <label className='text-base font-semibold text-gray-900'>
            Health Workers at Facilities
          </label>
        </FormRow>
        <FormRow>
          <ProvidersSelect providers={providers} />
        </FormRow>
        <FormRow>
          <RadioGroup
            name='reason'
            label='Reason for visit'
            options={Array.from(ENCOUNTER_REASONS).map((
              value,
            ) => ({
              value,
            }))}
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
          {selectedPatient.value && !isReturningPatient.value && (
            <Button type='submit' name='intake' value='intake'>
              Start Intake
            </Button>
          )}
          {selectedPatient.value && isReturningPatient.value && (
            <Button
              href={`/app/patients/${selectedPatient.value.id}`}
            >
              Review and begin visit
            </Button>
          )}
        </FormRow>
      </div>
    </Form>
  )
}
