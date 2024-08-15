import {
    DateInput,
    PharmacyTypeSelect,
    PrefixSelect,
    TextInput,
  } from './Inputs.tsx'
  import FormRow from './Row.tsx'
  import Buttons from './buttons.tsx'
  import { RenderedPharmacy} from '../../types.ts'
  import Form from '../../components/library/Form.tsx'
  
  type PharmacyForm = {
    formData: Partial<RenderedPharmacy>
  }
  
  export default function PharmacistForm(
    { formData }: PharmacyForm,
  ) {
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
          <PharmacyTypeSelect value={formData.premises_types} />
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
        <Buttons submitText='Next' />
      </Form>
    )
  }
  