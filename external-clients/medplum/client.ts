import { assert } from 'std/assert/assert.ts'
import isObjectLike from '../../util/isObjectLike.ts';
import { isUUID } from '../../util/uuid.ts';
import { isISODateTimeString } from '../../util/date.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { redis, lock } from '../redis.ts'
import { Lock } from "redlock"
import { Resource } from 'medeplum_fhirtypes'

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

type CreatedResource<T extends Resource> = T & {
  id: string
  meta: {
    versionId: string
    lastUpdated: string
  }
}

function assertIsCreatedResource<T extends Resource>(data: unknown): asserts data is CreatedResource<T> {
  assert(isObjectLike(data), 'Expected data to be an object');
  assert(isUUID(data.id), 'Expected .id to be a UUID');
  assert(isObjectLike(data.meta), 'Expected .meta to be an object');
  assert(isUUID(data.meta.versionId), 'Expected .meta.versionId to be a UUID');
  assert(isISODateTimeString(data.meta.lastUpdated), 'Expected .meta.lastUpdated to be a datetime string');
}

export async function createResource<T extends Resource>(resource: T): Promise<CreatedResource<T>> {
  const response = await request('POST', resource.resourceType, resource);
  const json = await response.json();
  // deno-lint-ignore no-explicit-any
  const error = json.issue && json.issue.find((i: any) => i.severity !== 'informational')
  if (error) {
    throw new Error(JSON.stringify(error.details.text));
  }
  assertIsCreatedResource<T>(json);
  return json
}

export async function putResource<T extends Resource>(resource: T & { id: string }): Promise<CreatedResource<T>> {
  const response = await request('PUT', `${resource.resourceType}/${resource.id}`, resource);
  const json = await response.json();
  // deno-lint-ignore no-explicit-any
  const error = json.issue && json.issue.find((i: any) => i.severity !== 'informational')
  if (error) {
    throw new Error(JSON.stringify(error.details.text));
  }
  assertIsCreatedResource<T>(json);
  return json
}

/*
{
  "resourceType": "Bundle",
  "type": "transaction-response",
  "entry": [
    {
      "response": {
        "outcome": {
          "resourceType": "OperationOutcome",
          "id": "created",
          "issue": [
            {
              "severity": "information",
              "code": "informational",
              "details": {
                "text": "Created"
              }
            }
          ]
        },
        "status": "201",
        "location": "Patient/c022829d-8e37-4bca-acfb-86e456ab5f9a"
      },
      "resource": {
        "resourceType": "Patient",
        "name": [
          {
            "use": "official",
            "given": [
              "Alice"
            ],
            "family": "BOB"
          }
        ],
        "gender": "female",
        "birthDate": "1974-12-25",
        "id": "c022829d-8e37-4bca-acfb-86e456ab5f9a",
        "meta": {
          "versionId": "a738cb7f-dc46-46de-865a-f27d49724c24",
          "lastUpdated": "2024-10-05T14:59:38.379Z",
          "author": {
            "reference": "Practitioner/8c48a54b-0f69-4db1-ace0-47c4b21b85f3",
            "display": "VHA Admin"
          },
          "project": "136d74f0-66ba-467b-aee4-cfd652063aa2",
          "compartment": [
            {
              "reference": "Project/136d74f0-66ba-467b-aee4-cfd652063aa2"
            },
            {
              "reference": "Patient/c022829d-8e37-4bca-acfb-86e456ab5f9a"
            }
          ]
        }
      }
    }
  ]
}
*/

export async function insertMany<T extends Resource>(resources: T[]) {
  const response = await request('POST', '', {
    resourceType: "Bundle",
    type: 'transaction',
    entry: resources.map(resource => ({
      resource,
      request: {
        method: "POST",
        url: resource.resourceType
      }
    }))
  });
  const json = await response.json();
  assert(isObjectLike(json), 'Expected JSON response');
  assert(json.resourceType === 'Bundle', 'Expected resourceType: "Bundle"');
  assert(json.type === 'transaction-response', 'Expected type: "transaction-response"');
  assert(Array.isArray(json.entry), 'Expected entry to be an array');
  


  // deno-lint-ignore no-explicit-any
  const error = Array.isArray(json.issue) && json.issue.find((i: any) => i.severity !== 'informational')
  if (error) {
    throw new Error(JSON.stringify(error.details.text));
  }
  assertIsCreatedResource<T>(json);
  return json

}