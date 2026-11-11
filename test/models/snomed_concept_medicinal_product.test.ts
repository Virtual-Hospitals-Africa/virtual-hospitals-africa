import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { afterAll } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { assertRejects } from 'std/assert/assert_rejects.ts'
import db from '../../db/db.ts'
import { snomed_concept_medicinal_product } from '../../db/models/snomed_concept_medicinal_product.ts'
import { assertMatches } from '../../util/assertMatches.ts'

const ONLY_CETIRIZINE = '775140005'
const ONLY_AMOXICILLIN = '774586009'

describeParallel('db/models/snomed_concept_medicinal_product.ts', () => {
  afterAll(() => db.destroy())

  describeParallel('search', () => {
    itParallel('finds medicinal products by active ingredient, single ingredient products first, named by their ingredients', async () => {
      const { results } = await snomed_concept_medicinal_product.search(db, { search: 'cetirizine' }, { rows_per_page: 50 })
      const generics = results.filter((result) => !result.brand_name)
      const [first] = generics
      assertEquals(first, {
        id: ONLY_CETIRIZINE,
        name: 'Cetirizine',
        description: null,
        snomed_concept: {
          snomed_concept_id: ONLY_CETIRIZINE,
          name: 'Product containing only cetirizine',
          category: 'medicinal product',
        },
        medication_id: null,
        brand_name: null,
      })
      assert(generics.some((result) => result.name === 'Cetirizine + pseudoephedrine'))
      assert(generics.every((result) => result.snomed_concept.name.startsWith('Product containing only ')))
    })

    itParallel('matches on the start of an ingredient name', async () => {
      const { results } = await snomed_concept_medicinal_product.search(db, { search: 'amoxi' })
      const [first] = results
      assertMatches(first, { id: ONLY_AMOXICILLIN, name: 'Amoxicillin' })
    })

    itParallel('includes brands of the matching products, with the active ingredients as their description', async () => {
      const { results } = await snomed_concept_medicinal_product.search(db, { search: 'cetirizine' }, { rows_per_page: 200 })
      const brands = results.filter((result) => result.brand_name)
      assert(brands.length, 'Expected at least one brand of cetirizine')
      for (const brand of brands) {
        assertEquals(brand.name, brand.brand_name)
        assertEquals(brand.id, brand.medication_id)
        assert(brand.description)
        assertEquals(brand.snomed_concept.category, 'medicinal product')
      }
      const brand_names = brands.map((brand) => brand.brand_name)
      assertEquals(brand_names.length, new Set(brand_names).size, 'Each trade name is expected once')
    })

    itParallel('finds a brand by its trade name', async () => {
      const { results } = await snomed_concept_medicinal_product.search(db, { search: 'zyrtec' })
      const [first] = results
      assert(first.brand_name?.toLowerCase().includes('zyrtec'), `Expected a Zyrtec brand first, got ${first.name}`)
      assertEquals(first.description, 'Cetirizine')
      assertEquals(first.snomed_concept.snomed_concept_id, ONLY_CETIRIZINE)
    })

    itParallel('rejects a search too short to be meaningful', async () => {
      await assertRejects(() => snomed_concept_medicinal_product.search(db, { search: 'a' }))
    })
  })

  describeParallel('options', () => {
    itParallel('gives the forms, routes and strengths of the clinical drugs of a medicinal product', async () => {
      const options = await snomed_concept_medicinal_product.options(db, { snomed_concept_id: ONLY_AMOXICILLIN })

      const tablet_500 = options.find((option) =>
        option.clinical_drug.name === 'Product containing precisely amoxicillin 500 milligram/1 each conventional release oral tablet'
      )
      assertEquals(tablet_500, {
        clinical_drug: {
          snomed_concept_id: '374646004',
          name: 'Product containing precisely amoxicillin 500 milligram/1 each conventional release oral tablet',
          category: 'clinical drug',
        },
        form: { name: 'Tablet', category: 'basic dose form' },
        route: { name: 'Oral', category: 'intended site' },
        strengths: [{ value: '500', units: 'mg' }],
        dosage_units: 'tablet',
      })

      const suspension = options.find((option) =>
        option.clinical_drug.name === 'Product containing precisely amoxicillin 50 milligram/1 milliliter conventional release oral suspension'
      )
      assertMatches(suspension, {
        route: { name: 'Oral', category: 'intended site' },
        strengths: [{ value: '50', units: 'mg/mL' }],
        dosage_units: 'mL',
      })

      const routes = new Set(options.map((option) => option.route?.name))
      assert(routes.has('Oral') && routes.has('Parenteral'), `Expected oral and parenteral amoxicillin, got ${[...routes]}`)
    })

    itParallel('gives nothing for a concept with no clinical drugs', async () => {
      assertEquals(await snomed_concept_medicinal_product.options(db, { snomed_concept_id: '49727002' }), [])
    })
  })
})
