import { afterAll, before } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import waitUntilTestServerUp from 'test/_helpers/waitUntilTestServerUp.ts'
import { assertMatches } from '../../util/assertMatches.ts'
import { route } from '../_route.ts'
import { assert } from 'std/assert/assert.ts'

describeParallel.skip('/clinical_decision_support_tools/icd10', () => {
  before(waitUntilTestServerUp)
  afterAll(() => db.destroy())

  itParallel('can find a headache', async () => {
    const response = await fetch(route + '/clinical_decision_support_tools/icd10?search=headache')
    const { results } = await response.json()
    assertMatches(results[0], {
      code: 'R51',
      category: 'R51',
      description: 'Headache',
    })
  })

  itParallel('can find tuberculosis', async () => {
    const response = await fetch(route + '/clinical_decision_support_tools/icd10?search=tuberculosis')
    const { results } = await response.json()
    assertMatches(results[0], {
      code: 'A18',
      category: 'A18',
      description: 'Tuberculosis of other organs',
    })
  })

  itParallel('can find meningitis', async () => {
    const response = await fetch(route + '/clinical_decision_support_tools/icd10?page=1&search=meningitis')
    const { results } = await response.json()
    assert(results[0].description.includes('eningitis'))
    // assertMatches(results[0], {
    //   code: 'A18',
    //   category: 'A18',
    //   description: 'Tuberculosis of other organs',
    // })
  })
})
