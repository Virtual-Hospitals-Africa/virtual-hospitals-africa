import { sql } from 'kysely'
import { TrxOrDb } from '../../../../types.ts'
import { pMap } from '../../../../util/inParallel.ts'
import { asText } from '../../../helpers.ts'
import { ParsedMedication, ParsedMedicationWhoseIngredientsAreSnomedConcepts, ParsedMedicationWithSnomedConceptMedicinalProduct } from './shared.ts'
import { assert } from 'std/assert/assert.ts'
import { humanReadableJson } from '../../../../util/humanReadableJson.ts'
import { HAS_ACTIVE_INGREDIENT, IS_MODIFICATION_OF } from '../../../../shared/snomed_concepts.ts'
import zip from '../../../../util/zip.ts'

export async function lookupDrugIngredientSnomedConceptIds(
  trx: TrxOrDb,
  ingredients: { name: string; forms: string[] }[],
): Promise<Map<string, string>> {
  const result = new Map<string, string>()
  const total = ingredients.length
  console.log(`Looking up SNOMED concepts for ${total} unique ingredient names...`)

  let i = 0
  await pMap(ingredients, async ({ name, forms }) => {
    i++
    if (i % 100 === 0 || i === 1 || i === total) {
      console.log(`  SNOMED lookup ${i}/${total}: "${name}"`)
    }
    const candidates = await trx
      .selectFrom('snomed_inferred_canonical_name_and_category')
      .innerJoin(
        'snomed_description',
        'snomed_inferred_canonical_name_and_category.id',
        'snomed_description.concept_id',
      )
      .select((eb) => [
        asText(eb, 'snomed_inferred_canonical_name_and_category.id').as('id'),
        'snomed_inferred_canonical_name_and_category.name',
        'snomed_inferred_canonical_name_and_category.category',
        sql<number>`max(similarity(term, ${name}))`.as('sim'),
      ])
      .where('category', 'in', ['substance', 'medicinal product'])
      .where(sql<boolean>`term % ${name}`)
      .groupBy('snomed_inferred_canonical_name_and_category.id')
      .orderBy(sql<number>`max(similarity(term, ${name}))`, 'desc')
      .limit(5)
      .execute()

    if (candidates.length === 0) return

    // Re-rank with category and form boosts
    const forms_lower = forms.map((f) => f.toLowerCase())
    let best = candidates[0]
    let best_score = -1
    for (const candidate of candidates) {
      let score = Number(candidate.sim)
      if (candidate.category === 'substance') score += 0.1
      const concept_name_lower = candidate.name.toLowerCase()
      if (forms_lower.some((f) => concept_name_lower.includes(f))) score += 0.15
      if (score > best_score) {
        best = candidate
        best_score = score
      }
    }
    result.set(name, best.id)
  })

  console.log(`  SNOMED lookups complete: ${result.size}/${total} matched`)
  return result
}

export async function lookupMedicationSnomedConceptIds(
  trx: TrxOrDb,
  medications: ParsedMedicationWhoseIngredientsAreSnomedConcepts[],
) {
  console.log(`  Looking up SNOMED products for ${medications.length} medications via HAS_ACTIVE_INGREDIENT relationships...`)

  const medications_to_drug_ingredient_joined_snomed_concept_strings = new Map<ParsedMedicationWhoseIngredientsAreSnomedConcepts, string>()
  const unique_drug_ingredient_joined_snomed_concept_strings = new Set<string>()
  for (const medication of medications) {
    const ingredient_concept_ids = new Set<string>()
    for (const dose of medication.doses) {
      for (const ingredient of dose.ingredients) {
        ingredient_concept_ids.add(ingredient.snomed_concept_id)
      }
    }

    const drug_ingredient_joined_snomed_concept_string = [...ingredient_concept_ids].sort().join('/')
    unique_drug_ingredient_joined_snomed_concept_strings.add(drug_ingredient_joined_snomed_concept_string)
    medications_to_drug_ingredient_joined_snomed_concept_strings.set(medication, drug_ingredient_joined_snomed_concept_string)
  }

  const total = unique_drug_ingredient_joined_snomed_concept_strings.size
  let i = 0
  const medicinal_products = await pMap(unique_drug_ingredient_joined_snomed_concept_strings, (ingredient_combination) => {
    i++
    if (i % 100 === 0 || i === 1 || i === total) {
      console.log(`  SNOMED lookup ${i}/${total}: "${ingredient_combination}"`)
    }
    const ingredient_concept_ids = ingredient_combination.split('/')

    // Find medicinal products that have a HAS_ACTIVE_INGREDIENT relationship
    // to a descendant-of-or-equal-to each of our ingredient SNOMED concepts
    let qb = trx
      .selectFrom('snomed_inferred_canonical_name_and_category')
      .select((eb) => [
        asText(eb, 'snomed_inferred_canonical_name_and_category.id').as('id'),
      ])
      .where('snomed_inferred_canonical_name_and_category.category', '=', 'medicinal product')
      .orderBy((eb) => eb('snomed_inferred_canonical_name_and_category.name', 'ilike', '%Product containing only%'), 'desc')

    for (const ingredient_snomed_concept_id of ingredient_concept_ids) {
      qb = qb.where(
        'snomed_inferred_canonical_name_and_category.id',
        'in',
        trx.selectFrom('snomed_relationship')
          .where('type_id', '=', HAS_ACTIVE_INGREDIENT.id)
          .select('source_id')
          .where((eb) =>
            eb.or([
              eb('destination_id', '=', ingredient_snomed_concept_id),
              eb(
                'destination_id',
                'in',
                eb.selectFrom('snomed_relationship as modification')
                  .where('modification.type_id', '=', IS_MODIFICATION_OF.id)
                  .select('modification.destination_id')
                  .where('modification.source_id', '=', ingredient_snomed_concept_id),
              ),
            ])
          ),
      )
    }
    return qb.executeTakeFirst()
  })

  const ingredients_to_medicinal_products = new Map(
    zip(unique_drug_ingredient_joined_snomed_concept_strings, medicinal_products),
  )

  const medications_with_medicinal_products: ParsedMedicationWithSnomedConceptMedicinalProduct[] = []
  const failures: ParsedMedicationWhoseIngredientsAreSnomedConcepts[] = []

  for (const [medication, drug_ingredient_joined_snomed_concept_string] of medications_to_drug_ingredient_joined_snomed_concept_strings) {
    const medicinal_product = ingredients_to_medicinal_products.get(drug_ingredient_joined_snomed_concept_string)
    if (medicinal_product) {
      medications_with_medicinal_products.push({
        ...medication,
        snomed_concept_id: medicinal_product.id,
      })
    } else {
      failures.push(medication)
    }
  }

  console.log(`  Medication SNOMED lookups: ${medications_with_medicinal_products.length}/${medications.length} matched, ${failures.length} failures`)
  return { medications_with_medicinal_products, failures }
}

export async function performLookups(trx: TrxOrDb, medications: ParsedMedication[], opts: { write_failure_files: boolean }) {
  // Collect unique ingredient names and the forms they appear with
  const forms_by_ingredient = new Map<string, Set<string>>()
  for (const medication of medications) {
    for (const dose of medication.doses) {
      for (const { name } of dose.ingredients) {
        let forms = forms_by_ingredient.get(name)
        if (!forms) {
          forms = new Set()
          forms_by_ingredient.set(name, forms)
        }
        forms.add(medication.form)
      }
    }
  }
  const ingredient_lookups = [...forms_by_ingredient].map(([name, forms]) => ({ name, forms: [...forms] }))
  console.log(`Found ${ingredient_lookups.length} unique ingredient names across ${medications.length} medications`)

  // Look up SNOMED concepts for each ingredient name (with form context for ranking)
  const snomed_by_name = await lookupDrugIngredientSnomedConceptIds(trx, ingredient_lookups)

  // Identify failed lookups
  const failed_names = new Set<string>()
  const failed_snomed: { name: string }[] = []
  for (const name of forms_by_ingredient.keys()) {
    if (!snomed_by_name.has(name)) {
      failed_names.add(name)
      failed_snomed.push({ name })
    }
  }

  if (failed_names.size) {
    const message = `SNOMED failures: ${failed_names.size} ingredient names had no match`
    assert(opts.write_failure_files, message)
    console.log(message)
    Deno.writeTextFileSync(
      './db/resources/12_inventory_medication_snomed_failed_lookups.json',
      humanReadableJson(failed_snomed),
    )
  }

  // Filter to medications where all ingredients have SNOMED matches, and attach snomed_concept_id to each ingredient
  const valid_medications: ParsedMedicationWhoseIngredientsAreSnomedConcepts[] = medications
    .filter((medication) => medication.doses.every((dose) => dose.ingredients.every(({ name }) => snomed_by_name.has(name))))
    .map((medication) => ({
      ...medication,
      doses: medication.doses.map((dose) => ({
        ...dose,
        ingredients: dose.ingredients.map((ing) => ({
          ...ing,
          snomed_concept_id: snomed_by_name.get(ing.name)!,
        })),
      })),
    }))
  console.log(`Filtered to ${valid_medications.length}/${medications.length} medications (all ingredients have SNOMED matches)`)

  // Look up SNOMED concepts for each medication as a whole product
  console.log('Looking up SNOMED concepts for medications...')
  const { medications_with_medicinal_products, failures: medication_snomed_failures } = await lookupMedicationSnomedConceptIds(trx, valid_medications)

  if (medication_snomed_failures.length) {
    const failed_lookups_json = humanReadableJson(medication_snomed_failures)
    assert(opts.write_failure_files, failed_lookups_json)
    Deno.writeTextFileSync(
      './db/resources/12_inventory_medication_snomed_product_failed_lookups.json',
      failed_lookups_json,
    )
  }

  return medications_with_medicinal_products
}
