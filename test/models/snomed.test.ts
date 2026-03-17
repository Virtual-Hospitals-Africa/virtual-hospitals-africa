import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { afterAll } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import { snomed_concept_finding_like } from '../../db/models/snomed_concept_finding_like.ts'
import { assert } from 'std/assert/assert.ts'

describeParallel('db/models/snomed_concept_finding_like.ts', () => {
  afterAll(() => db.destroy())
  itParallel('prefers the finding category, excluding results identically named findings of other categories', async () => {
    const preferring_finding = await snomed_concept_finding_like.search(db, {
      search: 'collapse',
    })

    assert(preferring_finding.results.some((result) =>
      result.name === 'Collapse' &&
      result.category === 'finding'
    ))

    assert(
      !preferring_finding.results.some((result) =>
        result.name === 'Collapse' &&
        result.category === 'morphologic abnormality'
      ),
    )
  })
})
