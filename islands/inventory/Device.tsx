import { JSX } from 'preact'
import { useSignal } from '@preact/signals'
import { RenderedDevice } from '../../types.ts'
import Form from '../form/Form.tsx'
import FormRow from '../form/Row.tsx'
import DeviceSearch from './DeviceSearch.tsx'
import { Button } from '../../components/library/Button.tsx'
import { TextInput } from '../form/Inputs.tsx'

export default function FacilityDeviceForm({ device }: {
  device: RenderedDevice | null
}): JSX.Element {
  const selectedDevice = useSignal(device)
  return (
    <Form method='post'>
      <div className='flex flex-col w-full gap-2'>
        <FormRow>
          <DeviceSearch
            name='device'
            label='Device'
            required
            addable
            value={selectedDevice.value}
            onSelect={(device) => selectedDevice.value = device ?? null}
          />
        </FormRow>

        <FormRow>
          <TextInput
            name={`serial_number`}
            label='Serial'
            required
          />
          <div>
            <label>Manufacurer</label>
            <br />
            {selectedDevice.value?.manufacturer}
          </div>
          <div />
          <div>
            <label>Available Tests</label>
            <ul>
              {selectedDevice.value?.diagnostic_test_capabilities.map((
                c,
              ) => <li>{c}</li>)}
            </ul>
          </div>
        </FormRow>
        <FormRow>
          <Button type='submit'>
            Submit
          </Button>
        </FormRow>
      </div>
    </Form>
  )
}
