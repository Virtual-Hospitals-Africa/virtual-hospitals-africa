import { z } from 'zod'
import { FreshContext } from '$fresh/server.ts'
import OrganizationForm from '../../../../islands/regulator/OrganizationForm.tsx'
import redirect from '../../../../util/redirect.ts'
import { parseRequest } from '../../../../util/parseForm.ts'
import * as organizations from '../../../../db/models/organizations.ts'
import { LoggedInRegulator } from '../../../../types.ts'
import { RegulatorHomePageLayout } from '../../../regulator/_middleware.tsx'

const UpsertOrganizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  category: z.string().optional(),
  address_id: z.string().optional(),
  departments: z.array(z.object({
    name: z.string().min(1, 'Department name is required'),
    accepts_patients: z.boolean().default(false),
  })).default([]),
})

export const handler = {
  async POST(req: Request, ctx: FreshContext<LoggedInRegulator>) {
    const { country } = ctx.params
    const { trx } = ctx.state
    const organizationData = await parseRequest(
      trx,
      req,
      UpsertOrganizationSchema.parse,
    )

    const { id } = await organizations.add(trx, {
      ...organizationData,
      country,
    })

    const success = encodeURIComponent(
      'New organization added',
    )

    return redirect(
      `/regulator/${country}/organizations/${id}?success=${success}`,
    )
  },
}

export default RegulatorHomePageLayout(
  'Add Organization',
  function Add(
    _req: Request,
    ctx: FreshContext<LoggedInRegulator>,
  ) {
    return (
      <OrganizationForm
        form_data={{
          name: ctx.url.searchParams.get('name') || '',
          category: ctx.url.searchParams.get('category') || '',
          departments: [],
        }}
        country={ctx.params.country}
      />
    )
  },
)
