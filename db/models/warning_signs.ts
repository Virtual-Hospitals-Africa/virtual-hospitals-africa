// import { WARNING_SIGNS } from '../../shared/warning_signs.ts'
// import { PositiveFindingRecord, TrxOrDb } from '../../types.ts'
// import { positiveFindingsQuery } from './patient_findings.ts'
// import {
//   ParsedFindingExpression,
//   parseFindingExpression,
// } from './simple_record_language.ts'

// export function getForEncounter(
//   trx: TrxOrDb,
//   { patient_id, encounter_id }: { patient_id: string; encounter_id: string },
// ): Promise<PositiveFindingRecord[]> {
//   const warning_signs = WARNING_SIGNS.map((sign) => {
//     const expression = parseFindingExpression(sign.finding_s_expression)
//     return {
//       ...sign,
//       expression,
//     }
//   })

//   return positiveFindingsQuery(trx, { patient_id })
//     .selectFrom('patient_positive_findings')
//     .selectAll('patient_positive_findings')
//     .execute()
// }

// export function insertForEncounter(
//   trx: TrxOrDb,
//   { patient_id, encounter_id }: { patient_id: string; encounter_id: string },
// ): Promise<PositiveFindingRecord[]> {
//   const warning_signs = WARNING_SIGNS.map((sign) => {
//     const expression = parseFindingExpression(sign.finding_s_expression)
//     return {
//       ...sign,
//       expression,
//     }
//   })

//   return positiveFindingsQuery(trx, { patient_id })
//     .selectFrom('patient_positive_findings')
//     .selectAll('patient_positive_findings')
//     .execute()
// }
