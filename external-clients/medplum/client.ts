import { assert } from 'std/assert/assert.ts'
import isObjectLike from '../../util/isObjectLike.ts';
import { isUUID } from '../../util/uuid.ts';
import { isISODateTimeString } from '../../util/date.ts'


// Make a ClientApplication in Medplum and use its client ID and secret here
const CLIENT_ID = "527a1a71-a2e3-47a1-a3a8-ed3e07275e9e"
const CLIENT_SECRET = "05b1809158621ec697809fbccccf378a2e53b4a383b9a5704d6e1d85562a1fa8"

const auth = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)

export function request(method: string, path: string, data?: unknown) {
  const body = data ? JSON.stringify(data) : undefined;
  const headers: any = {
    'Authorization': `Basic ${auth}`,
  }
  if (body) {
    headers['Content-Type'] = 'application/fhir+json'
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
