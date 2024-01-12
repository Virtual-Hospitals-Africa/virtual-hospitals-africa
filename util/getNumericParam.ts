import { FreshContext } from '$fresh/server.ts'
import { assertOr404 } from './assertOr.ts'

export function getNumericParam(
  ctx: FreshContext | URLSearchParams,
  param_name: string,
): number | null {
  const param_raw = ctx instanceof URLSearchParams
    ? ctx.get(param_name)
    : ctx.params[param_name]
  const param = parseInt(param_raw!)
  return param || null
}

export function getRequiredNumericParam(
  ctx: FreshContext | URLSearchParams,
  param_name: string,
): number {
  const param = getNumericParam(ctx, param_name)
  assertOr404(param)
  return param
}
