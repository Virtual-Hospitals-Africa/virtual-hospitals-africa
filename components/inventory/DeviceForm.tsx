import { JSX } from 'preact'
import { RenderedDevice } from '../../types.ts'
import Form from '../library/Form.tsx'
import FormRow from '../library/FormRow.tsx'
import DeviceSearch from '../../islands/inventory/DeviceSearch.tsx'
import { Button } from '../library/Button.tsx'
import { TextInput } from '../../islands/form/Inputs.tsx'

export default function OrganizationDeviceForm({ device }: {
  device: RenderedDevice | null
}): JSX.Element {
  return (
    <Form method='POST'>
      <FormRow>
        <DeviceSearch
          name='device'
          label='Device'
          required
          addable
          value={device}
        />
      </FormRow>
      <FormRow>
        <TextInput
          name='serial_number'
          label='Serial Number'
          required
        />
      </FormRow>
      <FormRow>
        <Button type='submit'>
          Submit
        </Button>
      </FormRow>
    </Form>
  )
}
