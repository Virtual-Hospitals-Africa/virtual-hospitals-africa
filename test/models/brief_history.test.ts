import { afterAll, describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../db/db.ts'
import range from '../../util/range.ts'
import { debugLog } from '../../db/helpers.ts'
import { positiveFindingsQuery } from '../../db/models/brief_history.ts'
import generateUUID from '../../util/uuid.ts'

describe('brief_history', () => {
  afterAll(() => db.destroy())
  describe('positiveFindings', () => {
    it('works', async () => {
      debugLog(
        positiveFindingsQuery(db, { patient_id: generateUUID() }),
      )
    })
  })
})
