// import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
// import { afterAll, before } from 'std/testing/bdd.ts'
// import { assert } from 'std/assert/assert.ts'
// import generateUUID from '../../../../util/uuid.ts'
// import * as cheerio from 'cheerio'
// import { assertEquals } from 'std/assert/assert_equals.ts'
// import db from '../../../../db/db.ts'
// import { addTestRegulatorWithSession } from '../../../_helpers/regulators.ts'
// import { route } from '../../../_route.ts'
// import waitUntilTestServerUp from '../../../_helpers/waitUntilTestServerUp.ts'

// describeParallel(
//   '/regulator/[country]/pharmacists/invite',
//   () => {
//     before(waitUntilTestServerUp)
//     afterAll(() => db.destroy())
//     itParallel('renders an invite page on GET', async () => {
//       const { regulator, fetchOk } = await addTestRegulatorWithSession(db)

//       const response = await fetchOk(
//         `/regulator/${regulator.country}/pharmacists/invite`,
//       )

//       assert(
//         response.url ===
//           `${route}/regulator/${regulator.country}/pharmacists/invite`,
//       )
//       const page_contents = await response.text()

//       const $ = cheerio.load(page_contents)

//       assert($('input[name="first_names"]').length === 1)
//       assert($('input[name="surname"]').length === 1)
//       assert($('input[name="licence_number"]').length === 1)
//       assert($('input[name="expiry_date"]').length === 1)
//       assert($('input[name="town"]').length === 1)
//       assert($('input[name="address"]').length === 1)
//       assert($('select[name="prefix"]').length === 1)
//       assert($('select[name="pharmacist_type"]').length === 1)
//     })

//     itParallel('can create a pharmacist via POST', async () => {
//       const { fetchOk, regulator } = await addTestRegulatorWithSession(db)

//       {
//         const first_names = `Test Given Name ${generateUUID()}`
//         const surname = `Test Family Name ${generateUUID()}`
//         const licence_number = 'P01-0805-2024'
//         const body = new FormData()
//         body.set('first_names', first_names)
//         body.set('surname', surname)
//         body.set('licence_number', licence_number)
//         body.set('expiry_date', '2030-01-01')
//         body.set('town', 'Test Town')
//         body.set('address', 'Test Address')
//         body.set('prefix', 'Mrs')
//         body.set('pharmacist_type', 'Pharmacist')

//         const post_response = await fetchOk(
//           `${route}/regulator/${regulator.country}/pharmacists/invite`,
//           {
//             method: 'POST',
//             body,
//           },
//           {
//             cancel_response_body: true,
//           },
//         )

//         assertEquals(
//           post_response.url,
//           `${route}/regulator/${regulator.country}/pharmacists?success=${encodeURIComponent('New pharmacist added')}`,
//         )

//         const invited_pharmacist = await db
//           .selectFrom('pharmacists')
//           .where('first_names', '=', first_names)
//           .where('surname', '=', surname)
//           .select(['first_names', 'surname', 'licence_number'])
//           .executeTakeFirst()

//         assertEquals(invited_pharmacist?.first_names, first_names)
//         assertEquals(invited_pharmacist?.surname, surname)
//         assertEquals(invited_pharmacist?.licence_number, licence_number)
//       }
//     })
//   },
// )
