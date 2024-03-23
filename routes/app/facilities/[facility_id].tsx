import Layout from '../../../components/library/Layout.tsx'
import { FacilityContext } from './[facility_id]/_middleware.ts'

// deno-lint-ignore require-await
export default async function FacilityPage(
  req: Request,
  ctx: FacilityContext,
) {
  const { facility } = ctx.state

  return (
    <Layout
      title={facility.name}
      route={ctx.route}
      url={ctx.url}
      health_worker={ctx.state.healthWorker}
      variant='home page'
    >
      TODO: facility page
    </Layout>
  )
}
