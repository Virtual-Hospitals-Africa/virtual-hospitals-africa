import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { afterAll } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import { snomed_model } from '../../db/models/snomed.ts'
import { assert } from 'std/assert/assert.ts'

describeParallel('db/models/snomed.ts', () => {
  afterAll(() => db.destroy())
  itParallel('excludes results of the later named categories if there are matching results with the identical name', async () => {
    snomed_model.verbose = true
    const preferring_finding = await snomed_model.search(db, {
      search: 'collapse',
      categories: [
        'finding' as const,
        'morphologic abnormality' as const,
        'disorder' as const,
      ],
    })

    assert(preferring_finding.results.some((result) =>
      result.primary_name === 'Collapse' &&
      result.secondary_text === 'finding'
    ))

    assert(
      !preferring_finding.results.some((result) =>
        result.primary_name === 'Collapse' &&
        result.secondary_text === 'morphologic abnormality'
      ),
    )

    const preferring_morphologic_abnormality = await snomed_model.search(db, {
      search: 'collapse',
      categories: [
        'morphologic abnormality' as const,
        'finding' as const,
        'disorder' as const,
      ],
    })

    assert(preferring_morphologic_abnormality.results.some((result) =>
      result.primary_name === 'Collapse' &&
      result.secondary_text === 'morphologic abnormality'
    ))

    assert(
      !preferring_morphologic_abnormality.results.some((result) =>
        result.primary_name === 'Collapse' &&
        result.secondary_text === 'finding'
      ),
    )
  })
})
