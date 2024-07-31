import { FreshContext } from '$fresh/server.ts'
import PharmacistForm from '../../../islands/form/PharmacistForm.tsx'
import { PageProps } from '$fresh/server.ts'
import redirect from '../../../util/redirect.ts'
import { parseRequestAsserts } from '../../../util/parseForm.ts'
import { assertOr400 } from '../../../util/assertOr.ts'
import isObjectLike from '../../../util/isObjectLike.ts'
import isString from '../../../util/isString.ts'
import * as pharmacists from '../../../db/models/pharmacists.ts'
import Layout from '../../../components/library/Layout.tsx'
import { LoggedInRegulator, RenderedPharmacist } from '../../../types.ts'

type InviteProps = {
  regulator: LoggedInRegulator['regulator']
}

export function assertIsUpsertPharmacist(
  obj: unknown,
): asserts obj is RenderedPharmacist {
  assertOr400(isObjectLike(obj))
  assertOr400(
    isString(obj.licence_number),
  )
  assertOr400(
    isString(obj.prefix),
  )
  assertOr400(
    isString(obj.given_name),
  )
  assertOr400(
    isString(obj.family_name),
  )
  assertOr400(
    isString(obj.address),
  )
  assertOr400(
    isString(obj.town),
  )
  assertOr400(
    isString(obj.expiry_date),
  )
  assertOr400(
    isString(obj.pharmacist_type),
  )
}

export const handler = {
  POST: async function (req: Request, ctx: FreshContext<LoggedInRegulator>) {
    const to_add = await parseRequestAsserts(
      ctx.state.trx,
      req,
      assertIsUpsertPharmacist,
    )

    await pharmacists.insert(ctx.state.trx, {
      licence_number: to_add.licence_number,
      prefix: to_add.prefix,
      given_name: to_add.given_name,
      family_name: to_add.family_name,
      address: to_add.address,
      town: to_add.town,
      expiry_date: to_add.expiry_date,
      pharmacist_type: to_add.pharmacist_type,
    })

    const success = encodeURIComponent(
      `New pharmacist added`,
    )

    return redirect(
      `/regulator/pharmacists?success=${success}`,
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

export default function Invite(
  props: PageProps<InviteProps>,
) {
  return (
    <Layout
      title='Pharmacists'
      route={props.route}
      url={props.url}
      regulator={props.data.regulator}
      params={{}}
      variant='regulator home page'
    >
      <PharmacistForm formData={{}} />
    </Layout>
  )
}
