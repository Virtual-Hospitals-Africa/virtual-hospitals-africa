// import { describe } from 'std/testing/bdd.ts'
// import {
//   searchBaseQuery,
//   searchSymptoms,
//   searchTree,
// } from '../../db/models/icd10.ts'
// import { itUsesTrxAnd } from '../web/utilities.ts'
// import { assertEquals } from 'std/assert/assert_equals.ts'
// import { assertNotEquals } from 'std/assert/assert_not_equals.ts'
// import { assert } from 'std/assert/assert.ts'

// describe('db/models/icd10.ts', { sanitizeResources: false }, () => {
//   describe('search', () => {
//     itUsesTrxAnd.only(
//       'can return sane results, even with a misspelling',
//       async (trx) => {
//         const results = await searchTree(trx, {
//           term: 'wrist woound',
//         })
//         assertEquals(results[0].name, 'Unspecified open wound of wrist')
//         assertEquals(results[1].name, 'Fistula, wrist')
//         assertEquals(results[2].name, 'Pain in wrist')
//       },
//     )

//     itUsesTrxAnd(
//       'can return results with a code_start',
//       async (trx) => {
//         const results_starting_with_r = await searchTree(trx, {
//           term: 'Drug',
//           code_range: 'R',
//         })
//         assertEquals(results_starting_with_r.length, 10)
//         assertEquals(results_starting_with_r[0].name, 'Drug induced fever')
//         assertEquals(
//           results_starting_with_r[1].name,
//           'Drug induced retention of urine',
//         )

//         const results_starting_with_any = await searchTree(trx, {
//           term: 'Drug',
//         })

//         assertNotEquals(
//           results_starting_with_any.length,
//           results_starting_with_r.length,
//         )
//       },
//     )
//   })

//   describe('searchSymptoms', () => {
//     itUsesTrxAnd(
//       'can return sane results, even with a misspelling',
//       async (trx) => {
//         const results = await searchSymptoms(trx, 'otalgia')
//         assertEquals(results.length, 3)
//         assertEquals(results[0].name, 'Open wound of wrist')
//         assertEquals(results[1].name, 'Fistula, wrist')
//         assertEquals(results[2].name, 'Pain in wrist')
//       },
//     )

//     // itUsesTrxAnd(
//     //   'can find aliases',
//     //   async (trx) => {
//     //     const results = await searchSymptoms(trx, 'earache')
//     //     assert(results.length, 10)
//     //   },
//     // )
//   })

//   describe('searchBaseQuery', () => {
//     itUsesTrxAnd(
//       'can return sane results, even with a misspelling',
//       async (trx) => {
//         const results = await searchBaseQuery(trx, {
//           term: 'wrist woound',
//         }).selectFrom('matches')
//         .selectAll('matches')
//         .execute()

//         assert(results.some(result => result.code === "S61.5"))
//       },
//     )

//     itUsesTrxAnd(
//       'respects a given code_range',
//       async (trx) => {
//         const results = await searchBaseQuery(trx, {
//           term: 'wrist woound',
//           code_range: 'M25'
//         }).selectFrom('matches')
//         .selectAll('matches')
//         .execute()

//         assert(results.every(result => result.code !== "S61.5"))
//       },
//     )
//   })
// })

// describe('foo', () => {
//   it('works', () => {
//     qb.selectFrom('icd10_diagnoses')
//       .select('code')
//       .where(
//         sql<boolean>`(
//           description % ${term}
//         )`,
//       )
//       .unionAll(
//         qb.selectFrom('icd10_diagnoses_includes')
//           .select('code')
//           .where(
//             sql<boolean>`(
//               note % ${term}
//             )`,
//           ),
//       )
//   })
// })
