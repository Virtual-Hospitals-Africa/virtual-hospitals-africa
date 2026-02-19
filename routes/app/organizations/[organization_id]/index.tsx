import { HealthWorkerHomePage } from '../../_middleware.tsx'
import { OrganizationContext } from './_middleware.ts'

export default HealthWorkerHomePage<OrganizationContext>(
  function OrganizationPage(
    ctx: OrganizationContext,
  ) {
    const { organization } = ctx.state
    return {
      title: organization.name,
      children: <>TODO: organization page</>,
    }
  },
)
