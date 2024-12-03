import { TrxOrDb } from '../../../types.ts'
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
  'mingdama0909@gmail.com',
  'laurencelo397@gmail.com',
  'saadmalikpa@gmail.com',
  'drnondumiso@ubuntudoctorcoaching.com',
]

const vhaVirtualHospitalStaff = [
  'will@morehumaninternet.org',
  'virtualhospitalsafrica@gmail.com',
  'lium34892@gmail.com',
  'kane73fxk@gmail.com',
  'zorachen613@gmail.com',
  'kkggboo@gmail.com',
  'alicejuancc01@gmail.com',
  'qiyuan877@gmail.com',
  'm81547905@gmail.com',
  'ngwenyasikhululiwe1@gmail.com',
  'tagarisajonathan@gmail.com',
  'saadmalikp@gmail.com',
  'laurence.hosp@gmail.com',
  'mangowho5@gmail.com',
  'sanyalrishab@gmail.com',
]

export default create(['health_worker_invitees'], inviteVhaStaff)

// Add a test organization with all VHA employees as admins
async function inviteVhaStaff(trx: TrxOrDb) {
  const invitees = vhaClinicStaff.flatMap((email) => [
    {
      email,
      profession: 'admin' as const,
      organization_id: '00000000-0000-0000-0000-000000000001',
    },
    {
      email,
      profession: 'doctor' as const,
      organization_id: '00000000-0000-0000-0000-000000000001',
    },
  ]).concat(vhaVirtualHospitalStaff.flatMap((email) =>
    [
      {
        email,
        profession: 'admin' as const,
        organization_id: '00000000-0000-0000-0000-000000000002',
      },
      {
        email,
        profession: 'doctor' as const,
        organization_id: '00000000-0000-0000-0000-000000000002',
      },
      // deno-lint-ignore no-explicit-any
    ] as any
  ))
  await trx
    .insertInto('health_worker_invitees')
    .values(invitees)
    .execute()
}
