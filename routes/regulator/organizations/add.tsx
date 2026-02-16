import { z } from 'zod'
import { Context } from 'fresh'
import OrganizationForm from '../../../islands/regulator/OrganizationForm.tsx'
import redirect from '../../../util/redirect.ts'
import { organizations } from '../../../db/models/organizations.ts'
import { LoggedInRegulator } from '../../../types.ts'
import { RegulatorHomePageLayout } from '../../regulator/_middleware.tsx'
import { SERVER_COUNTRY } from '../../../db/models/countries.ts'
import { postHandler } from '../../../backend/postHandler.ts'

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

export const handler = postHandler(
  UpsertOrganizationSchema,
  async (ctx: Context<LoggedInRegulator>, form_values) => {
    const { trx } = ctx.state

    const id = await organizations.insertOne(trx, {
      ...form_values,
      country: SERVER_COUNTRY,
    })

    const success = encodeURIComponent(
      'New pharmacy added',
    )

    return redirect(
      `/regulator/organizations/${id}?success=${success}`,
    )
  },
)

export default RegulatorHomePageLayout(
  'Pharmacies',
  function Add(
    ctx: Context<LoggedInRegulator>,
  ) {
    return (
      <OrganizationForm
        organization={{
          name: ctx.url.searchParams.get('name') || '',
          licence_number: ctx.url.searchParams.get('licence_number') || '',
        }}
        country={SERVER_COUNTRY}
      />
    )
  },
)
