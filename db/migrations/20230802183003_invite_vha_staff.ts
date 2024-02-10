import { Kysely } from 'kysely'

const vhaStaff = [
  'jtagarisa@gmail.com',
  'peterpang1103@gmail.com',
  'scheduler.vha@gmail.com',
  'will.weiss1230@gmail.com',
  'aislinjohn2002@gmail.com',
  'ijdebruler@gmail.com',
  'johnduffer1@gmail.com',
  'sherviniv@gmail.com',
  'ngwenyasku79@gmail.com',
  'mesbah.ar@gmail.com',
  'sujasridesigns@gmail.com',
  'sujasri.projects@gmail.com',
]

export async function up(db: Kysely<unknown>) {
  await inviteVhaStaff(db)
}

// deno-lint-ignore no-explicit-any
export async function down(db: Kysely<any>) {
  await db.deleteFrom('health_worker_invitees').where('facility_id', '=', 1)
    .execute()
}

// Add a test facility with all VHA employees as admins
// deno-lint-ignore no-explicit-any
async function inviteVhaStaff(db: Kysely<any>) {
  await db.insertInto('health_worker_invitees').values(
    vhaStaff.flatMap((email) => [
      {
        email,
        profession: 'admin',
        facility_id: 1, // Test Facility
      },
      {
        email,
        profession: 'doctor',
        facility_id: 1, // Test Facility
      },
    ]),
  )
    .execute()
}
