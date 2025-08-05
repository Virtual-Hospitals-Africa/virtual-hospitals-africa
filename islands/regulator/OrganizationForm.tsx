import { TextInput } from '../form/Inputs.tsx'
import FormRow from '../../components/library/FormRow.tsx'
import Buttons from '../form/buttons.tsx'
import Form from '../../components/library/Form.tsx'

type Department = {
  id?: string
  name: string
  accepts_patients: boolean
  removed?: boolean
}

type OrganizationFormData = {
  name: string
  category: string
  departments: Department[]
}

type OrganizationFormProps = {
  form_data: Partial<OrganizationFormData>
  country: string
}

export default function OrganizationForm(
  { form_data, country }: OrganizationFormProps,
) {
  return (
    <Form method='POST'>
      <FormRow>
        <TextInput
          name='name'
          required
          type='text'
          label='Organization Name'
          value={form_data.name}
        />
        <TextInput
          name='category'
          type='text'
          label='Category'
          value={form_data.category}
          placeholder='e.g., Hospital, Clinic, Community Health Center'
        />
      </FormRow>

      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-medium text-gray-900'>Departments</h3>
        </div>
      </div>

      <Buttons />
    </Form>
  )
}
