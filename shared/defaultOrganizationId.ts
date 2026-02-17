import { RenderedHealthWorker } from '../types.ts'
import { assertArrayNonEmpty } from '../util/arraySize.ts'
import first from '../util/first.ts'

export function defaultOrganizationId(
  employed_health_worker: RenderedHealthWorker,
): string {
  assertArrayNonEmpty(employed_health_worker.organizations)
  return first(employed_health_worker.organizations).id
}
