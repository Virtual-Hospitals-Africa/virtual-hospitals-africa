import { HealthWorkerHomePage } from '../../_middleware.tsx'
import type { OrganizationContext } from '../../../../types.ts'
import { organizations_with_departments } from '../../../../db/models/organizations_with_departments.ts'
import OrganizationTabs from '../../../../components/organizations/OrganizationTabs.tsx'
import OrganizationOverview from '../../../../components/organizations/OrganizationOverview.tsx'

export default HealthWorkerHomePage<OrganizationContext>(
  async function OrganizationPage(ctx) {
    const { organization } = ctx.state

    const org_with_departments = await organizations_with_departments.getById(
      ctx.state.trx,
      organization.id,
    )

    return {
      title: organization.name,
      children: (
        <>
          <OrganizationTabs organization_id={organization.id} active_tab='overview' />
          <OrganizationOverview organization={org_with_departments} />
        </>
      ),
    }
  },
)
