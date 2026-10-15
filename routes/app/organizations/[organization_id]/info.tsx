import { OrganizationLayout } from './_middleware.tsx'
import { organizations_with_departments } from '../../../../db/models/organizations_with_departments.ts'
import OrganizationOverview from '../../../../components/organizations/OrganizationOverview.tsx'

export default OrganizationLayout(
  async function OrganizationInfoPage(ctx) {
    const org_with_departments = await organizations_with_departments.getById(
      ctx.state.trx,
      ctx.state.organization.id,
    )

    return <OrganizationOverview organization={org_with_departments} />
  },
)
