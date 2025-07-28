import { z } from 'zod'
import { FreshContext } from '$fresh/server.ts'
import PharmacyForm from '../../../../islands/regulator/PharmacyForm.tsx'
import redirect from '../../../../util/redirect.ts'
import { parseRequest } from '../../../../util/parseForm.ts'
import * as pharmacies from '../../../../db/models/pharmacies.ts'
import { LoggedInRegulator } from '../../../../types.ts'
import { RegulatorHomePageLayout } from '../../../regulator/_middleware.tsx'

const UpsertPharmacySchema = z.object({
  name: z.string(),
  address: z.string(),
  licence_number: z.string(),
  licensee: z.string(),
  pharmacies_types: z.enum([
    'Clinics: Class A',
    'Clinics: Class B',
    'Clinics: Class C',
    'Clinics: Class D',
    'Dispensing medical practice',
    'Hospital pharmacies',
    'Pharmacies: Research',
    'Pharmacies: Restricted',
    'Pharmacy in any other location',
    'Pharmacy in rural area',
    'Pharmacy located in the CBD',
    'Wholesalers',
  ]),
  expiry_date: z.string(),
  town: z.string(),
})

export const handler = {
  async POST(req: Request, ctx: FreshContext<LoggedInRegulator>) {
    const { country } = ctx.params
    const { trx } = ctx.state
    const pharmacy = await parseRequest(
      trx,
      req,
      UpsertPharmacySchema.parse,
    )

    const { id } = await pharmacies.insert(trx, {
      ...pharmacy,
      country,
    })

    const success = encodeURIComponent(
      'New pharmacy added',
    )

    return redirect(
      `/regulator/${country}/pharmacies/${id}?success=${success}`,
    )
  },
}

export default RegulatorHomePageLayout(
  'Pharmacies',
  function Add(
    _req: Request,
    ctx: FreshContext<LoggedInRegulator>,
  ) {
    return (
      <PharmacyForm
        form_data={{
          name: ctx.url.searchParams.get('name') || '',
          licence_number: ctx.url.searchParams.get('licence_number') || '',
        }}
        country={ctx.params.country}
      />
    )
  },
)
