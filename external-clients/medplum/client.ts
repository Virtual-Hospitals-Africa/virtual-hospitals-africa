import { assert } from 'std/assert/assert.ts'
import isObjectLike from '../../util/isObjectLike.ts';
import { isUUID } from '../../util/uuid.ts';
import { isISODateTimeString } from '../../util/date.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { redis, lock } from '../redis.ts'
import { Lock } from "redlock"

// Make a ClientApplication in Medplum and use its client ID and secret here
const MEDPLUM_CLIENT_ID = Deno.env.get('MEDPLUM_CLIENT_ID')
const MEDPLUM_CLIENT_SECRET = Deno.env.get('MEDPLUM_CLIENT_SECRET')
const MEDPLUM_SERVER_URL = Deno.env.get('MEDPLUM_SERVER_URL') || 'http://localhost:8103'

const ACCESS_TOKEN_KEY = `medplum_access_token;${MEDPLUM_SERVER_URL}`
const GENERATING_ACCESS_TOKEN_KEY = `generating_access_token;${MEDPLUM_SERVER_URL}`

// When running tests fresh, we need to generate an access token. The locking
// mechanism is used to prevent multiple processes from generating the token at
// the same time.
export async function getToken() {
  const access_token_from_redis = await redis.get(ACCESS_TOKEN_KEY)
  if (access_token_from_redis) return access_token_from_redis

  let access_token_lock: Lock | undefined

  try {
    access_token_lock = await lock.acquire([GENERATING_ACCESS_TOKEN_KEY], 10000);

    const access_token_from_redis_after_lock = await redis.get(ACCESS_TOKEN_KEY)
    if (access_token_from_redis_after_lock) {
      console.log('Another process generated the token')
      return access_token_from_redis_after_lock
    }

    console.log('Generating new token')
    assert(MEDPLUM_CLIENT_ID, 'Must set MEDPLUM_CLIENT_ID env var')
    assert(MEDPLUM_CLIENT_SECRET, 'Must set MEDPLUM_CLIENT_SECRET env var')

    const response = await fetch(`${MEDPLUM_SERVER_URL}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: MEDPLUM_CLIENT_ID,
        client_secret: MEDPLUM_CLIENT_SECRET
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to get token\n${await response.text()}`)
    }

    const json = await response.json();
    assert(isObjectLike(json), 'Expected JSON response');
    assert(typeof json.access_token === 'string', 'Expected access_token');
    assertEquals(json.expires_in, 3600);
    redis.set(ACCESS_TOKEN_KEY, json.access_token, {
      ex: 3599
    })
    return json.access_token;
  } finally {
    if (access_token_lock) {
      console.log('releasing lock')
      lock.release(access_token_lock)
    }
  }
}

export async function request(method: string, path: string, data?: unknown) {
  const token = await getToken()
  const body = data ? JSON.stringify(data) : undefined;
  const headers = new Headers({ 'Authorization': `Bearer ${token}` })
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

function assertIsCreatedResource<T, Data extends Record<string, unknown>>(data: unknown): asserts data is CreatedResource<T, Data> {
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
  assertIsCreatedResource<T, Data>(json);
  return json
}
