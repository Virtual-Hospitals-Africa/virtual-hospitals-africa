import { Kysely } from 'kysely'
import { create } from '../create.ts'

const vhaClinicStaff = [
  'alicejuancc@gmail.com',
  'chen84613@gmail.com',
  'jtagarisa@gmail.com',
  'kkggbo@gmail.com',
  'mesbah.ar@gmail.com',
  'ngwenyasku79@gmail.com',
  'peterpang1103@gmail.com',
  'qiyuan867@gmail.com',
  'rishabh106@gmail.com',
  'scheduler.vha@gmail.com',
  'sigbjorn.olsen@gmail.com',
  'sridhar.gondesi@gmail.com',
  'will.weiss1230@gmail.com',
  'yi23835@bristol.ac.uk',
  'zhuosidian@gmail.com',
  'mike.huang.africa@gmail.com',
  '812046661lm@gmail.com',
]

const vhaVirtualHospitalStaff = [
  'will@morehumaninternet.org',
  'virtualhospitalsafrica@gmail.com',
]

export default create(['health_worker_invitees'], inviteVhaStaff)

// Add a test organization with all VHA employees as admins
// deno-lint-ignore no-explicit-any
async function inviteVhaStaff(db: Kysely<any>) {
  const invitees = vhaClinicStaff.flatMap((email) => [
    {
      email,
      profession: 'admin',
      organization_id: '00000000-0000-0000-0000-000000000001',
    },
    {
      email,
      profession: 'doctor',
      organization_id: '00000000-0000-0000-0000-000000000001',
    },
  ]).concat(vhaVirtualHospitalStaff.flatMap((email) => [
    {
      email,
      profession: 'admin',
      organization_id: '00000000-0000-0000-0000-000000000002',
    },
    {
      email,
      profession: 'doctor',
      organization_id: '00000000-0000-0000-0000-000000000002',
    },
  ]))
  await db
    .insertInto('health_worker_invitees')
    .values(invitees)
    .execute()
}
