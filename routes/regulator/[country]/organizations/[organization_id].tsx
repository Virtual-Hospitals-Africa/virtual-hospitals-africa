import { FreshContext } from '$fresh/server.ts'
import { LoggedInRegulator } from '../../../../types.ts'
import * as organizations from '../../../../db/models/organizations.ts'
import { RegulatorHomePageLayout } from '../../_middleware.tsx'
import { OrganizationDetailedCard } from '../../../../components/regulator/OrganizationDetailedCard.tsx'
import { assertOr404 } from '../../../../util/assertOr.ts'

export default RegulatorHomePageLayout(
  async function OrganizationDetailPage(
    _req: Request,
    ctx: FreshContext<LoggedInRegulator>,
  ) {
    const { country, organization_id } = ctx.params
    const organization = await organizations.getById(
      ctx.state.trx,
      organization_id,
    )

    assertOr404(organization, 'Organization not found')
    assertOr404(organization.country === country, 'Organization not found')

    return {
      title: organization.name,
      children: (
        <OrganizationDetailedCard
          organization={organization}
          country={country}
        />
      ),
    }
  },
)
