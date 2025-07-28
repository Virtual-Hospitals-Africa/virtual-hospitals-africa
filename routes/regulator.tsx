import { Handlers } from '$fresh/server.ts'
import { LoggedInRegulatorContext } from '../types.ts'
import redirect from '../util/redirect.ts'

export const handler: Handlers<unknown, LoggedInRegulatorContext['state']> = {
  GET: (_req, ctx) =>
    redirect(`/regulator/${ctx.state.regulator.country}/pharmacies`),
}
