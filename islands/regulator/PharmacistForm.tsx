import { useSignal } from '@preact/signals'
import {
  DateInput,
  PharmacistTypeSelect,
  PrefixSelect,
  TextInput,
} from '../form/Inputs.tsx'
import FormRow from '../../components/library/FormRow.tsx'
import Buttons from '../form/buttons.tsx'
import { RenderedPharmacist } from '../../types.ts'
import Form from '../../components/library/Form.tsx'
import { IsSupervisorSelect } from '../form/Inputs.tsx'
import AddPharmacySearch from '../AddPharmacySearch.tsx'
import { AddRow, RemoveRow } from '../AddRemove.tsx'
import { PharmacyOption } from '../AddPharmacySearch.tsx'

type PharmacistForm = {
  form_data: Partial<RenderedPharmacist>
  country: string
}

export default function PharmacistForm(
  { form_data, country }: PharmacistForm,
) {
  const selectedPharmacies = useSignal<PharmacyOption[]>(
    form_data.pharmacies ?? [],
  )
  const addPharmacy = () => {
    selectedPharmacies.value = [
      ...selectedPharmacies.value,
      {
        is_supervisor: false,
        id: '',
        name: '',
        removed: false,
      },
    ]
  }
  const remove = (selectedIndex: number) => {
    selectedPharmacies.value = selectedPharmacies.value.map(
      (pharmacy, index) => {
        if (index !== selectedIndex) return pharmacy
        return {
          ...pharmacy,
          removed: true,
        }
      },
    )
  }
  return (
    <Form method='POST'>
      <FormRow>
        <TextInput
          name='given_name'
          required
          type='text'
          label='Given Name'
          value={form_data.given_name}
        />
        <TextInput
          name='family_name'
          required
          type='text'
          label='Family Names'
          value={form_data.family_name}
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
        <PrefixSelect value={form_data.prefix} />
        <PharmacistTypeSelect value={form_data.pharmacist_type} />
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
      {selectedPharmacies.value.map((selectedPharmacy, index) =>
        !selectedPharmacy.removed && (
          <RemoveRow onClick={() => remove(index)} key={index} labelled>
            <FormRow>
              <AddPharmacySearch
                country={country}
                name={`pharmacies.${index}`}
                label='Pharmacy'
                value={selectedPharmacy}
                required
                onSelect={(pharmacy) => {
                  selectedPharmacies.value[index] = {
                    ...selectedPharmacies.value[index],
                    ...pharmacy,
                  }
                }}
              />
              <IsSupervisorSelect
                value={selectedPharmacy.is_supervisor?.toString()}
                isRequired={selectedPharmacy.name !== undefined}
                prefix={`pharmacies.${index}`}
              />
            </FormRow>
          </RemoveRow>
        )
      )}
      <AddRow
        text='Add Pharmacy'
        onClick={addPharmacy}
      />
      <hr className='my-2' />
      <Buttons submitText='Submit' />
    </Form>
  )
}
