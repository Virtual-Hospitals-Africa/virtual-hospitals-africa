import { assert } from 'std/assert/assert.ts'

export function warning(message: string, route = '/') {
  assert(route.startsWith('/'), 'Route must start with /')
  if (route.includes('?')) {
    route += '&'
  } else {
    route += '?'
  }
  const uri_component = encodeURIComponent(message)
  return `${route}warning=${uri_component}`
}

export function error(message: string, route = '/') {
  assert(route.startsWith('/'), 'Route must start with /')
  if (route.includes('?')) {
    route += '&'
  } else {
    route += '?'
  }
  const uri_component = encodeURIComponent(message)
  return `${route}error=${uri_component}`
}

export function success(message: string, route = '/') {
  assert(route.startsWith('/'), 'Route must start with /')
  if (route.includes('?')) {
    route += '&'
  } else {
    route += '?'
  }
  const uri_component = encodeURIComponent(message)
  return `${route}success=${uri_component}`
}
