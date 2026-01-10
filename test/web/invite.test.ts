// import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
// import { afterAll, before, it } from 'std/testing/bdd.ts'
// import { assert } from 'std/assert/assert.ts'
// import { assertEquals } from 'std/assert/assert_equals.ts'
// import db from '../../db/db.ts'
// import * as employment from '../../db/models/employment.ts'
// import * as nurse_registration_details from '../../db/models/nurse_registration_details.ts'
// import { addTestEmployeeWithSession } from '../_helpers/employees.ts'
// import { testHealthWorker } from '../_helpers/health_workers.ts'
// import { route } from '../_route.ts'
// import { testNurseRegistrationDetails } from '../../mocks/testRegistrationDetails.ts'
// import waitUntilTestServerUp from '../_helpers/waitUntilTestServerUp.ts'
// import { upsertWithGoogleCredentials } from '../../db/models/health_worker_google_tokens.ts'

// // TODO USE_INVITE_SYSTEM
// describeParallel.skip('inviting employees', () => {
//   before(waitUntilTestServerUp)
//   afterAll(() => db.destroy())

//   itParallel(
//     'allows a health worker employed at a organization to view/approve its employees',
//     async () => {
//       const mock = await addTestEmployeeWithSession(db, {
//         profession: 'admin',
//       })
//       const nurse = await upsertWithGoogleCredentials(db, testHealthWorker())
//       const admin = await upsertWithGoogleCredentials(db, testHealthWorker())

//       await employment.addOne(db, {
//         organization_id: '00000000-0000-1000-8000-000000000001',
//         health_worker_id: nurse.id,
//         profession: 'nurse',
//         is_admin: false,
//       })

//       await employment.addOne(db, {
//         organization_id: '00000000-0000-1000-8000-000000000001',
//         health_worker_id: admin.id,
//         profession: null,
//         is_admin: true,
//       })

//       const details = await testNurseRegistrationDetails(db, {
//         health_worker_id: nurse.id,
//       })

//       await nurse_registration_details.add(db, details)

//       const response = await mock.fetch(`/app/employees`)

//       if (!response.ok) throw new Error(await response.text())
//       assert(response.redirected)
//       assertEquals(
//         response.url,
//         `${route}/app/organizations/00000000-0000-1000-8000-000000000001/employees`,
//       )
//       const page_contents = await response.text()
//       assert(
//         page_contents.includes(
//           `href="/app/organizations/00000000-0000-1000-8000-000000000001/employees/${mock.health_worker.id}"`,
//         ),
//       )
//       assert(
//         page_contents.includes(
//           `href="/app/organizations/00000000-0000-1000-8000-000000000001/employees/${nurse.id}"`,
//         ),
//       )
//     },
//   )

//   it(`allows admin access to invite`, async () => {
//     const mock = await addTestEmployeeWithSession(db, {
//       profession: 'admin',
//     })
//     let response = await mock.fetch(
//       `${route}/app/organizations/00000000-0000-1000-8000-000000000001/employees`,
//     )
//     if (!response.ok) {
//       throw new Error(await response.text())
//     }
//     assertEquals(
//       response.url,
//       `${route}/app/organizations/00000000-0000-1000-8000-000000000001/employees`,
//     )
//     let page_contents = await response.text()
//     assert(
//       page_contents.includes(
//         'href="/app/organizations/00000000-0000-1000-8000-000000000001/employees/invite"',
//       ),
//     )

//     response = await mock.fetch(
//       `${route}/app/organizations/00000000-0000-1000-8000-000000000001/employees/invite`,
//     )

//     if (!response.ok) throw new Error(await response.text())
//     assertEquals(
//       response.url,
//       `${route}/app/organizations/00000000-0000-1000-8000-000000000001/employees/invite`,
//     )
//     page_contents = await response.text()
//     assert(page_contents.includes('Email'))
//     assert(page_contents.includes('Profession'))
//     assert(page_contents.includes('Invite'))
//   })

//   it("doesn't allow access to employees if you are employed at a different organization", async () => {
//     const mock = await addTestEmployeeWithSession(db, {
//       profession: 'doctor',
//     })
//     const response = await mock.fetch(
//       `${route}/app/organizations/00000000-0000-1000-8000-000000000002/employees?expectedTestError=1`,
//     )
//     assertEquals(response.status, 403)
//     await response.body?.cancel()
//   })

//   it("doesn't allow non-admin to invite page", async () => {
//     const mock = await addTestEmployeeWithSession(db, {
//       profession: 'doctor',
//     })

//     const employees_response = await mock.fetch(
//       `${route}/app/organizations/00000000-0000-1000-8000-000000000001/employees`,
//     )

//     assert(
//       employees_response.ok,
//     )
//     assert(
//       employees_response.url ===
//         `${route}/app/organizations/00000000-0000-1000-8000-000000000001/employees`,
//     )
//     const page_contents = await employees_response.text()
//     assert(
//       !page_contents.includes(
//         'href="/app/organizations/00000000-0000-1000-8000-000000000001/employees/invite"',
//       ),
//     )

//     const invites_response = await mock.fetch(
//       `${route}/app/organizations/00000000-0000-1000-8000-000000000001/employees/invite?expectedTestError=1`,
//     )

//     assertEquals(invites_response.status, 403)
//     await invites_response.body?.cancel()
//   })
// })
