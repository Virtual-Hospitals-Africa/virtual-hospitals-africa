// import { assert } from 'std/assert/assert.ts'
// import type { TrxOrDb } from '../../types.ts'
// import { jsonArrayFrom } from '../helpers.ts'
// import * as findings from './findings.ts'
// import { ensureEncounterId } from './patient_encounters.ts'
// import { sql } from 'kysely'

// export async function forPatientEncounter(trx: TrxOrDb, opts: {
//   patient_id: string
//   encounter_id: string
// }) {
//   const examinations = await trx.selectFrom('examinations')
//     .leftJoin(
//       'patient_examinations as pe',
//       (qb) =>
//         qb
//           .onRef(
//             'pe.examination_identifier',
//             '=',
//             'examinations.identifier',
//           )
//           .on(
//             'pe.encounter_id',
//             '=',
//             ensureEncounterId(trx, opts),
//           ),
//     )
//     .select([
//       'examinations.identifier as examination_identifier',
//       'examinations.tab',
//       'examinations.page',
//       'examinations.path',
//       'pe.id as patient_examination_id',
//       'pe.patient_id',
//       'pe.encounter_id',
//       'pe.encounter_provider_id',
//       'pe.completed',
//       'pe.skipped',
//       'pe.ordered',

//       jsonArrayFrom(
//         findings.baseQuery(trx).whereRef(
//           'patient_examination_findings.patient_examination_id',
//           '=',
//           sql.ref('pe.id'),
//         ),
//       ).as('findings'),
//     ])
//     .where('examinations.identifier', 'like', 'Head-to-toe Assessment%')
//     .orderBy('examinations.order', 'asc')
//     .execute()

//   return examinations.map(({ examination_identifier, ...ex }) => {
//     assert(
//       examination_identifier.startsWith('Head-to-toe Assessment'),
//       `examination_identifier must start with Head-to-toe Assessment but got ${examination_identifier}`,
//     )
//     assert(
//       ex.path.startsWith('/head_to_toe_assessment'),
//       `path must start with /head_to_toe_assessment but got ${ex.path}`,
//     )

//     const href =
//       `/app/patients/${ex.patient_id}/encounters/${ex.encounter_id}${ex.path}`

//     return {
//       ...ex,
//       examination_identifier,
//       href,
//     }
//   })
// }
