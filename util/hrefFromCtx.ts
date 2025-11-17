import { Context } from 'fresh'

export default function hrefFromCtx(
  // deno-lint-ignore no-explicit-any
  ctx: Context<any>,
  callback: (url: URL) => void,
) {
  const url = new URL(ctx.url)
  callback(url)
  return `${url.pathname}${url.search}${url.hash}` || '/'
}
