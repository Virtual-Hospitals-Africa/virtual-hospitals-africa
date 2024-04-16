import { assert } from 'std/assert/assert.ts'
import isObjectLike from '../../util/isObjectLike.ts';
import { isUUID } from '../../util/uuid.ts';
import { isISODateTimeString } from '../../util/date.ts'


// Make a ClientApplication in Medplum and use its client ID and secret here
const CLIENT_ID = "afd3756e-ff33-4411-a821-638d8ae29940"
const CLIENT_SECRET = "8f569f08cbacb3f0751aaf465472fa351aea554846c5e44fac76ebeaa6a09f82"

const auth = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)

export function request(method: string, path: string, data?: unknown) {
  const body = data ? JSON.stringify(data) : undefined;
  const headers = new Headers({ 'Authorization': `Basic ${auth}` })
  if (body) {
    headers.set('Content-Type', 'application/fhir+json')
  }
  return fetch(`http://localhost:8103/fhir/R4/${path}`, {
    method,
    headers,
    body,
  });

}

type CreatedResource<T> = {
  resourceType: T,
  id: string
  meta: {
    versionId: string
    lastUpdated: string
  }
}

function assertIsCreatedResource<T>(data: unknown): asserts data is CreatedResource<T> {
  assert(isObjectLike(data), 'Expected data to be an object');
  assert(isUUID(data.id), 'Expected .id to be a UUID');
  assert(isObjectLike(data.meta), 'Expected .meta to be an object');
  assert(isUUID(data.meta.versionId), 'Expected .meta.versionId to be a UUID');
  assert(isISODateTimeString(data.meta.lastUpdated), 'Expected .meta.lastUpdated to be a datetime string');
}

export async function createResource<T extends string>(resourceType: T, data?: Record<string, unknown>) {
  const response = await request('POST', resourceType, {
    resourceType,
    ...data
  });
  const json = await response.json();
  if (json.issue) {
    throw new Error(JSON.stringify(json.issue[0].details.text));
  }
  assertIsCreatedResource<T>(json);
  return json
}
