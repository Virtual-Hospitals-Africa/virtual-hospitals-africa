import { FreshContext } from '$fresh/server.ts'
import { assertOr400, assertOr404 } from './assertOr.ts'

export function getParam(
  ctx: FreshContext | URLSearchParams,
  param_name: string,
): string | null {
  const param = ctx instanceof URLSearchParams
    ? ctx.get(param_name)
    : ctx.params[param_name]
  return param || null
}

export function getRequiredParam(
  ctx: FreshContext | URLSearchParams,
  param_name: string,
): string {
  const param = getParam(ctx, param_name)
  assertOr404(param, `Missing required parameter: ${param_name}`)
  return param
}

const uuid_regex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

export function getRequiredUUIDParam(
  ctx: FreshContext | URLSearchParams,
  param_name: string,
): string {
  const param = getParam(ctx, param_name)
  assertOr404(param, `Missing required parameter: ${param_name}`)
  assertOr400(uuid_regex.test(param), 'id must be a uuid')
  return param
}
