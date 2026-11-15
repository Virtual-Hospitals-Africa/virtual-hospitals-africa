import { afterAll, before } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../db/db.ts'
import { addTestEmployeeWithSession } from 'test/_helpers/employees.ts'
import { createTestOrganization } from 'test/_helpers/organizations.ts'
import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import waitUntilTestServerUp from 'test/_helpers/waitUntilTestServerUp.ts'
import { assertMatches } from '../../util/assertMatches.ts'

async function nurse() {
  const clinic = await createTestOrganization(db)
  return addTestEmployeeWithSession(db, { role: 'nurse', organization_id: clinic.id })
}

describeParallel('/app/snomed/medicinal-product', () => {
  before(waitUntilTestServerUp)
  afterAll(() => db.destroy())

  itParallel('searches medicinal products by active ingredient', async () => {
    const { fetchJSON } = await nurse()
    const first_page = await fetchJSON('/app/snomed/medicinal-product?search=cetirizine')
    assertMatches(first_page, { page: 1, rows_per_page: 10 })
    const [first] = first_page.results
    assertEquals(first, {
      id: '775140005',
      name: 'Cetirizine',
      description: null,
      snomed_concept: { snomed_concept_id: '775140005', name: 'Product containing only cetirizine', category: 'medicinal product' },
      medication_id: null,
      brand_name: null,
    })
  })

  describeParallel('/app/snomed/medicinal-product-options', () => {
    itParallel('gives the options of a medicinal product by name or by id', async () => {
      const { fetchJSON } = await nurse()
      const [by_name, by_id] = await Promise.all([
        fetchJSON(`/app/snomed/medicinal-product-options?${new URLSearchParams({ name: 'Product containing only amoxicillin' })}`),
        fetchJSON('/app/snomed/medicinal-product-options?snomed_concept_id=774586009'),
      ])
      assertEquals(by_name, by_id)
      assert(by_name.options.length > 5)
      assertMatches(
        by_name.options.find((option: { clinical_drug: { snomed_concept_id: string } }) => option.clinical_drug.snomed_concept_id === '374646004'),
        {
          form: { name: 'Tablet', category: 'basic dose form' },
          route: { name: 'Oral', category: 'intended site' },
          strengths: [{ value: '500', units: 'mg' }],
          dosage_units: 'tablet',
        },
      )
    })

    itParallel('responds 400 without a medicinal product', async () => {
      const { fetch } = await nurse()
      const response = await fetch('/app/snomed/medicinal-product-options', { headers: { Accept: 'application/json' } })
      await response.body?.cancel()
      assertEquals(response.status, 400)
    })
  })
})
