import { PageProps } from '$fresh/server.ts'
import {
  Facility,
  HasId,
  LoggedInHealthWorkerHandlerWithProps,
} from '../../../../types.ts'
import * as facilities from '../../../../db/models/facilities.ts'
import Layout from '../../../../components/library/Layout.tsx'
import { Container } from '../../../../components/library/Container.tsx'
import FacilityDeviceForm from '../../../../islands/dispensary/inventory/Device.tsx'

type DispensaryPageProps = {
    facility: HasId<Facility>
}

export const handler: LoggedInHealthWorkerHandlerWithProps<
    DispensaryPageProps,
  { facility: HasId<Facility>; isAdminAtFacility: boolean }
> = {
   GET(_req, ctx) {
    const { healthWorker, facility, isAdminAtFacility } = ctx.state

    return ctx.render({
      facility,
    })
  },
}

export default function EmployeeTable(
  props: PageProps<DispensaryPageProps>,
) {
  return (
    <Layout
      title={`${props.data.facility.name} Dispensary`}
      route={props.route}
      url={props.url}
      variant='home page'
    >
      <Container size='lg'>
       <FacilityDeviceForm />
      </Container>
    </Layout>
  )
}
