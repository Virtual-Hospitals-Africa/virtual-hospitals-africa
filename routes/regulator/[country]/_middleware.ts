import { LoggedInRegulatorContext } from '../../../types.ts'
import { getRequiredParam } from '../../../util/getParam.ts'
import redirect from '../../../util/redirect.ts'
import { replaceParams } from '../../../util/replaceParams.ts'

export const handler = function ensureAccessingCountryYouAreRegulatorIn(
  _req: Request,
  ctx: LoggedInRegulatorContext,
) {
  const country = getRequiredParam(ctx, 'country')
  if (ctx.state.regulator.country !== country) {
    return redirect(replaceParams(ctx.route, {
      country: ctx.state.regulator.country,
    }))
  }
  return ctx.next()
}
