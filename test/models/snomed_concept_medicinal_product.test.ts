import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { afterAll } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { assertRejects } from 'std/assert/assert_rejects.ts'
import db from '../../db/db.ts'
import { snomed_concept_medicinal_product } from '../../db/models/snomed_concept_medicinal_product.ts'
import { assertMatches } from '../../util/assertMatches.ts'
import { ExactTimeSpecification } from '../../types.ts'

const ONLY_CETIRIZINE = '775140005'
const ONLY_AMOXICILLIN = '774586009'
const ONLY_AMOXICILLIN_AND_CLAVULANIC_ACID = '774587000'
const AMOXICILLIN = '372687004'
const CLAVULANATE_POTASSIUM = '395938000'

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
        similarity: 1,
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
        ingredients: [{ snomed_concept_id: AMOXICILLIN, name: 'Amoxicillin', category: 'substance', strength: { value: 500, units: 'mg' } }],
        dosage_units: 'tablet',
        per_time: null,
      })

      const suspension = options.find((option) =>
        option.clinical_drug.name === 'Product containing precisely amoxicillin 50 milligram/1 milliliter conventional release oral suspension'
      )
      assertMatches(suspension, {
        route: { name: 'Oral', category: 'intended site' },
        ingredients: [{ name: 'Amoxicillin', strength: { value: 50, units: 'mg' } }],
        dosage_units: 'mL',
      })

      const routes = new Set(options.map((option) => option.route?.name))
      assert(routes.has('Oral') && routes.has('Parenteral'), `Expected oral and parenteral amoxicillin, got ${[...routes]}`)
    })

    itParallel('gives each active ingredient of a combination product its own strength', async () => {
      const options = await snomed_concept_medicinal_product.options(db, { snomed_concept_id: ONLY_AMOXICILLIN_AND_CLAVULANIC_ACID })

      const tablet = options.find((option) =>
        option.clinical_drug.name ===
          'Product containing precisely amoxicillin 500 milligram and clavulanic acid (as clavulanate potassium) 125 milligram/1 each conventional release oral tablet'
      )
      assertEquals(tablet, {
        clinical_drug: {
          snomed_concept_id: '323539009',
          name:
            'Product containing precisely amoxicillin 500 milligram and clavulanic acid (as clavulanate potassium) 125 milligram/1 each conventional release oral tablet',
          category: 'clinical drug',
        },
        form: { name: 'Tablet', category: 'basic dose form' },
        route: { name: 'Oral', category: 'intended site' },
        // Ordered by ingredient name
        ingredients: [
          { snomed_concept_id: AMOXICILLIN, name: 'Amoxicillin', category: 'substance', strength: { value: 500, units: 'mg' } },
          { snomed_concept_id: CLAVULANATE_POTASSIUM, name: 'Clavulanate potassium', category: 'substance', strength: { value: 125, units: 'mg' } },
        ],
        dosage_units: 'tablet',
        per_time: null,
      })

      const suspension = options.find((option) =>
        option.clinical_drug.name ===
          'Product containing precisely amoxicillin 50 milligram/1 milliliter and clavulanic acid (as clavulanate potassium) 12.5 milligram/1 milliliter conventional release oral suspension'
      )
      assertMatches(suspension, {
        route: { name: 'Oral', category: 'intended site' },
        ingredients: [
          { name: 'Amoxicillin', strength: { value: 50, units: 'mg' } },
          { name: 'Clavulanate potassium', strength: { value: 12.5, units: 'mg' } },
        ],
        dosage_units: 'mL',
      })
    })

    /*
      SNOMED strengths are "numerator unit / denominator value denominator unit". Across the clinical drugs
      of SNOMED the denominator value is always 1, except for transdermal patches' release rates (24, 16
      and 72 hour), so the denominator is what a dose is counted in:
        - a unit of presentation (tablet, vial, actuation...): the strength is just the numerator, "500 mg"
        - a measure (mL, g, mg): the strength is a concentration, "50 mg/mL", dosed by the mL
        - a time (hour): the strength is a rate, "2.5 mg/24h", dosed by the patch
    */
    const UNIT_CASES: {
      description: string
      medicinal_product: string
      clinical_drug: string
      ingredients: [name: string, value: number, units: string][]
      dosage_units: string
      per_time?: ExactTimeSpecification
    }[] = [
      {
        description: 'micrograms per tablet',
        medicinal_product: '775366001',
        clinical_drug: '1137624002',
        ingredients: [['Colecalciferol', 100, 'mcg']],
        dosage_units: 'tablet',
      },
      {
        description: 'grams per vial',
        medicinal_product: '775120003',
        clinical_drug: '1037391000202101',
        ingredients: [['Ceftriaxone sodium', 2, 'g']],
        dosage_units: 'vial',
      },
      {
        description: 'international units per vial',
        medicinal_product: '781165007',
        clinical_drug: '1163185009',
        ingredients: [['Nonacog alfa', 500, 'IU']],
        dosage_units: 'vial',
      },
      {
        description: 'micrograms per actuation, of two ingredients',
        medicinal_product: '774925003',
        clinical_drug: '1156248001',
        ingredients: [['Budesonide', 80, 'mcg'], ['Formoterol fumarate dihydrate', 4.5, 'mcg']],
        dosage_units: 'actuation',
      },
      {
        description: 'milligrams per suppository',
        medicinal_product: '774642007',
        clinical_drug: '1197389004',
        ingredients: [['Artesunate', 100, 'mg']],
        dosage_units: 'suppository',
      },
      {
        description: 'a unit SNOMED names but we have no abbreviation for (kilobecquerel), per capsule',
        medicinal_product: '775338009',
        clinical_drug: '353668002',
        ingredients: [['Cobalt-57', 18.5, 'kilobecquerel']],
        dosage_units: 'capsule',
      },
      {
        description: 'milligrams per gram, dosed by the gram',
        medicinal_product: '775396006',
        clinical_drug: '1010543004',
        ingredients: [['Crisaborole', 20, 'mg']],
        dosage_units: 'g',
      },
      {
        description: 'microliters per milliliter, dosed by the mL',
        medicinal_product: '776129005',
        clinical_drug: '1179480003',
        ingredients: [['Glycerol', 50, 'µL']],
        dosage_units: 'mL',
      },
      {
        description: 'units per milliliter, dosed by the mL',
        medicinal_product: '776343005',
        clinical_drug: '789679003',
        ingredients: [['Insulin glargine', 100, 'unit']],
        dosage_units: 'mL',
      },
      {
        description: 'million units per milliliter, dosed by the mL',
        medicinal_product: '776350009',
        clinical_drug: '784434008',
        ingredients: [['Interferon alfa-n3', 5, 'MU']],
        dosage_units: 'mL',
      },
      {
        description: 'micrograms per milligram of granules, with no unit of presentation',
        medicinal_product: '774361004',
        clinical_drug: '317508005',
        ingredients: [['Frangula', 80, 'mcg'], ['Sterculia gum', 620, 'mcg']],
        dosage_units: 'mg',
      },
      {
        description: 'milligrams per 24 hours, the release rate of a patch, dosed by the patch',
        medicinal_product: '777722004',
        clinical_drug: '1371025002',
        ingredients: [['Testosterone', 2.5, 'mg']],
        dosage_units: 'patch',
        per_time: { value: 24, units: 'hour' },
      },
      {
        description: 'milligrams per 72 hours, the release rate of a patch, dosed by the patch',
        medicinal_product: '777502000',
        clinical_drug: '1371033001',
        ingredients: [['Scopolamine', 1, 'mg']],
        dosage_units: 'patch',
        per_time: { value: 72, units: 'hour' },
      },
    ]

    itParallel.only('foo', async () => {
      const medicinal_product = '404800007'
      const medicinal_product_x = await snomed_concept_medicinal_product.getById(db, medicinal_product)
      const options = await snomed_concept_medicinal_product.options(db, { snomed_concept_id: medicinal_product })
      console.log({
        medicinal_product_x,
        options,
      })
    })

    // describeParallel('units of strength and dosage', () => {
    //   for (const { description, medicinal_product, clinical_drug, ingredients, dosage_units, per_time } of UNIT_CASES) {
    //     itParallel(description, async () => {
    //       const medicinal_product_x = await snomed_concept_medicinal_product.getById(db, medicinal_product)
    //       const options = await snomed_concept_medicinal_product.options(db, { snomed_concept_id: medicinal_product })
    //       console.log({
    //         medicinal_product_x,
    //         options
    //       })
    //       const option = options.find((option) => option.clinical_drug.snomed_concept_id === clinical_drug)
    //       assert(option, `Expected clinical drug ${clinical_drug} among the options of ${medicinal_product}`)
    //       assertEquals(
    //         option.ingredients.map((ingredient) => [ingredient.name, ingredient.strength.value, ingredient.strength.units]),
    //         ingredients,
    //       )
    //       assertEquals(option.dosage_units, dosage_units)
    //       assertEquals(option.per_time, per_time ?? null)
    //     })
    //   }
    // })

    itParallel('gives nothing for a concept with no clinical drugs', async () => {
      assertEquals(await snomed_concept_medicinal_product.options(db, { snomed_concept_id: '49727002' }), [])
    })
  })
})
