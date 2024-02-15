import { describe } from 'std/testing/bdd.ts'
import { search } from '../../db/models/icd10_symptoms.ts'
import { itUsesTrxAnd } from '../web/utilities.ts'
import { assert } from 'std/assert/assert.ts'

describe('db/models/icd10_symptoms.ts', { sanitizeResources: false }, () => {
  describe('search', () => {
    itUsesTrxAnd(
      'can return sane results, even with a misspelling',
      async (trx) => {
        const results = await search(trx, 'Laceration with foreeign body')
        assert(results.length)
      },
    )
  })
})
