import { Context } from 'fresh'

export default function hrefFromCtx(
  ctx: Context<unknown>,
  callback: (url: URL) => void,
) {
  const url = new URL(ctx.url)
  callback(url)
  return `${url.pathname}${url.search}${url.hash}` || '/'
}
