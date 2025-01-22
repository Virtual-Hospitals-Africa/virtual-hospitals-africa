import FormRow from '../../components/library/FormRow.tsx'
import PersonSearch from '../PersonSearch.tsx'
import { OrganizationDoctorOrNurse } from '../../types.ts'
import { RadioGroup, TextArea } from '../form/Inputs.tsx'
import ProvidersSelect from '../ProvidersSelect.tsx'
import Form from '../../components/library/Form.tsx'
import { Button } from '../../components/library/Button.tsx'
import { ENCOUNTER_REASONS } from '../../shared/encounter.ts'

const radio_group_options = Array.from(ENCOUNTER_REASONS).map((
  value,
) => ({
  value,
}))

export default function AddPatientForm({
  providers,
  patient,
}: {
  providers: OrganizationDoctorOrNurse[]
  patient: { id: string; name: string }
}) {
  return (
    <Form method='POST'>
      <div className='flex flex-col w-full gap-2'>
        <FormRow>
          <label className='text-base font-semibold text-gray-900'>
            Patient
          </label>
        </FormRow>
        <FormRow>
          <PersonSearch
            name='patient'
            search_route='/app/patients'
            label=''
            required
            value={patient}
            readonly
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
            value='seeking treatment'
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
          <Button
            type='submit'
            name='waiting_room'
            value='true'
          >
            Add to waiting room
          </Button>
          <Button type='submit'>
            Start Visit
          </Button>
        </FormRow>
      </div>
    </Form>
  )
}
