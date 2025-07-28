import { useSignal } from '@preact/signals'
import { DateInput, PharmacyTypeSelect, TextInput } from '../form/Inputs.tsx'
import FormRow from '../../components/library/FormRow.tsx'
import Buttons from '../form/buttons.tsx'
import { RenderedPharmacy } from '../../types.ts'
import Form from '../../components/library/Form.tsx'
import { AddRow, RemoveRow } from '../AddRemove.tsx'
import AddPharmacistSearch, {
  PharmacistOption,
} from '../AddPharmacistSearch.tsx'

type PharmacyForm = {
  form_data: Partial<RenderedPharmacy>
  country: string
}

export default function PharmacyForm(
  { form_data, country }: PharmacyForm,
) {
  const selectedSupervisors = useSignal<PharmacistOption[]>(
    form_data.supervisors ?? [],
  )
  const addSupervisor = () => {
    selectedSupervisors.value = [
      ...selectedSupervisors.value,
      {
        id: '',
        name: '',
        removed: false,
      },
    ]
  }
  const removeSupervisor = (selectedIndex: number) => {
    selectedSupervisors.value = selectedSupervisors.value.map(
      (supervisor, index) => {
        if (index !== selectedIndex) return supervisor
        return {
          ...supervisor,
          removed: true,
        }
      },
    )
  }
  return (
    <Form method='POST'>
      <FormRow>
        <TextInput
          name='name'
          required
          type='text'
          label='Name'
          value={form_data.name}
        />
        <TextInput
          name='licensee'
          required
          type='text'
          label='licensee'
          value={form_data.licensee}
        />
      </FormRow>
      <FormRow>
        <TextInput
          name='licence_number'
          required
          type='text'
          label='Licence Number'
          value={form_data.licence_number}
          placeholder='P01-0805-2024'
          pattern='^[A-Z]{1}[0-9]{2}-[0-9]{4}-[0-9]{4}$'
        />
        <DateInput
          name='expiry_date'
          required
          label='Expiry Date'
          value={form_data.expiry_date}
        />
      </FormRow>

      <FormRow>
        <PharmacyTypeSelect value={form_data.pharmacies_types} />
      </FormRow>

      <FormRow>
        <TextInput
          name='town'
          required
          type='text'
          label='Town'
          value={form_data.town}
        />
        <TextInput
          name='address'
          required
          type='text'
          label='Address'
          value={form_data.address}
        />
      </FormRow>
      <hr className='my-2' />
      {selectedSupervisors.value.map((selectedSupervisor, index) =>
        !selectedSupervisor.removed && (
          <RemoveRow
            onClick={() => removeSupervisor(index)}
            key={index}
            labelled
          >
            <FormRow>
              <AddPharmacistSearch
                country={country}
                name={`supervisors.${index}`}
                label='Supervisor'
                value={selectedSupervisor}
                required
                onSelect={(supervisor) => {
                  selectedSupervisors.value[index] = {
                    ...selectedSupervisors.value[index],
                    ...supervisor,
                  }
                }}
              />
            </FormRow>
          </RemoveRow>
        )
      )}
      <AddRow
        text='Add Supervisor'
        onClick={addSupervisor}
      />
      <hr className='my-2' />
      <Buttons submitText='Submit' />
    </Form>
  )
}
