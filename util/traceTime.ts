import { __local_storage__ } from '../backend/local_storage.ts'
import { exists } from './exists.ts'

export async function traceTime<T>(message: string, promise: Promise<T>): Promise<T> {
  const store = exists(__local_storage__.getStore())
  console.log(`${store.traceparent} ${message} start ${new Date()}`)
  console.time(`${store.traceparent} ${message}`)
  const result = await promise
  console.timeEnd(`${store.traceparent} ${message}`)
  console.log(`${store.traceparent} ${message} end ${new Date()}`)
  return result
}
