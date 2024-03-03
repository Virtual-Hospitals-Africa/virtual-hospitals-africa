import { JSX } from 'preact'
import { RenderedDevice } from '../../types.ts'
import SectionHeader from '../../components/library/typography/SectionHeader.tsx'
import Form from '../../components/library/form/Form.tsx'
import FormRow from '../../components/library/form/Row.tsx'
import DeviceSearch from './DeviceSearch.tsx'
import { useSignal } from '@preact/signals'
import { Button } from '../../components/library/Button.tsx'
import { TextInput } from '../../components/library/form/Inputs.tsx'

export default function FacilityDeviceForm(): JSX.Element {
  const selectedDevice = useSignal<RenderedDevice | undefined>(undefined)
  return (
    <div>
      <SectionHeader className='my-5 text-[20px]'>
        Add Device
      </SectionHeader>
      <div>
        <Form method='post'>
          <div className='flex flex-col w-full gap-2'>
            <FormRow>
              <DeviceSearch
                name='device'
                label='Device'
                required
                addable
                value={null}
                onSelect={(device) => {
                  selectedDevice.value = device
                }}
              />

              <TextInput
                name={`serial_number`}
                label='Serial'
                required
              />
            </FormRow>

            {selectedDevice.value && (
              <FormRow>
                <div>
                  <label>Manufacurer</label>
                  <br />
                  {selectedDevice.value?.manufacturer}
                </div>
                <div>
                  <label>Available Tests</label>
                  <ul>
                    {selectedDevice.value?.diagnostic_test_capabilities.map((
                      c,
                    ) => <li>{c}</li>)}
                  </ul>
                </div>
              </FormRow>
            )}
            <FormRow>
              <Button type='submit'>
                Submit
              </Button>
            </FormRow>
          </div>
        </Form>
      </div>
    </div>
  )
}
