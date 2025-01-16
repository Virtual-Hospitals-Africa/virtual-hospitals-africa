import { HealthWorkerHomePageLayout } from '../_middleware.tsx'
import { OrganizationContext } from './[organization_id]/_middleware.ts'

export default HealthWorkerHomePageLayout<OrganizationContext>(
  function OrganizationPage(
    _req: Request,
    ctx: OrganizationContext,
  ) {
    const { organization } = ctx.state
    return {
      title: organization.name,
      children: <>TODO: organization page</>,
    }
  },
)
