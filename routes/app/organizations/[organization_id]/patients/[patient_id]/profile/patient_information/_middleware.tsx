import { Context } from 'fresh'
import redirect from '../../../../../../../../util/redirect.ts'
import { replaceParams } from '../../../../../../../../util/replaceParams.ts'

export function handler(
  ctx: Context<unknown>,
) {
  if (ctx.route!.endsWith('/patient_information')) {
    return redirect(replaceParams(
      '/app/patients/:patient_id/profile/patient_information/general',
      ctx.params,
    ))
  }
  return ctx.next()
}
