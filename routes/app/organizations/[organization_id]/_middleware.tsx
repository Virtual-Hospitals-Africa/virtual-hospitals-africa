import type { JSX } from 'preact'
import { OrganizationContext, OrganizationState, RenderedEmployee } from '../../../../types.ts'
import { organizations } from '../../../../db/models/organizations.ts'
import { assertOr403 } from '../../../../util/assertOr.ts'
import { timeMiddlewareCallNext } from '../../../../backend/timeMiddleware.ts'
import redirect from '../../../../util/redirect.ts'
import OrganizationTabs from '../../../../components/organizations/OrganizationTabs.tsx'
import { HealthWorkerHomePage } from '../../_middleware.tsx'

export const handler = timeMiddlewareCallNext(async function attachOrganization(
  ctx: OrganizationContext,
) {
  const { health_worker } = ctx.state
  const { organization_id } = ctx.params

  const organization_employment = health_worker.organizations.find((o) => o.id === organization_id)

  assertOr403(
    organization_employment,
    'Must be employed at this organization to access it',
  )

  const organization = await organizations.getById(
    ctx.state.trx,
    organization_id,
  )

  const organization_pathname = `/app/organizations/${organization_id}`

  if (ctx.url.pathname.replace(/\/+$/, '') === organization_pathname) {
    return redirect(`${organization_pathname}/info`)
  }

  const employee: RenderedEmployee = {
    ...health_worker,
    organization_id: organization.id,
    seniority_order: organization_employment.seniority_order,
    employee_id: organization_employment.employment_id,
    role: organization_employment.role,
    is_admin: organization_employment.is_admin,
    href: `${organization_pathname}/employees/${health_worker.id}`,
  }

  const organization_state: OrganizationState = {
    organization,
    organization_pathname,
    organization_employment,
    employee,
    is_admin_at_organization: organization_employment.is_admin,
    organization_id: organization.id,
    employment_id: employee.employee_id,
  }

  Object.assign(ctx.state, organization_state)
})

/**
 * Wraps a page of the organization with the organization's name as the title
 * and the organization tabs.
 */
export const OrganizationLayout = <
  // deno-lint-ignore no-explicit-any
  Context extends OrganizationContext<any> = OrganizationContext,
>(
  render: (ctx: Context) => JSX.Element | Promise<JSX.Element>,
) =>
  HealthWorkerHomePage<Context>(
    async function OrganizationLayoutPage(ctx) {
      const { organization } = ctx.state
      const rendered = await render(ctx)
      return {
        title: organization.name,
        children: (
          <>
            <OrganizationTabs
              organization_id={organization.id}
              pathname={ctx.url.pathname}
            />
            {rendered}
          </>
        ),
      }
    },
  )
