import { Context } from 'fresh'
import redirect from '../../../../util/redirect.ts'

export const handler = {
  // deno-lint-ignore no-explicit-any
  GET(ctx: Context<any>) {
    return redirect(ctx.url.pathname + '/personal')
  },
}
