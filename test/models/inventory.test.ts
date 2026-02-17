// import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
// import { afterAll } from 'std/testing/bdd.ts'
// import { assertEquals } from 'std/assert/assert_equals.ts'
// import { inventory } from '../../db/models/inventory.ts'
// import db from '../../db/db.ts'
// import generateUUID from '../../util/uuid.ts'
// import { assertRejects } from 'std/assert/assert_rejects.ts'
// import { addTestEmployee } from '../_helpers/employees.ts'
// import { withTestOrganization } from '../_helpers/organizations.ts'
// import { itUsesTrxAnd } from '../_helpers/transaction.ts'

// describeParallel('db/models/inventory.ts', () => {
//   afterAll(() => db.destroy())
//   describeParallel('getAvailableTests', () => {
//     itUsesTrxAnd(
//       'resolves with the available diagnostic tests in a organization',
//       (trx) =>
//         withTestOrganization(trx, async (organization_id) => {
//           const admin = await addTestEmployee(trx, {
//             role: 'admin',
//           })

//           const contec_bc401 = await trx
//             .selectFrom('devices')
//             .where('name', '=', 'Contec BC401')
//             .select('id')
//             .executeTakeFirstOrThrow()

//           const ls_4000 = await trx
//             .selectFrom('devices')
//             .where('name', '=', 'LS-4000 Immunofluorescence Analyser')
//             .select('id')
//             .executeTakeFirstOrThrow()

//           await inventory.addOrganizationDevice(trx, {
//             device_id: contec_bc401.id,
//             organization_id,
//             created_by: admin.employee_id!,
//           })

//           await inventory.addOrganizationDevice(trx, {
//             device_id: ls_4000.id,
//             organization_id,
//             created_by: admin.employee_id!,
//           })

//           const available_tests = await inventory.getAvailableTests(
//             trx,
//             {
//               organization_id,
//             },
//           )

//           assertEquals(available_tests, [
//             { diagnostic_test: 'anemia' },
//             { diagnostic_test: 'angiocapy' },
//             { diagnostic_test: 'bone_metabolism' },
//             { diagnostic_test: 'brain_injury' },
//             { diagnostic_test: 'cardiac' },
//             { diagnostic_test: 'diabetes' },
//             { diagnostic_test: 'gastric_function' },
//             { diagnostic_test: 'hormone' },
//             { diagnostic_test: 'immune_system' },
//             { diagnostic_test: 'inflammation' },
//             { diagnostic_test: 'nervous_system' },
//             { diagnostic_test: 'renal_function' },
//             { diagnostic_test: 'thyroid' },
//             { diagnostic_test: 'tumor' },
//             { diagnostic_test: 'urine_analysis' },
//           ])
//         }),
//     )
//   })
//   describeParallel('TestConsumption', () => {
//     itUsesTrxAnd(
//       'Add consumable and check quantity',
//       (trx) =>
//         withTestOrganization(trx, async (organization_id) => {
//           const admin = await addTestEmployee(trx, {
//             role: 'admin',
//             organization_id,
//           })

//           const consumable_name = generateUUID()

//           const consumable = await trx
//             .insertInto('consumables')
//             .returning('id')
//             .values({ name: consumable_name })
//             .executeTakeFirstOrThrow()

//           const procurer = await trx
//             .insertInto('procurers')
//             .returning('id')
//             .values({ name: generateUUID() })
//             .executeTakeFirstOrThrow()

//           const first_added = await inventory.procureConsumable(
//             trx,
//             organization_id,
//             {
//               consumable_id: consumable.id,
//               created_by: admin.employee_id!,
//               quantity: 10,
//               procured_from_id: procurer.id,
//               expiry_date: null,
//               batch_number: '',
//               container_size: 5,
//               number_of_containers: 2,
//             },
//           )

//           await inventory.procureConsumable(trx, organization_id, {
//             consumable_id: consumable.id,
//             created_by: admin.employee_id!,
//             quantity: 5,
//             procured_from_id: procurer.id,
//             expiry_date: null,
//             batch_number: '',
//             container_size: 5,
//             number_of_containers: 1,
//           })

//           await inventory.consumeConsumable(trx, organization_id, {
//             consumable_id: consumable.id,
//             created_by: admin.employee_id!,
//             quantity: 10,
//             procurement_id: first_added.id,
//           })

//           const organization_consumables = await inventory.getConsumables(
//             trx,
//             { organization_id },
//           )

//           assertEquals(organization_consumables, [
//             {
//               consumable_id: consumable.id,
//               name: consumable_name,
//               quantity_on_hand: 5,
//               actions: {
//                 add: `/app/organizations/${organization_id}/inventory/add_consumable?consumable_id=${consumable.id}`,
//                 history: `/app/organizations/${organization_id}/inventory/history?consumable_id=${consumable.id}`,
//               },
//             },
//           ])
//         }),
//     )

//     itParallel(
//       'rejects when consuming more than the amount previously procured',
//       async () => {
//         await withTestOrganization(db, async (organization_id) => {
//           const admin = await addTestEmployee(db, {
//             role: 'admin',
//             organization_id,
//           })

//           const consumable_name = generateUUID()

//           const consumable = await db
//             .insertInto('consumables')
//             .returning('id')
//             .values({ name: consumable_name })
//             .executeTakeFirstOrThrow()

//           const procurer = await db
//             .insertInto('procurers')
//             .returning('id')
//             .values({ name: generateUUID() })
//             .executeTakeFirstOrThrow()

//           const first_added = await inventory.procureConsumable(
//             db,
//             organization_id,
//             {
//               consumable_id: consumable.id,
//               created_by: admin.employee_id!,
//               quantity: 10,
//               container_size: 5,
//               number_of_containers: 2,
//               procured_from_id: procurer.id,
//               expiry_date: null,
//               batch_number: '',
//             },
//           )

//           await inventory.procureConsumable(db, organization_id, {
//             consumable_id: consumable.id,
//             created_by: admin.employee_id!,
//             quantity: 5,
//             procured_from_id: procurer.id,
//             expiry_date: null,
//             batch_number: '',
//             container_size: 5,
//             number_of_containers: 1,
//           })

//           // deno-lint-ignore no-explicit-any
//           const error: any = await assertRejects(() =>
//             inventory.consumeConsumable(db, organization_id, {
//               consumable_id: consumable.id,
//               created_by: admin.employee_id!,
//               quantity: 12,
//               procurement_id: first_added.id,
//             })
//           )

//           assertEquals(
//             error.constraint,
//             'procurement_consumed_amount_less_than_quantity',
//           )
//         })
//       },
//     )
//   })
// })
