import { Kysely } from 'kysely'
import { create } from '../create.ts'
import { assert } from 'std/assert/assert.ts'
import { DB } from '../../../db.d.ts'
import generateUUID from '../../../util/uuid.ts'
import isObjectLike from '../../../util/isObjectLike.ts'
import isString from '../../../util/isString.ts'
import {
  InsertExpression,
  InsertObject,
} from 'kysely/parser/insert-values-parser.d.ts'

const MEDPLUM_CLIENT_ID = Deno.env.get('MEDPLUM_CLIENT_ID')
const MEDPLUM_CLIENT_SECRET = Deno.env.get('MEDPLUM_CLIENT_SECRET')

export default create(
  [
    'Project',
    'Project_History',
    'ProjectMembership',
    'ProjectMembership_History',
    'User',
    'User_History',
    'Practitioner',
    'Practitioner_History',
    'ClientApplication',
    'ClientApplication_History',
    'HumanName',
  ],
  addClientApplication,
  { never_dump: true },
)

async function insertWithHistory<
  TableName extends
    | 'Project'
    | 'ProjectMembership'
    | 'User'
    | 'Practitioner'
    | 'ClientApplication',
>(
  db: Kysely<DB>,
  table_name: TableName,
  content: Record<string, unknown>,
  other_values: Omit<
    InsertObject<DB, TableName>,
    'id' | 'lastUpdated' | 'content'
  >,
) {
  const lastUpdated = new Date().toISOString()
  const id = content.id
    ? (assert(isString(content.id)), content.id)
    : generateUUID()

  const versionId = generateUUID()
  const meta = isObjectLike(content.meta) ? content.meta : {}

  const actual_content = {
    id,
    resourceType: table_name,
    ...content,
    meta: {
      versionId,
      lastUpdated,
      author: { reference: 'system' },
      ...meta,
    },
  }
  await db.insertInto(`${table_name}_History`).values({
    id,
    versionId,
    lastUpdated,
    content: JSON.stringify(actual_content),
    // deno-lint-ignore no-explicit-any
  } as any).executeTakeFirstOrThrow()

  return db.insertInto(table_name).values({
    ...other_values,
    id,
    lastUpdated,
    content: JSON.stringify(actual_content),
  } as InsertExpression<DB, TableName>).returningAll().executeTakeFirstOrThrow()
}

async function addClientApplication(db: Kysely<DB>) {
  assert(MEDPLUM_CLIENT_ID, 'Must set MEDPLUM_CLIENT_ID env var')
  assert(MEDPLUM_CLIENT_SECRET, 'Must set MEDPLUM_CLIENT_SECRET env var')

  const email = 'admin@virtualhospitalsafrica.org'
  const projectId = generateUUID()
  const user = await insertWithHistory(db, 'User', {
    firstName: 'VHA',
    lastName: 'Admin',
    email,
    passwordHash:
      '$2a$10$3i7q4OQ3bkmmtwASrHeBFu96fNczD.a2gjwMx7w9QaAEJIkiL4iz.',
    name: [{
      given: ['VHA'],
      family: 'Admin',
    }],
    project: `Project/${projectId}`,
    projectId,
  }, {
    email,
    compartments: [],
    project: `Project/${projectId}`,
    projectId,
  })

  await insertWithHistory(db, 'Project', {
    id: projectId,
    'name': 'Super Admin',
    'owner': {
      'reference': `User/${user.id}`,
      'display': 'admin@virtualhospitalsafrica.org',
    },
    'superAdmin': true,
    'strictMode': true,
    'meta': {
      'project': projectId,
      'compartment': [{
        'reference': `Project/${projectId}`,
      }],
    },
  }, {
    compartments: [projectId],
    name: 'Virtual Hospitals Africa',
    owner: `User/${user.id}`,
    projectId,
    deleted: false,
  })

  const practitioner = await insertWithHistory(db, 'Practitioner', {
    'meta': {
      'compartment': [{
        'reference': `Project/${projectId}`,
      }],
    },
    'name': [{ 'given': ['VHA'], 'family': 'Admin' }],
    'telecom': [{
      'system': 'email',
      'use': 'work',
      'value': 'admin@virtualhosptialsafrica.org',
    }],
  }, {
    compartments: [projectId],
    phonetic: [JSON.stringify({
      given: ['VHA'],
      family: 'Admin',
    })],
    projectId,
  })

  await db.insertInto('HumanName')
    .values({
      resourceId: practitioner.id,
      name: 'VHA Admin',
      given: 'VHA',
      family: 'Admin',
    })
    .executeTakeFirstOrThrow()

  const client_application = await insertWithHistory(db, 'ClientApplication', {
    'id': MEDPLUM_CLIENT_ID,
    'secret': MEDPLUM_CLIENT_SECRET,
    'meta': {
      'project': projectId,
      'author': {
        'reference': `Practitioner/${practitioner.id}`,
        'display': 'VHA Admin',
      },
      'compartment': [
        {
          'reference': `Project/${projectId}`,
        },
      ],
    },
    'name': 'Virtual Hospitals Africa',
  }, {
    compartments: [projectId],
    name: 'Virtual Hospitals Africa',
    projectId,
  })

  await insertWithHistory(db, 'ProjectMembership', {
    'meta': {
      'project': projectId,
      'compartment': [
        {
          'reference': `Project/${projectId}`,
        },
      ],
    },
    'project': {
      'reference': `Project/${projectId}`,
      'display': 'Virtual Hospitals Africa',
    },
    'user': {
      'reference': `User/${user.id}`,
      'display': 'admin@virtualhospitalsafrica.org',
    },
    'profile': {
      'reference': `Practitioner/${practitioner.id}`,
      'display': 'VHA Admin',
    },
    admin: true,
  }, {
    compartments: [projectId],
    project: `Project/${projectId}`,
    user: `User/${user.id}`,
    profile: `Practitioner/${practitioner.id}`,
    profileType: 'Practitioner',
    projectId,
  })

  await insertWithHistory(db, 'ProjectMembership', {
    'meta': {
      'project': projectId,
      'compartment': [
        {
          'reference': `Project/${projectId}`,
        },
      ],
    },
    'project': {
      'reference': `Project/${projectId}`,
    },
    'user': {
      'reference': `ClientApplication/${client_application.id}`,
      'display': 'Virtual Hospitals Africa',
    },
    'profile': {
      'reference': `ClientApplication/${client_application.id}`,
      'display': 'Virtual Hospitals Africa',
    },
  }, {
    compartments: [projectId],
    project: `Project/${projectId}`,
    user: `ClientApplication/${client_application.id}`,
    profile: `ClientApplication/${client_application.id}`,
    profileType: 'ClientApplication',
    projectId,
  })
}
