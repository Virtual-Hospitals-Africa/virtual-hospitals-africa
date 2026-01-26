import { path } from './path.ts'

export default function redirect(
  location: string | URL,
  search_params?: Record<string, unknown> | URLSearchParams,
): Response {
  return new Response('Found', {
    status: 302,
    headers: {
      Location: path(location, search_params),
    },
  })
}
