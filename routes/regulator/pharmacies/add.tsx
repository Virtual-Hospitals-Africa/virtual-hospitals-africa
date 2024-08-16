import { FreshContext } from '$fresh/server.ts'
import PharmacyForm from '../../../islands/form/PharmacyForm.tsx'
import { PageProps } from '$fresh/server.ts'
import redirect from '../../../util/redirect.ts'
import { parseRequestAsserts } from '../../../util/parseForm.ts'
import { assertOr400 } from '../../../util/assertOr.ts'
import isObjectLike from '../../../util/isObjectLike.ts'
import isString from '../../../util/isString.ts'
import * as pharmacy from '../../../db/models/pharmacies.ts'
import Layout from '../../../components/library/Layout.tsx'
import { LoggedInRegulator, RenderedPharmacy } from '../../../types.ts'

type InviteProps = {
  regulator: LoggedInRegulator['regulator']
}

export function assertIsUpsertPharmacy(
  obj: unknown,
): asserts obj is RenderedPharmacy {
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
  POST: async function (req: Request, ctx: FreshContext<LoggedInRegulator>) {
    const to_add = await parseRequestAsserts(
      ctx.state.trx,
      req,
      assertIsUpsertPharmacy,
    )

    await pharmacy.insert(ctx.state.trx, {
      licence_number: to_add.licence_number,
      licensee: to_add.licensee,
      name: to_add.name!,
      address: to_add.address,
      town: to_add.town,
      expiry_date: to_add.expiry_date,
      pharmacies_types: to_add.pharmacies_types,
      id: to_add.id,
      supervisors: to_add.supervisors,
      actions: to_add.actions,
    })

    const success = encodeURIComponent(
      `New pharmacy added`,
    )

    return redirect(
      `/regulator/pharmacies?success=${success}`,
    )
  },
  GET: function (
    _req: Request,
    ctx: FreshContext<LoggedInRegulator>,
  ) {
    return ctx.render({
      regulator: ctx.state.regulator,
    })
  },
}

export default function Add(
  props: PageProps<InviteProps>,
) {
  return (
    <Layout
      title='Pharmacies'
      route={props.route}
      url={props.url}
      regulator={props.data.regulator}
      params={{}}
      variant='regulator home page'
    >
      <PharmacyForm formData={{}} />
    </Layout>
  )
}
