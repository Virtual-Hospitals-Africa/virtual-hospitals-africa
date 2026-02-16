import { useSignal } from '@preact/signals'

import FormRow from '../../components/library/FormRow.tsx'
import Buttons from '../form/buttons.tsx'
import { RenderedCountryOrganization } from '../../types.ts'
import Form from '../../components/library/Form.tsx'
import { AddRow, RemoveRow } from '../AddRemove.tsx'
import AddPharmacistSearch, { PharmacistOption } from '../AddPharmacistSearch.tsx'
import { DateInput } from '../form/inputs/date.tsx'
import { PharmacyTypeSelect } from '../form/inputs/pharmacy_type.tsx'
import { TextInput } from '../form/inputs/text.tsx'

type PharmacyForm = {
  organization: Partial<RenderedCountryOrganization>
  country: string
}

export default function PharmacyForm(
  { organization, country }: PharmacyForm,
) {
  const selected_admins = useSignal<PharmacistOption[]>(
    organization.admins ?? [],
  )
  const addAdmin = () => {
    selected_admins.value = [
      ...selected_admins.value,
      {
        id: '',
        name: '',
        removed: false,
      },
    ]
  }
  const removeAdmin = (selectedIndex: number) => {
    selected_admins.value = selected_admins.value.map(
      (admin, index) => {
        if (index !== selectedIndex) return admin
        return {
          ...admin,
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
          value={organization.name}
        />
        <TextInput
          name='licensee'
          required
          type='text'
          label='licensee'
          value={organization.licensee}
        />
      </FormRow>
      <FormRow>
        <TextInput
          name='licence_number'
          required
          type='text'
          label='Licence Number'
          value={organization.licence_number}
          placeholder='P01-0805-2024'
          pattern='^[A-Z]{1}[0-9]{2}-[0-9]{4}-[0-9]{4}$'
        />
        <DateInput
          name='expiry_date'
          required
          label='Expiry Date'
          value={organization.expiry_date}
        />
      </FormRow>

      <FormRow>
        <PharmacyTypeSelect value={organization.pharmacies_types} />
      </FormRow>

      <FormRow>
        <TextInput
          name='town'
          required
          type='text'
          label='Town'
          value={organization.town}
        />
        <TextInput
          name='address'
          required
          type='text'
          label='Address'
          value={organization.address}
        />
      </FormRow>
      <hr className='my-2' />
      {selected_admins.value.map((selectedAdmin, index) =>
        !selectedAdmin.removed && (
          <RemoveRow
            onClick={() => removeAdmin(index)}
            key={index}
            labelled
          >
            <FormRow>
              <AddPharmacistSearch
                country={country}
                name={`admins.${index}`}
                label='Admin'
                value={selectedAdmin}
                required
                onSelect={(admin) => {
                  selected_admins.value[index] = {
                    ...selected_admins.value[index],
                    ...admin,
                  }
                }}
              />
            </FormRow>
          </RemoveRow>
        )
      )}
      <AddRow
        text='Add Admin'
        onClick={addAdmin}
      />
      <hr className='my-2' />
      <Buttons submitText='Submit' />
    </Form>
  )
}
