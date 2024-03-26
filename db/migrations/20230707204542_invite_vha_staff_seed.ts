import { Kysely } from 'kysely'
import { createSeedMigration } from '../seedMigration.ts'

const vhaClinicStaff = [
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
  'sridhar.gondesi@gmail.com',
]

const vhaVirtualHospitalStaff = [
  'will@morehumaninternet.org',
  'virtualhospitalsafrica@gmail.com',
]

export default createSeedMigration(['health_worker_invitees'], inviteVhaStaff)

// Add a test facility with all VHA employees as admins
// deno-lint-ignore no-explicit-any
async function inviteVhaStaff(db: Kysely<any>) {
  await db.insertInto('health_worker_invitees').values(
    vhaClinicStaff.flatMap((email) => [
      {
        email,
        profession: 'admin',
        facility_id: 1,
      },
      {
        email,
        profession: 'doctor',
        facility_id: 1,
      },
    ]).concat(vhaVirtualHospitalStaff.flatMap((email) => [
      {
        email,
        profession: 'admin',
        facility_id: 2,
      },
      {
        email,
        profession: 'doctor',
        facility_id: 2,
      },
    ])),
  )
    .execute()
}
