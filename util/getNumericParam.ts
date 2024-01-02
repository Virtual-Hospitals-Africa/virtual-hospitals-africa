import { FreshContext } from '$fresh/server.ts'
import { assertOr404 } from './assertOr.ts'

export default function getNumericParam(
  ctx: FreshContext,
  param_name: string,
): number {
  const param = parseInt(ctx.params[param_name])
  assertOr404(param)
  return param
}
