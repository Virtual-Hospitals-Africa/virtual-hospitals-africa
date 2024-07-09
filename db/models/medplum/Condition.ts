import { TrxOrDb } from '../../../types.ts'
import generateUUID from '../../../util/uuid.ts'
import { now } from '../../helpers.ts'

// condition: {
//   // _profile: string[] | null
//   // _security: string[] | null
//   // _source: string | null
//   // _tag: string[] | null
//   // abatementAge: number | null
//   // abatementDate: Timestamp | null
//   // abatementString: string | null
//   assertedDate: Timestamp | null
//   asserter: string | null
//   bodySite: string[] | null
//   category: string[] | null
//   clinicalStatus: string | null
//   code: string | null
//   compartments: string[]
//   content: string
//   encounter: string | null
//   evidence: string[] | null
//   evidenceDetail: string[] | null
//   onsetAge: number | null
//   onsetDate: Timestamp | null
//   onsetInfo: string | null
//   patient: string | null
//   projectId: string | null
//   recordedDate: Timestamp | null
//   severity: string | null
//   stage: string[] | null
//   subject: string | null
//   verificationStatus: string | null
// }

export function insertOne(
  trx: TrxOrDb, 
  to_insert: {
    patient_id: string,
    condition_code: string
  }
) {
  const id = generateUUID()
  const data = {
    id,
    patient: to_insert.patient_id,
    code: to_insert.condition_code,
  }
  const content = JSON.stringify(data)

  return trx
    .insertInto('Condition')
    .values({
      ...data,
      content,
      lastUpdated: now,
      recordedDate: now,
      compartments: []
     })
    .returningAll()
    .executeTakeFirstOrThrow()
}