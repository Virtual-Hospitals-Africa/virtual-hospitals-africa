import Layout from '../../../components/library/Layout.tsx'
import { FacilityContext } from './[organization_id]/_middleware.ts'

// deno-lint-ignore require-await
export default async function FacilityPage(
  req: Request,
  ctx: FacilityContext,
) {
  const { organization } = ctx.state

  return (
    <Layout
      title={organization.name}
      route={ctx.route}
      url={ctx.url}
      health_worker={ctx.state.healthWorker}
      variant='home page'
    >
      TODO: organization page
    </Layout>
  )
}
