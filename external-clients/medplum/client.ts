import { assert } from 'std/assert/assert.ts'
import isObjectLike from '../../util/isObjectLike.ts';
import { isUUID } from '../../util/uuid.ts';
import { isISODateTimeString } from '../../util/date.ts'
import memoize from '../../util/memoize.ts'


// Make a ClientApplication in Medplum and use its client ID and secret here
const MEDPLUM_CLIENT_ID = Deno.env.get('MEDPLUM_CLIENT_ID')
const MEDPLUM_CLIENT_SECRET = Deno.env.get('MEDPLUM_CLIENT_SECRET')
const MEDPLUM_SERVER_URL = Deno.env.get('MEDPLUM_SERVER_URL') || 'http://localhost:8103'

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
  return fetch(`${MEDPLUM_SERVER_URL}/fhir/R4/${path}`, {
    method,
    headers,
    body,
  });

}

type CreatedResource<T, Data extends Record<string, unknown>> = Data & {
  resourceType: T,
  id: string
  meta: {
    versionId: string
    lastUpdated: string
  }
}

function assertIsResource<T, Data extends Record<string, unknown>>(data: unknown): asserts data is CreatedResource<T, Data> {
  assert(isObjectLike(data), 'Expected data to be an object');
  assert(isUUID(data.id), 'Expected .id to be a UUID');
  assert(isObjectLike(data.meta), 'Expected .meta to be an object');
  assert(isUUID(data.meta.versionId), 'Expected .meta.versionId to be a UUID');
  assert(isISODateTimeString(data.meta.lastUpdated), 'Expected .meta.lastUpdated to be a datetime string');
}

export async function createResource<T extends string, Data extends Record<string, unknown>>(resourceType: T, data?: Data) {
  const response = await request('POST', resourceType, {
    resourceType,
    ...data
  });
  const json = await response.json();
  if (json.issue) {
    throw new Error(JSON.stringify(json.issue[0].details.text));
  }
  assertIsResource<T, Data>(json);
  return json
}

export async function updateResource<T extends string, Data extends Record<string, unknown>>(resourceType: T, id: string, data?: Data) {
  assert(isUUID(id), 'Expected id to be a UUID')
  const response = await request('PUT', `${resourceType}/${id}`, {
    resourceType,
    ...data
  });
  const json = await response.json();
  if (json.issue) {
    throw new Error(JSON.stringify(json.issue[0].details.text));
  }
  assertIsResource<T, Data>(json);
  return json
}

export async function getResource<T extends string, Data extends Record<string, unknown>>(resourceType: T, id: string) {
  assert(isUUID(id), 'Expected id to be a UUID')
  const response = await request('GET', `${resourceType}/${id}`);
  const json = await response.json();
  if (json.issue) {
    throw new Error(JSON.stringify(json.issue[0].details.text));
  }
  assertIsResource<T, Data>(json);
  return json
}

export async function modifyResource<T extends string, Data extends Record<string, unknown>>(resourceType: T, id: string, modify: (data: Data) => Data) {
  // deno-lint-ignore no-explicit-any
  const resource: any = await getResource<T, Data>(resourceType, id);
  delete resource.meta.lastUpdated;
  delete resource.meta.versionId;
  const updated = modify(resource);
  return updateResource(resourceType, id, updated);
}
