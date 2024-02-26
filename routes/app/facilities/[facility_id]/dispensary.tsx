import { FreshContext, PageProps } from '$fresh/server.ts'
import {
  Facility,
  HasId,
  LoggedInHealthWorker,
  LoggedInHealthWorkerHandlerWithProps,
} from '../../../../types.ts'
import * as facility_rooms from '../../../../db/models/facility_rooms.ts'
import Layout from '../../../../components/library/Layout.tsx'
import { assertOr404 } from '../../../../util/assertOr.ts'
import DispensaryView from '../../../../components/dispensary/View.tsx'

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

export default async function DispensaryPage(
  _req: Request,
  ctx: FreshContext<LoggedInHealthWorker>,
) {
  const facility_id = parseInt(ctx.params.facility_id)
  assertOr404(facility_id)

  const facility_devices= await facility_rooms.getFacilityDevices(  
    ctx.state.trx,
    { facility_id: facility_id },)

  const available_tests = await facility_rooms.getAvailableTestsInFacility( ctx.state.trx,
    { facility_id: facility_id });

  return (
    <Layout
      title='Dispensary'
      route={ctx.route}
      url={ctx.url}
      avatarUrl={ctx.state.healthWorker.avatar_url}
      variant='home page'
    >
      <DispensaryView
        facility_id={facility_id}
        available_tests={available_tests}
        devices={facility_devices}
      />
    </Layout>
  )
}