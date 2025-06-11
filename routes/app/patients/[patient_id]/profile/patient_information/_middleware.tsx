import { FreshContext } from '$fresh/server.ts'
import redirect from '../../../../../../util/redirect.ts'
import { replaceParams } from '../../../../../../util/replaceParams.ts'

export function handler(
  _req: Request,
  ctx: FreshContext,
) {
  console.log('in here', ctx)
  if (ctx.route.endsWith('/patient_information')) {
    return redirect(replaceParams(
      '/app/patients/:patient_id/profile/patient_information/general',
      ctx.params,
    ))
  }
  return ctx.next()
}
