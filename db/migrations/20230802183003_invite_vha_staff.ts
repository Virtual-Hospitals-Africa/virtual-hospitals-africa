import { Kysely } from 'kysely'

const vhaStaff = [
  'adastomek123@gmail.com',
  'boyoani@gmail.com',
  'brian.bistolfo@gmail.com',
  'floracheng292@gmail.com',
  'jprkumra@gmail.com',
  'jtagarisa@gmail.com',
  'lijingwenot@gmail.com',
  'marioh13@gmail.com',
  'mary.andres2009@gmail.com',
  'mike.huang.mikank@gmail.com',
  'neethnawa8@gmail.com',
  'otan.tmd@gmail.com',
  'peterpang1103@gmail.com',
  'scheduler.vha@gmail.com',
  'will.weiss1230@gmail.com',
  'kopp.kriszti@gmail.com',
  'aatirsiddiqui1@gmail.com',
  'aislinjohn2002@gmail.com',
  'ijdebruler@gmail.com',
  'johnduffer1@gmail.com',
  'rishabh106@gmail.com',
  'ashleyradford23@gmail.com',
  'yedusolo@gmail.com',
  'nahcnelle@gmail.com',
  // 'will@morehumaninternet.org',
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
    vhaStaff.map((email) => ({
      email,
      profession: 'admin',
      facility_id: 1, // Test Facility
    })),
  )
    .execute()
}
