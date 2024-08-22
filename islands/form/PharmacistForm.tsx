import { useSignal } from '@preact/signals'
import {
  DateInput,
  PharmacistTypeSelect,
  PrefixSelect,
  TextInput,
} from './Inputs.tsx'
import FormRow from './Row.tsx'
import Buttons from './buttons.tsx'
import { RenderedPharmacist, RenderedPharmacy } from '../../types.ts'
import Form from '../../components/library/Form.tsx'
import { IsSupervisorSelect } from '../../islands/form/Inputs.tsx'
import AddPharmacySearch from '../AddPharmacySearch.tsx'

type PharmacistForm = {
  formData: Partial<RenderedPharmacist> & { is_supervisor?: boolean }
}

export default function PharmacistForm(
  { formData }: PharmacistForm,
) {
  const selectedPharmacy = useSignal<RenderedPharmacy | undefined>(
    formData.pharmacy,
  )
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
      <FormRow>
        <AddPharmacySearch
          name='pharmacy'
          label='Pharmacy'
          value={selectedPharmacy.value}
          onSelect={(pharmacy) => selectedPharmacy.value = pharmacy}
        />
        <IsSupervisorSelect
          value={formData.is_supervisor?.toString()}
          isRequired={selectedPharmacy.value !== undefined}
        />
      </FormRow>
      <hr className='my-2' />
      <Buttons submitText='Next' />
    </Form>
  )
}
