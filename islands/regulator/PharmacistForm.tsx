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
  formData: Partial<RenderedPharmacist>
}

export default function PharmacistForm(
  { formData }: PharmacistForm,
) {
  const selectedPharmacies = useSignal<PharmacyOption[]>(
    formData.pharmacies ?? [],
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
          value={formData.given_name}
        />
        <TextInput
          name='family_name'
          required
          type='text'
          label='Family Names'
          value={formData.family_name}
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
        <PrefixSelect value={formData.prefix} />
        <PharmacistTypeSelect value={formData.pharmacist_type} />
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
      {selectedPharmacies.value.map((selectedPharmacy, index) =>
        !selectedPharmacy.removed && (
          <RemoveRow onClick={() => remove(index)} key={index} labelled>
            <FormRow>
              <AddPharmacySearch
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
