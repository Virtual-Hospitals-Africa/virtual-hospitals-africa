import { LoggedInRegulatorContext } from '../../types.ts'
import redirect from '../../util/redirect.ts'
import { Handlers } from 'fresh/compat'

export const handler: Handlers<unknown, LoggedInRegulatorContext['state']> = {
  GET: (ctx) =>
    redirect(`/regulator/${ctx.state.regulator.country}/pharmacies`),
}
