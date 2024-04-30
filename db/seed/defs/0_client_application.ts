import { Kysely, sql } from 'kysely'
import { create } from '../create.ts'
import { assert } from 'std/assert/assert.ts'

const MEDPLUM_CLIENT_ID = Deno.env.get('MEDPLUM_CLIENT_ID')
const MEDPLUM_CLIENT_SECRET = Deno.env.get('MEDPLUM_CLIENT_SECRET')
assert(MEDPLUM_CLIENT_ID, 'Must set MEDPLUM_CLIENT_ID env var')
assert(MEDPLUM_CLIENT_SECRET, 'Must set MEDPLUM_CLIENT_SECRET env var')

export default create(
  ['ProjectMembership', 'ClientApplication'],
  addClientApplication,
  { never_dump: true },
)

// deno-lint-ignore no-explicit-any
async function addClientApplication(db: Kysely<any>) {
  const project = await db.selectFrom('Project').selectAll()
    .executeTakeFirstOrThrow()
  const practitioner = await db.selectFrom('Practitioner')
    .selectAll()
    .where(
      sql<
        boolean
      >`(cast(content AS json)->'name')::text = '[{"given":["Medplum"],"family":"Admin"}]'`,
    )
    .executeTakeFirstOrThrow()
  const client_application = await db.insertInto('ClientApplication').values({
    id: MEDPLUM_CLIENT_ID,
    content: JSON.stringify({
      'meta': {
        'project': project.id,
        'versionId': 'eeb5a703-185c-48f3-802b-090be3c53bae',
        'lastUpdated': '2024-04-23T01:56:22.761Z',
        'author': {
          'reference': `Practitioner/${practitioner.id}`,
          'display': 'Medplum Admin',
        },
        'compartment': [
          {
            'reference': `Project/${project.id}`,
          },
        ],
      },
      'resourceType': 'ClientApplication',
      'name': 'Virtual Hospitals Africa',
      'secret': MEDPLUM_CLIENT_SECRET,
      'id': MEDPLUM_CLIENT_ID,
    }),
    lastUpdated: '2024-04-22 21:56:22.761-04',
    compartments: `{${project.id}}`,
    name: 'Virtual Hospitals Africa',
    deleted: false,
    _profile: null,
    _security: null,
    _source: null,
    _tag: null,
    projectId: project.id,
  }).returningAll().executeTakeFirstOrThrow()

  const project_membership_id = 'b9be3cd0-d9a5-4e97-abaa-1752fd9f9ce5'

  await db.insertInto('ProjectMembership').values(
    {
      id: project_membership_id,
      content: JSON.stringify({
        'meta': {
          'project': project.id,
          'versionId': '6579dbae-9432-4d8a-a87c-aaf05eeba353',
          'lastUpdated': '2024-04-23T19:11:26.089Z',
          'author': {
            'reference': 'system',
          },
          'compartment': [
            {
              'reference': `Project/${project.id}`,
            },
          ],
        },
        'resourceType': 'ProjectMembership',
        'project': {
          'reference': `Project/${project.id}`,
        },
        'user': {
          'reference': `ClientApplication/${client_application.id}}`,
          'display': 'Virtual Hospitals Africa',
        },
        'profile': {
          'reference': `ClientApplication/${client_application.id}}`,
          'display': 'Virtual Hospitals Africa',
        },
        'id': project_membership_id,
      }),
      lastUpdated: '2024-04-23 15:11:26.089-04',
      compartments: `{${project.id}}`,
      project: `Project/${project.id}`,
      user: `ClientApplication/${client_application.id}`,
      deleted: false,
      profile: `ClientApplication/${client_application.id}}`,
      _profile: null,
      _security: null,
      _source: null,
      _tag: null,
      profileType: 'ClientApplication',
      externalId: null,
      projectId: project.id,
      accessPolicy: null,
      userName: null,
    },
  ).execute()
} 
