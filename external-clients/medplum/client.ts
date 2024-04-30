import { assert } from 'std/assert/assert.ts'
import isObjectLike from '../../util/isObjectLike.ts';
import { isUUID } from '../../util/uuid.ts';
import { isISODateTimeString } from '../../util/date.ts'
import memoize from '../../util/memoize.ts'


// Make a ClientApplication in Medplum and use its client ID and secret here
const MEDPLUM_CLIENT_ID = Deno.env.get('MEDPLUM_CLIENT_ID')
const MEDPLUM_CLIENT_SECRET = Deno.env.get('MEDPLUM_CLIENT_SECRET')

const auth = memoize(() => {
  assert(MEDPLUM_CLIENT_ID, 'Must set MEDPLUM_CLIENT_ID env var')
  assert(MEDPLUM_CLIENT_SECRET, 'Must set MEDPLUM_CLIENT_SECRET env var')
  return btoa(`${MEDPLUM_CLIENT_ID}:${MEDPLUM_CLIENT_SECRET}`)
})

export function request(method: string, path: string, data?: unknown) {
  const body = data ? JSON.stringify(data) : undefined;
  const headers = new Headers({ 'Authorization': `Basic ${auth()}` })
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
