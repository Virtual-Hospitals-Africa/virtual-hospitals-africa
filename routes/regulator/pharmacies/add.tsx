import { FreshContext } from '$fresh/server.ts'
import PharmacyForm from '../../../islands/form/PharmacyForm.tsx'
import redirect from '../../../util/redirect.ts'
import { parseRequestAsserts } from '../../../util/parseForm.ts'
import { assertOr400 } from '../../../util/assertOr.ts'
import isObjectLike from '../../../util/isObjectLike.ts'
import isString from '../../../util/isString.ts'
import * as pharmacies from '../../../db/models/pharmacies.ts'
import Layout from '../../../components/library/Layout.tsx'
import { LoggedInRegulator } from '../../../types.ts'
import { PharmaciesTypes } from '../../../db.d.ts'

type InviteProps = {
  regulator: LoggedInRegulator['regulator']
}

export function assertIsUpsertPharmacy(
  obj: unknown,
): asserts obj is {
  name: string
  address: string
  licence_number: string
  licensee: string
  pharmacies_types: PharmaciesTypes
  expiry_date: string
  town: string
} {
  assertOr400(isObjectLike(obj))
  assertOr400(
    isString(obj.name),
  )
  assertOr400(
    isString(obj.address),
  )
  assertOr400(
    isString(obj.licence_number),
  )
  assertOr400(
    isString(obj.licensee),
  )
  assertOr400(
    isString(obj.pharmacies_types),
  )
  assertOr400(
    isString(obj.expiry_date),
  )
  assertOr400(
    isString(obj.town),
  )
}

export const handler = {
  async POST(req: Request, ctx: FreshContext<LoggedInRegulator>) {
    const { trx } = ctx.state
    const pharmacy = await parseRequestAsserts(
      trx,
      req,
      assertIsUpsertPharmacy,
    )

    const { id } = await pharmacies.insert(trx, pharmacy)

    const success = encodeURIComponent(
      'New pharmacy added',
    )

    return redirect(
      `/regulator/pharmacies?success=${success}&show_pharmacy_id=${id}`,
    )
  },
}

// deno-lint-ignore require-await
export default async function Add(
  _req: Request,
  ctx: FreshContext<LoggedInRegulator>,
) {
  return (
    <Layout
      title='Pharmacies'
      route={ctx.route}
      url={ctx.url}
      regulator={ctx.state.regulator}
      params={{}}
      variant='regulator home page'
    >
      <PharmacyForm formData={{}} />
    </Layout>
  )
}
