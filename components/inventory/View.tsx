import { FacilityDeviceTable } from '../../types.ts'
import { Button } from '../library/Button.tsx'
import { Container } from '../library/Container.tsx'
import FormRow from '../library/form/Row.tsx'
import FacilityDevicesTable from './Table.tsx'

export default function inventoryView(
  { devices,  facility_id }: {
    devices: FacilityDeviceTable[]
    facility_id: number
  },
) {
  const add_href = `/app/facilities/${facility_id}/inventory/add_device`
  return (
    <Container size='lg'>
      <FormRow>
        <div class='mb-2'>
          <Button
            type='button'
            href={add_href}
            className='w-max rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2 self-end whitespace-nowrap grid place-items-center'
          >
            Add Device
          </Button>
        </div>
      </FormRow>

      <FacilityDevicesTable
        devices={devices}
      />
    </Container>
  )
}
