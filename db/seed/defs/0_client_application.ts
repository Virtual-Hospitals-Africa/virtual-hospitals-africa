import { Kysely } from 'kysely'
import { create } from '../create.ts'
import { assert } from 'std/assert/assert.ts'
import generateUUID from '../../../util/uuid.ts'
import bcrypt from 'bcrypt'

console.log('bcrypt', bcrypt)

const MEDPLUM_CLIENT_ID = Deno.env.get('MEDPLUM_CLIENT_ID')
const MEDPLUM_CLIENT_SECRET = Deno.env.get('MEDPLUM_CLIENT_SECRET')
const MEDPLUM_SUPERADMIN_PASSWORD =
  Deno.env.get('MEDPLUM_SUPERADMIN_PASSWORD') || 'superadmin'

export default create(
  ['ProjectMembership', 'ClientApplication'],
  addClientApplication,
  { never_dump: true },
)

const vha_admin_email = 'superadmin@virtualhospitalsafrica.org'

// deno-lint-ignore no-explicit-any
async function addClientApplication(db: Kysely<any>) {
  assert(MEDPLUM_CLIENT_ID, 'Must set MEDPLUM_CLIENT_ID env var')
  assert(MEDPLUM_CLIENT_SECRET, 'Must set MEDPLUM_CLIENT_SECRET env var')
  assert(
    MEDPLUM_SUPERADMIN_PASSWORD,
    'Must set MEDPLUM_SUPERADMIN_PASSWORD env var',
  )

  const projectId = generateUUID()
  const userId = generateUUID()
  const passwordHash = await bcrypt.hash(MEDPLUM_SUPERADMIN_PASSWORD, 10)

  const vha_admin_versionId = generateUUID()
  const lastUpdated = new Date().toISOString()
  const vha_admin_content = {
    resourceType: 'User',
    firstName: 'VHA',
    lastName: 'Superadmin',
    email: vha_admin_email,
    passwordHash,
    id: userId,
    meta: {
      versionId: vha_admin_versionId,
      lastUpdated,
      author: { reference: 'system' },
    },
  }
  const user = await db.insertInto('User')
    .values({
      id: userId,
      email: vha_admin_email,
      content: vha_admin_content,
      lastUpdated,
      compartments: [],
    })
    .returningAll()
    .executeTakeFirstOrThrow()

  await db.insertInto('User_History')
    .values({
      versionId: vha_admin_versionId,
      id: userId,
      content: vha_admin_content,
      lastUpdated,
    })
    .execute()

  const project = await db
    .insertInto('Project')
    .values({
      id: projectId,
      lastUpdated,
      compartments: [projectId],
      name: 'Virtual Hospitals Africa',
      content: {
        resourceType: 'Project',
        name: 'Virtual Hospitals Africa',
        owner: {
          reference: `User/${userId}`,
          display: vha_admin_email,
        },
        superAdmin: true,
        strictMode: true,
        id: projectId,
        meta: {
          versionId: '67dfa037-d44a-4452-9425-a5058e327a34',
          lastUpdated,
          author: { 'reference': 'system' },
          project: projectId,
          compartment: [{ reference: `Project/${projectId}` }],
        },
      },
    })
    .returningAll()
    .executeTakeFirstOrThrow()

  const client_application = await db.insertInto('ClientApplication').values({
    id: MEDPLUM_CLIENT_ID,
    content: JSON.stringify({
      meta: {
        project: project.id,
        versionId: 'eeb5a703-185c-48f3-802b-090be3c53bae',
        lastUpdated,
        author: {
          reference: `User/${user.id}`,
          display: 'VHA Superadmin',
        },
        compartment: [
          {
            reference: `Project/${projectId}`,
          },
        ],
      },
      resourceType: 'ClientApplication',
      name: 'Virtual Hospitals Africa',
      secret: MEDPLUM_CLIENT_SECRET,
      id: MEDPLUM_CLIENT_ID,
    }),
    lastUpdated: '2024-04-22 21:56:22.761-04',
    compartments: [project.id],
    name: 'Virtual Hospitals Africa',
    deleted: false,
    _profile: null,
    _security: null,
    _source: null,
    _tag: null,
    projectId: project.id,
  }).returningAll()
    .executeTakeFirstOrThrow()

  const project_membership_id = 'b9be3cd0-d9a5-4e97-abaa-1752fd9f9ce5'

  await db.insertInto('ProjectMembership').values(
    {
      id: project_membership_id,
      content: JSON.stringify({
        meta: {
          project: project.id,
          versionId: '6579dbae-9432-4d8a-a87c-aaf05eeba353',
          lastUpdated,
          author: {
            reference: 'system',
          },
          compartment: [
            {
              'reference': `Project/${project.id}`,
            },
          ],
        },
        resourceType: 'ProjectMembership',
        project: {
          reference: `Project/${project.id}`,
        },
        user: {
          reference: `User/${user.id}`,
          display: 'VHA Superadmin',
        },
        profile: {
          reference: `ClientApplication/${client_application.id}`,
          display: 'Virtual Hospitals Africa',
        },
        id: project_membership_id,
      }),
      lastUpdated,
      compartments: [project.id],
      project: `Project/${project.id}`,
      user: `User/${user.id}`,
      deleted: false,
      profile: `ClientApplication/${client_application.id}`,
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
