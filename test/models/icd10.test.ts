import { describe } from 'std/testing/bdd.ts'
import { search } from '../../db/models/icd10.ts'
import { itUsesTrxAnd } from '../web/utilities.ts'
import { assert } from 'std/assert/assert.ts'
import sortBy from '../../util/sortBy.ts'

describe('db/models/icd10.ts', { sanitizeResources: false }, () => {
  describe('search', () => {
    itUsesTrxAnd(
      'can return sane results, even with a misspelling',
      async (trx) => {
        const results = await search(trx, 'Laceration with foreeign body')
        const s = sortBy(results, (r) => r.code)
        console.log(s)
        assert(results.length)
      },
    )
  })
})
