import { assert } from 'std/assert/assert.ts'
import { FreshContext } from '$fresh/server.ts'
import Layout from '../../../../components/library/Layout.tsx'
import { LoggedInRegulator, RenderedPharmacist } from '../../../../types.ts'
import PharmacistForm from '../../../../islands/form/PharmacistForm.tsx'
import { PageProps } from '$fresh/server.ts'
import redirect from '../../../../util/redirect.ts'
import { parseRequestAsserts } from '../../../../util/parseForm.ts'
import { assertOr400 } from '../../../../util/assertOr.ts'
import isObjectLike from '../../../../util/isObjectLike.ts'
import isString from '../../../../util/isString.ts'
import * as pharmacists from '../../../../db/models/pharmacists.ts'
import { getRequiredUUIDParam } from '../../../../util/getParam.ts'
import { stringifyJustDate } from '../../../../util/date.ts'

type EditPharmacistProps = {
  regulator: LoggedInRegulator['regulator']
  pharmacistData: RenderedPharmacist
}

export function assertIsUpdatePharmacist(
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
    const pharmacist_id = getRequiredUUIDParam(ctx, 'pharmacist_id')
    const to_update = await parseRequestAsserts(
      ctx.state.trx,
      req,
      assertIsUpdatePharmacist,
    )
    const existingPharmacist = await pharmacists.getById(
      ctx.state.trx,
      pharmacist_id,
    )
    assert(existingPharmacist)

    await pharmacists.update(ctx.state.trx, pharmacist_id, {
      licence_number: to_update.licence_number,
      prefix: to_update.prefix,
      given_name: to_update.given_name,
      family_name: to_update.family_name,
      address: to_update.address,
      town: to_update.town,
      expiry_date: to_update.expiry_date,
      pharmacist_type: to_update.pharmacist_type,
    })

    const success = encodeURIComponent(
      `Pharmacist updated`,
    )

    return redirect(
      `/regulator/pharmacists?success=${success}`,
    )
  },
  GET: async function (
    _req: Request,
    ctx: FreshContext<LoggedInRegulator>,
  ) {
    const pharmacist_id = getRequiredUUIDParam(ctx, 'pharmacist_id')

    const pharmacistData = await pharmacists.getById(
      ctx.state.trx,
      pharmacist_id,
    )
    if (!pharmacistData) return redirect('/regulator/pharmacists')

    return ctx.render({
      regulator: ctx.state.regulator,
      pharmacistData: {
        ...pharmacistData,
        expiry_date: stringifyJustDate(pharmacistData.expiry_date),
      },
    })
  },
}

export default function Invite(
  props: PageProps<EditPharmacistProps>,
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
      <PharmacistForm formData={props.data.pharmacistData} />
    </Layout>
  )
}
