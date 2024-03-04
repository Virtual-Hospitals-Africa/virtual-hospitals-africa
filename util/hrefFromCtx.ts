import { FreshContext } from '$fresh/server.ts'

export default function hrefFromCtx(
  ctx: FreshContext,
  callback: (url: URL) => void,
) {
  const url = new URL(ctx.url)
  callback(url)
  return `${url.pathname}${url.search}${url.hash}` || '/'
}
