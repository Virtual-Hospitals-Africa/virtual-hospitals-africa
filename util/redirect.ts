import { assert } from 'std/assert/assert.ts'
import isString from './isString.ts'

function redirectTo(location: string | URL): string {
  if (location instanceof URL) {
    return location.toString()
  }
  assert(isString(location))
  return location
}

export default function redirect(
  location: string | URL,
  status = 302,
): Response {
  return new Response('Found', {
    status,
    headers: {
      Location: redirectTo(location),
    },
  })
}
