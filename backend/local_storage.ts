import { AsyncLocalStorage } from 'node:async_hooks'

export const __local_storage__ = new AsyncLocalStorage<{
  sidebar_collapsed?: boolean
  traceparent: string
}>()

Object.assign(Deno, { __local_storage__ })
