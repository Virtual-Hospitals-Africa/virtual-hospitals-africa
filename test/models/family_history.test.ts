import { afterAll, describe, it } from 'std/testing/bdd.ts'
import family_history from '../../db/models/family_history.ts'
import db from '../../db/db.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'

describe(
  'db/models/family_history.ts',
  () => {
    afterAll(() => db.destroy())
    describe('search', () => {
      it(
        'can find a family history of melanoma',
        async () => {
          const results = await family_history.search(db, {
            search: 'melanoma',
          })
          assertEquals(results, {
            page: 1,
            rows_per_page: 10,
            results: [
              { id: '427858005', name: 'Family history of malignant melanoma' },
              {
                id: '1365944002',
                name: 'Family history of malignant melanoma in first degree relative',
              },
            ],
            has_next_page: false,
            search_terms: { search: 'melanoma' },
          })
        },
      )
    })
  },
)
