import { useSignal } from '@preact/signals'
import { DateInput, PharmacyTypeSelect, TextInput } from './Inputs.tsx'
import FormRow from './Row.tsx'
import Buttons from './buttons.tsx'
import { RenderedPharmacy } from '../../types.ts'
import Form from '../../components/library/Form.tsx'
import { AddRow, RemoveRow } from '../AddRemove.tsx'
import AddPharmacistSearch, {
  PharmacistOption,
} from '../../islands/AddPharmacistSearch.tsx'

type PharmacyForm = {
  formData: Partial<RenderedPharmacy>
}

export default function PharmacyForm(
  { formData }: PharmacyForm,
) {
  const selectedSupervisors = useSignal<PharmacistOption[]>(
    formData.supervisors ?? [],
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
          value={formData.name}
        />
        <TextInput
          name='licensee'
          required
          type='text'
          label='licensee'
          value={formData.licensee}
        />
      </FormRow>
      <FormRow>
        <TextInput
          name='licence_number'
          required
          type='text'
          label='Licence Number'
          value={formData.licence_number}
          placeholder='P01-0805-2024'
          pattern='^[A-Z]{1}[0-9]{2}-[0-9]{4}-[0-9]{4}$'
        />
        <DateInput
          name='expiry_date'
          required
          label='Expiry Date'
          value={formData.expiry_date}
        />
      </FormRow>

      <FormRow>
        <PharmacyTypeSelect value={formData.pharmacies_types} />
      </FormRow>

      <FormRow>
        <TextInput
          name='town'
          required
          type='text'
          label='Town'
          value={formData.town}
        />
        <TextInput
          name='address'
          required
          type='text'
          label='Address'
          value={formData.address}
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
