import { sql } from 'kysely'
import { describe } from 'std/testing/bdd.ts'
import { search } from '../../db/models/icd10_symptoms.ts'
import { itUsesTrxAnd } from '../web/utilities.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'

describe('db/models/icd10_symptoms.ts', { sanitizeResources: false }, () => {
  itUsesTrxAnd('search', async (trx) => {
    const results = await search(trx, 'foreign body sensation')
    console.log(results.slice(0, 3))
    // assertEquals(results, [])
  })
})
