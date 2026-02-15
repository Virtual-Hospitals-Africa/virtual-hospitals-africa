import { z } from 'zod'
import { Context } from 'fresh'
import OrganizationForm from '../../../../islands/regulator/OrganizationForm.tsx'
import redirect from '../../../../util/redirect.ts'
import { parseRequest } from '../../../../backend/parseForm.ts'
import { organizations } from '../../../../db/models/organizations.ts'
import { LoggedInRegulator } from '../../../../types.ts'
import { RegulatorHomePageLayout } from '../../../regulator/_middleware.tsx'

const UpsertOrganizationSchema = z.object({
  name: z.string(),
  address: z.string(),
  licence_number: z.string(),
  licensee: z.string(),
  organizations_types: z.enum([
    'Clinics: Class A',
    'Clinics: Class B',
    'Clinics: Class C',
    'Clinics: Class D',
    'Dispensing medical practice',
    'Hospital organizations',
    'Pharmacies: Research',
    'Pharmacies: Restricted',
    'Organization in any other location',
    'Organization in rural area',
    'Organization located in the CBD',
    'Wholesalers',
  ]),
  expiry_date: z.string(),
  town: z.string(),
})

export const handler = {
  async POST(ctx: Context<LoggedInRegulator>) {
    const req = ctx.req
    const { country } = ctx.params
    const { trx } = ctx.state
    const pharmacy = await parseRequest(
      req,
      UpsertOrganizationSchema.parse,
    )

    const { id } = await organizations.insert(trx, {
      ...pharmacy,
      country,
    })

    const success = encodeURIComponent(
      'New pharmacy added',
    )

    return redirect(
      `/regulator/${country}/organizations/${id}?success=${success}`,
    )
  },
}

export default RegulatorHomePageLayout(
  'Pharmacies',
  function Add(
    ctx: Context<LoggedInRegulator>,
  ) {
    return (
      <OrganizationForm
        form_data={{
          name: ctx.url.searchParams.get('name') || '',
          licence_number: ctx.url.searchParams.get('licence_number') || '',
        }}
        country={SERVER_COUNTRY}
      />
    )
  },
)
