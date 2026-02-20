import { sql } from 'kysely'
import { SnomedConcept, TrxOrDb } from '../../../../types.ts'
import { pMap } from '../../../../util/inParallel.ts'
import { asText } from '../../../helpers.ts'
import {
  administration_methods_to_routes,
  AdministrationMethod,
  ParsedMedication,
  ParsedMedicationWhoseIngredientsAreSnomedConcepts,
  ParsedMedicationWithSnomedConceptMedicinalProduct,
} from './shared.ts'
import { assert } from 'std/assert/assert.ts'
import { humanReadableJson } from '../../../../util/humanReadableJson.ts'
import {
  GRAM,
  HAS_ACTIVE_INGREDIENT,
  HAS_CONCENTRATION_STRENGTH_DENOMINATOR_UNIT,
  HAS_CONCENTRATION_STRENGTH_DENOMINATOR_VALUE,
  HAS_CONCENTRATION_STRENGTH_NUMERATOR_UNIT,
  HAS_CONCENTRATION_STRENGTH_NUMERATOR_VALUE,
  HAS_MANUFACTURED_DOSE_FORM,
  HAS_PRECISE_ACTIVE_INGREDIENT,
  INTERNATIONAL_UNIT,
  IS_MODIFICATION_OF,
  LITER,
  MICROGRAM,
  MILLIGRAM,
  MILLILITER,
} from '../../../../shared/snomed_concepts.ts'
import { jsonObjectFrom } from '../../../helpers.ts'
import { rendered_snomed_concepts } from '../../../models/rendered_snomed_concepts.ts'
import matching from '../../../../util/matching.ts'
import { SnomedCategory } from '../../../../db.d.ts'

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

// Maps medication unit abbreviations to SNOMED concept IDs for units of measure
const TO_SNOMED_UNIT_CONCEPT_IDS: Record<string, SnomedConcept> = {
  'MG': MILLIGRAM,
  'G': GRAM,
  'ML': MILLILITER,
  'L': LITER,
  'MCG': MICROGRAM,
  'UG': MICROGRAM,
  'IU': INTERNATIONAL_UNIT,
}

// deno-lint-ignore require-await
async function attemptToFindPreciseMedication(
  trx: TrxOrDb,
  medication: ParsedMedicationWhoseIngredientsAreSnomedConcepts,
) {
  if (medication.doses.length !== 1) return
  const [dose] = medication.doses
  if (dose.ingredients.length !== 1) return
  const [ingredient] = dose.ingredients
  if (!ingredient.strength) return
  const description_is_units = new Set(['MG', 'G', 'ML', 'L', 'MCG', 'UG', 'IU']).has(dose.description)
  if (!description_is_units) return

  const denominator_unit_concept = TO_SNOMED_UNIT_CONCEPT_IDS[dose.description]
  const numerator_unit_concept = TO_SNOMED_UNIT_CONCEPT_IDS[ingredient.strength.units]
  if (!denominator_unit_concept || !numerator_unit_concept) return

  const numerator_value = parseFloat(ingredient.strength.value)
  const denominator_value = parseFloat(dose.value)
  if (isNaN(numerator_value) || isNaN(denominator_value)) return

  const ingredient_snomed_concept_id = ingredient.snomed_concept_id

  const qb = trx
    .selectFrom('snomed_inferred_canonical_name_and_category as precise_medication')
    // HAS_PRECISE_ACTIVE_INGREDIENT → ingredient concept (or its modification)
    .innerJoin('snomed_relationship as pai', (join) =>
      join
        .onRef('pai.source_id', '=', 'precise_medication.id')
        .on('pai.type_id', '=', HAS_PRECISE_ACTIVE_INGREDIENT.id)
        .on((eb) =>
          eb.or([
            eb('pai.destination_id', '=', ingredient_snomed_concept_id),
            eb(
              'pai.destination_id',
              'in',
              eb.selectFrom('snomed_relationship as modification')
                .where('modification.type_id', '=', IS_MODIFICATION_OF.id)
                .select('modification.destination_id')
                .where('modification.source_id', '=', ingredient_snomed_concept_id),
            ),
          ])
        ))
    // Has concentration strength numerator value
    .innerJoin('snomed_relationship_concrete_values as nv', (join) =>
      join
        .onRef('nv.source_id', '=', 'precise_medication.id')
        .on('nv.type_id', '=', HAS_CONCENTRATION_STRENGTH_NUMERATOR_VALUE.id)
        .on('nv.value', '=', `#${numerator_value}`)
        .on('nv.active', '=', true))
    // Has concentration strength numerator unit
    .innerJoin('snomed_relationship as nu', (join) =>
      join
        .onRef('nu.source_id', '=', 'precise_medication.id')
        .on('nu.type_id', '=', HAS_CONCENTRATION_STRENGTH_NUMERATOR_UNIT.id)
        .on('nu.destination_id', '=', numerator_unit_concept.id)
        .on('nu.active', '=', true))
    // Has concentration strength denominator value
    .innerJoin('snomed_relationship_concrete_values as dv', (join) =>
      join
        .onRef('dv.source_id', '=', 'precise_medication.id')
        .on('dv.type_id', '=', HAS_CONCENTRATION_STRENGTH_DENOMINATOR_VALUE.id)
        .on('dv.value', '=', `#${denominator_value}`)
        .on('dv.active', '=', true))
    // Has concentration strength denominator unit
    .innerJoin('snomed_relationship as du', (join) =>
      join
        .onRef('du.source_id', '=', 'precise_medication.id')
        .on('du.type_id', '=', HAS_CONCENTRATION_STRENGTH_DENOMINATOR_UNIT.id)
        .on('du.destination_id', '=', denominator_unit_concept.id)
        .on('du.active', '=', true))
    .select((eb) => [
      asText(eb, 'precise_medication.id').as('id'),
      'precise_medication.name',
      jsonObjectFrom(
        rendered_snomed_concepts.baseQuery(trx, {})
          .innerJoin('snomed_relationship as manufactured_dose_form', (join) =>
            join
              .onRef('manufactured_dose_form.source_id', '=', eb.ref('precise_medication.id'))
              .on('manufactured_dose_form.type_id', '=', HAS_MANUFACTURED_DOSE_FORM.id)
              .on('manufactured_dose_form.active', '=', true)
              .onRef('manufactured_dose_form.destination_id', '=', 'snomed_concept.id')),
      ).as('manufactured_dose_form'),
    ])
    .where('precise_medication.category', '=', 'clinical drug')

  return qb.executeTakeFirst()
}

export async function lookupMedicationSnomedConceptIds(
  trx: TrxOrDb,
  medications: ParsedMedicationWhoseIngredientsAreSnomedConcepts[],
) {
  console.log(`  Looking up SNOMED products for ${medications.length} medications via HAS_ACTIVE_INGREDIENT relationships...`)

  // Cache promises by ingredient combination string so identical queries are only fired once
  const ingredient_combination_queries = new Map<string, ReturnType<typeof Promise.resolve<{ id: string } | undefined>>>()

  const total = medications.length
  let i = 0
  const results = await pMap(medications, async (medication) => {
    i++
    if (i % 100 === 0 || i === 1 || i === total) {
      console.log(`  SNOMED lookup ${i}/${total}`)
    }

    const precise_medication = await attemptToFindPreciseMedication(trx, medication)
    if (precise_medication) {
      return { type: 'precise', medication, precise_medication } as const
    }

    const ingredient_concept_ids = new Set<string>()
    for (const dose of medication.doses) {
      for (const ingredient of dose.ingredients) {
        ingredient_concept_ids.add(ingredient.snomed_concept_id)
      }
    }
    const ingredient_combination = [...ingredient_concept_ids].sort().join('/')

    if (!ingredient_combination_queries.has(ingredient_combination)) {
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
      // Exclude products that have more active ingredients than we specified
      qb = qb.where(
        sql<boolean>`(
          SELECT COUNT(*) FROM snomed_relationship
          WHERE source_id = snomed_inferred_canonical_name_and_category.id
            AND type_id = ${HAS_ACTIVE_INGREDIENT.id}
        ) = ${ingredient_concept_ids.size}`,
      )
      // Store the promise before awaiting so parallel tasks with the same combination reuse it
      ingredient_combination_queries.set(ingredient_combination, qb.executeTakeFirst())
    }

    const medicinal_product = await ingredient_combination_queries.get(ingredient_combination)!
    return { type: 'ingredient', medication, medicinal_product } as const
  })

  const medications_with_medicinal_products: ParsedMedicationWithSnomedConceptMedicinalProduct[] = []
  const failures: ParsedMedicationWhoseIngredientsAreSnomedConcepts[] = []

  for (const result of results) {
    if (result.type === 'precise') {
      const { medication, precise_medication } = result
      let { form, routes } = medication
      if (precise_medication.manufactured_dose_form) {
        const basic_dose_form = precise_medication.manufactured_dose_form.relationships.find(matching({ type_name: 'Has basic dose form' }))
        if (basic_dose_form) {
          form = basic_dose_form.destination_name.toUpperCase()
        }
        const administration_method = precise_medication.manufactured_dose_form.relationships.find(matching({
          destination_category: 'administration method' as SnomedCategory,
        }))
        if (administration_method) {
          routes = administration_methods_to_routes[administration_method.destination_name as unknown as AdministrationMethod]
        }
      }
      medications_with_medicinal_products.push({
        ...medication,
        form,
        routes,
        snomed_concept_id: precise_medication.id,
      })
    } else {
      const { medication, medicinal_product } = result
      if (medicinal_product) {
        medications_with_medicinal_products.push({
          ...medication,
          snomed_concept_id: medicinal_product.id,
        })
      } else {
        failures.push(medication)
      }
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
