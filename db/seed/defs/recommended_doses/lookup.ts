// import { sql } from 'kysely'
// import { SnomedConcept, TrxOrDb } from '../../../../types.ts'
// import { pMap } from '../../../../util/inParallel.ts'
// import { asText } from '../../../helpers.ts'
// import {
//   administration_methods_to_routes,
//   AdministrationMethod,
//   ParsedMedication,
//   ParsedMedicationWhoseIngredientsAreSnomedConcepts,
//   ParsedMedicationWithSnomedConceptMedicinalProduct,
//   ParsedRecommendedDose,
//   ResolvedIngredient,
//   ResolvedRecommendedDose,
//   ResolvedSchedule,
// } from './shared.ts'
// import { assert } from 'std/assert/assert.ts'
// import { humanReadableJson } from '../../../../util/humanReadableJson.ts'
// import {
//   GRAM,
//   HAS_ACTIVE_INGREDIENT,
//   HAS_CONCENTRATION_STRENGTH_DENOMINATOR_UNIT,
//   HAS_CONCENTRATION_STRENGTH_DENOMINATOR_VALUE,
//   HAS_CONCENTRATION_STRENGTH_NUMERATOR_UNIT,
//   HAS_CONCENTRATION_STRENGTH_NUMERATOR_VALUE,
//   HAS_MANUFACTURED_DOSE_FORM,
//   HAS_PRECISE_ACTIVE_INGREDIENT,
//   INTERNATIONAL_UNIT,
//   IS_MODIFICATION_OF,
//   LITER,
//   MICROGRAM,
//   MILLIGRAM,
//   MILLILITER,
// } from '../../../../shared/snomed_concepts.ts'
// import { jsonObjectFrom } from '../../../helpers.ts'
// import { rendered_snomed_concepts } from '../../../models/rendered_snomed_concepts.ts'
// import matching from '../../../../util/matching.ts'
// import { SnomedCategory } from '../../../../db.d.ts'

// import isKeyOf from '../../../../util/isKeyOf.ts'

// // ─── Inventory-medication lookups (retained from original) ──────────────────

// export async function lookupDrugIngredientSnomedConceptIds(
//   trx: TrxOrDb,
//   ingredients: { name: string; forms: string[] }[],
// ): Promise<Map<string, string>> {
//   const result = new Map<string, string>()
//   const total = ingredients.length
//   console.log(`Looking up SNOMED concepts for ${total} unique ingredient names...`)

//   let i = 0
//   await pMap(ingredients, async ({ name, forms }) => {
//     i++
//     if (i % 100 === 0 || i === 1 || i === total) {
//       console.log(`  SNOMED lookup ${i}/${total}: "${name}"`)
//     }
//     const candidates = await trx
//       .selectFrom('snomed_inferred_canonical_name_and_category')
//       .innerJoin(
//         'snomed_description',
//         'snomed_inferred_canonical_name_and_category.id',
//         'snomed_description.concept_id',
//       )
//       .select((eb) => [
//         asText(eb, 'snomed_inferred_canonical_name_and_category.id').as('id'),
//         'snomed_inferred_canonical_name_and_category.name',
//         'snomed_inferred_canonical_name_and_category.category',
//         sql<number>`max(similarity(term, ${name}))`.as('sim'),
//       ])
//       .where('category', 'in', ['substance', 'medicinal product'])
//       .where(sql<boolean>`term % ${name}`)
//       .groupBy('snomed_inferred_canonical_name_and_category.id')
//       .orderBy(sql<number>`max(similarity(term, ${name}))`, 'desc')
//       .limit(5)
//       .execute()

//     if (candidates.length === 0) return

//     const forms_lower = forms.map((f) => f.toLowerCase())
//     let best = candidates[0]
//     let best_score = -1
//     for (const candidate of candidates) {
//       let score = Number(candidate.sim)
//       if (candidate.category === 'substance') score += 0.1
//       const concept_name_lower = candidate.name.toLowerCase()
//       if (forms_lower.some((f) => concept_name_lower.includes(f))) score += 0.15
//       if (score > best_score) {
//         best = candidate
//         best_score = score
//       }
//     }
//     result.set(name, best.id)
//   })

//   console.log(`  SNOMED lookups complete: ${result.size}/${total} matched`)
//   return result
// }

// const TO_SNOMED_UNIT_CONCEPT_IDS: Record<string, SnomedConcept> = {
//   'MG': MILLIGRAM,
//   'G': GRAM,
//   'ML': MILLILITER,
//   'L': LITER,
//   'MCG': MICROGRAM,
//   'UG': MICROGRAM,
//   'IU': INTERNATIONAL_UNIT,
// }

// // deno-lint-ignore require-await
// async function attemptToFindPreciseMedication(
//   trx: TrxOrDb,
//   medication: ParsedMedicationWhoseIngredientsAreSnomedConcepts,
// ) {
//   if (medication.doses.length !== 1) return
//   const [dose] = medication.doses
//   if (dose.ingredients.length !== 1) return
//   const [ingredient] = dose.ingredients
//   if (!ingredient.strength) return
//   const description_is_units = isKeyOf(dose.description, TO_SNOMED_UNIT_CONCEPT_IDS)
//   if (!description_is_units) return

//   const denominator_unit_concept = TO_SNOMED_UNIT_CONCEPT_IDS[dose.description]
//   const numerator_unit_concept = TO_SNOMED_UNIT_CONCEPT_IDS[ingredient.strength.units]
//   if (!denominator_unit_concept || !numerator_unit_concept) return

//   if (!ingredient.strength.value) return
//   const numerator_value = parseFloat(ingredient.strength.value)
//   const denominator_value = parseFloat(dose.value)
//   if (isNaN(numerator_value) || isNaN(denominator_value)) return

//   const ingredient_snomed_concept_id = ingredient.snomed_concept_id

//   const qb = trx
//     .selectFrom('snomed_inferred_canonical_name_and_category as precise_medication')
//     .innerJoin('snomed_relationship as pai', (join) =>
//       join
//         .onRef('pai.source_id', '=', 'precise_medication.id')
//         .on('pai.type_id', '=', HAS_PRECISE_ACTIVE_INGREDIENT.id)
//         .on((eb) =>
//           eb.or([
//             eb('pai.destination_id', '=', ingredient_snomed_concept_id),
//             eb(
//               'pai.destination_id',
//               'in',
//               eb.selectFrom('snomed_relationship as modification')
//                 .where('modification.type_id', '=', IS_MODIFICATION_OF.id)
//                 .select('modification.destination_id')
//                 .where('modification.source_id', '=', ingredient_snomed_concept_id),
//             ),
//           ])
//         ))
//     .innerJoin('snomed_relationship_concrete_values as nv', (join) =>
//       join
//         .onRef('nv.source_id', '=', 'precise_medication.id')
//         .on('nv.type_id', '=', HAS_CONCENTRATION_STRENGTH_NUMERATOR_VALUE.id)
//         .on('nv.value', '=', `#${numerator_value}`)
//         .on('nv.active', '=', true))
//     .innerJoin('snomed_relationship as nu', (join) =>
//       join
//         .onRef('nu.source_id', '=', 'precise_medication.id')
//         .on('nu.type_id', '=', HAS_CONCENTRATION_STRENGTH_NUMERATOR_UNIT.id)
//         .on('nu.destination_id', '=', numerator_unit_concept.id)
//         .on('nu.active', '=', true))
//     .innerJoin('snomed_relationship_concrete_values as dv', (join) =>
//       join
//         .onRef('dv.source_id', '=', 'precise_medication.id')
//         .on('dv.type_id', '=', HAS_CONCENTRATION_STRENGTH_DENOMINATOR_VALUE.id)
//         .on('dv.value', '=', `#${denominator_value}`)
//         .on('dv.active', '=', true))
//     .innerJoin('snomed_relationship as du', (join) =>
//       join
//         .onRef('du.source_id', '=', 'precise_medication.id')
//         .on('du.type_id', '=', HAS_CONCENTRATION_STRENGTH_DENOMINATOR_UNIT.id)
//         .on('du.destination_id', '=', denominator_unit_concept.id)
//         .on('du.active', '=', true))
//     .select((eb) => [
//       asText(eb, 'precise_medication.id').as('id'),
//       'precise_medication.name',
//       jsonObjectFrom(
//         rendered_snomed_concepts.baseQuery(trx, {})
//           .innerJoin('snomed_relationship as manufactured_dose_form', (join) =>
//             join
//               .onRef('manufactured_dose_form.source_id', '=', eb.ref('precise_medication.id'))
//               .on('manufactured_dose_form.type_id', '=', HAS_MANUFACTURED_DOSE_FORM.id)
//               .on('manufactured_dose_form.active', '=', true)
//               .onRef('manufactured_dose_form.destination_id', '=', 'snomed_concept.id')),
//       ).as('manufactured_dose_form'),
//     ])
//     .where('precise_medication.category', '=', 'clinical drug')

//   return qb.executeTakeFirst()
// }

// export async function lookupMedicationSnomedConceptIds(
//   trx: TrxOrDb,
//   medications: ParsedMedicationWhoseIngredientsAreSnomedConcepts[],
// ) {
//   console.log(`  Looking up SNOMED products for ${medications.length} medications via HAS_ACTIVE_INGREDIENT relationships...`)

//   const ingredient_combination_queries = new Map<string, ReturnType<typeof Promise.resolve<{ id: string } | undefined>>>()

//   const total = medications.length
//   let i = 0
//   const results = await pMap(medications, async (medication) => {
//     i++
//     if (i % 100 === 0 || i === 1 || i === total) {
//       console.log(`  SNOMED lookup ${i}/${total}`)
//     }

//     const precise_medication = await attemptToFindPreciseMedication(trx, medication)
//     if (precise_medication) {
//       return { type: 'precise', medication, precise_medication } as const
//     }

//     const ingredient_concept_ids = new Set<string>()
//     for (const dose of medication.doses) {
//       for (const ingredient of dose.ingredients) {
//         ingredient_concept_ids.add(ingredient.snomed_concept_id)
//       }
//     }
//     const ingredient_combination = [...ingredient_concept_ids].sort().join('/')

//     if (!ingredient_combination_queries.has(ingredient_combination)) {
//       let qb = trx
//         .selectFrom('snomed_inferred_canonical_name_and_category')
//         .select((eb) => [
//           asText(eb, 'snomed_inferred_canonical_name_and_category.id').as('id'),
//         ])
//         .where('snomed_inferred_canonical_name_and_category.category', '=', 'medicinal product')
//         .orderBy((eb) => eb('snomed_inferred_canonical_name_and_category.name', 'ilike', '%Product containing only%'), 'desc')

//       for (const ingredient_snomed_concept_id of ingredient_concept_ids) {
//         qb = qb.where(
//           'snomed_inferred_canonical_name_and_category.id',
//           'in',
//           trx.selectFrom('snomed_relationship')
//             .where('type_id', '=', HAS_ACTIVE_INGREDIENT.id)
//             .select('source_id')
//             .where((eb) =>
//               eb.or([
//                 eb('destination_id', '=', ingredient_snomed_concept_id),
//                 eb(
//                   'destination_id',
//                   'in',
//                   eb.selectFrom('snomed_relationship as modification')
//                     .where('modification.type_id', '=', IS_MODIFICATION_OF.id)
//                     .select('modification.destination_id')
//                     .where('modification.source_id', '=', ingredient_snomed_concept_id),
//                 ),
//               ])
//             ),
//         )
//       }
//       qb = qb.where(
//         sql<boolean>`(
//           SELECT COUNT(*) FROM snomed_relationship
//           WHERE source_id = snomed_inferred_canonical_name_and_category.id
//             AND type_id = ${HAS_ACTIVE_INGREDIENT.id}
//         ) = ${ingredient_concept_ids.size}`,
//       )
//       ingredient_combination_queries.set(ingredient_combination, qb.executeTakeFirst())
//     }

//     const medicinal_product = await ingredient_combination_queries.get(ingredient_combination)!
//     return { type: 'ingredient', medication, medicinal_product } as const
//   })

//   const medications_with_medicinal_products: ParsedMedicationWithSnomedConceptMedicinalProduct[] = []
//   const failures: ParsedMedicationWhoseIngredientsAreSnomedConcepts[] = []

//   for (const result of results) {
//     if (result.type === 'precise') {
//       const { medication, precise_medication } = result
//       let { form, routes } = medication
//       if (precise_medication.manufactured_dose_form) {
//         const basic_dose_form = precise_medication.manufactured_dose_form.relationships.find(matching({ type_name: 'Has basic dose form' }))
//         if (basic_dose_form) {
//           form = basic_dose_form.destination_name.toUpperCase()
//         }
//         const administration_method = precise_medication.manufactured_dose_form.relationships.find(matching({
//           destination_category: 'administration method' as SnomedCategory,
//         }))
//         if (administration_method) {
//           routes = administration_methods_to_routes[administration_method.destination_name as unknown as AdministrationMethod]
//         }
//       }
//       medications_with_medicinal_products.push({
//         ...medication,
//         form,
//         routes,
//         snomed_concept_id: precise_medication.id,
//       })
//     } else {
//       const { medication, medicinal_product } = result
//       if (medicinal_product) {
//         medications_with_medicinal_products.push({
//           ...medication,
//           snomed_concept_id: medicinal_product.id,
//         })
//       } else {
//         failures.push(medication)
//       }
//     }
//   }

//   console.log(`  Medication SNOMED lookups: ${medications_with_medicinal_products.length}/${medications.length} matched, ${failures.length} failures`)
//   return { medications_with_medicinal_products, failures }
// }

// export async function performLookups(trx: TrxOrDb, medications: ParsedMedication[], opts: { write_failure_files: boolean }) {
//   const forms_by_ingredient = new Map<string, Set<string>>()
//   for (const medication of medications) {
//     for (const dose of medication.doses) {
//       for (const { ingredient_name: name } of dose.ingredients) {
//         let forms = forms_by_ingredient.get(name)
//         if (!forms) {
//           forms = new Set()
//           forms_by_ingredient.set(name, forms)
//         }
//         forms.add(medication.form)
//       }
//     }
//   }
//   const ingredient_lookups = [...forms_by_ingredient].map(([name, forms]) => ({ name, forms: [...forms] }))
//   console.log(`Found ${ingredient_lookups.length} unique ingredient names across ${medications.length} medications`)

//   const snomed_by_name = await lookupDrugIngredientSnomedConceptIds(trx, ingredient_lookups)

//   const failed_names = new Set<string>()
//   const failed_snomed: { name: string }[] = []
//   for (const name of forms_by_ingredient.keys()) {
//     if (!snomed_by_name.has(name)) {
//       failed_names.add(name)
//       failed_snomed.push({ name })
//     }
//   }

//   if (failed_names.size) {
//     const message = `SNOMED failures: ${failed_names.size} ingredient names had no match`
//     assert(opts.write_failure_files, message)
//     console.log(message)
//     Deno.writeTextFileSync(
//       './db/resources/25_inventory_medication_snomed_failed_lookups.json',
//       humanReadableJson(failed_snomed),
//     )
//   }

//   const valid_medications: ParsedMedicationWhoseIngredientsAreSnomedConcepts[] = medications
//     .filter((medication) => medication.doses.every((dose) => dose.ingredients.every(({ ingredient_name }) => snomed_by_name.has(ingredient_name))))
//     .map((medication) => ({
//       ...medication,
//       doses: medication.doses.map((dose) => ({
//         ...dose,
//         ingredients: dose.ingredients.map((ing) => ({
//           ...ing,
//           snomed_concept_id: snomed_by_name.get(ing.ingredient_name)!,
//         })),
//       })),
//     }))
//   console.log(`Filtered to ${valid_medications.length}/${medications.length} medications (all ingredients have SNOMED matches)`)

//   console.log('Looking up SNOMED concepts for medications...')
//   const { medications_with_medicinal_products, failures: medication_snomed_failures } = await lookupMedicationSnomedConceptIds(trx, valid_medications)

//   if (medication_snomed_failures.length) {
//     const failed_lookups_json = humanReadableJson(medication_snomed_failures)
//     assert(opts.write_failure_files, failed_lookups_json)
//     Deno.writeTextFileSync(
//       './db/resources/25_inventory_medication_snomed_product_failed_lookups.json',
//       failed_lookups_json,
//     )
//   }

//   return medications_with_medicinal_products
// }

// // ─── EML-specific lookup functions ──────────────────────────────────────────

// /** SNOMED unit concept IDs keyed by normalised unit string */
// const UNIT_SNOMED_MAP: Record<string, string> = {
//   mg: MILLIGRAM.id,
//   g: GRAM.id,
//   ml: MILLILITER.id,
//   l: LITER.id,
//   mcg: MICROGRAM.id,
//   iu: INTERNATIONAL_UNIT.id,
// }

// export function lookupUnitSnomedConceptId(unit: string | null): string | null {
//   if (!unit) return null
//   return UNIT_SNOMED_MAP[unit.toLowerCase()] ?? null
// }

// /**
//  * Looks up SNOMED concept IDs for a list of unique text labels using trigram
//  * similarity search, filtered by the given categories.
//  */
// async function lookupByTextSimilarity(
//   trx: TrxOrDb,
//   names: string[],
//   categories: SnomedCategory[],
//   label: string,
// ): Promise<Map<string, string>> {
//   const result = new Map<string, string>()
//   if (names.length === 0) return result

//   console.log(`Looking up SNOMED ${label} for ${names.length} unique values...`)
//   await pMap(names, async (name) => {
//     const candidates = await trx
//       .selectFrom('snomed_inferred_canonical_name_and_category')
//       .innerJoin('snomed_description', 'snomed_inferred_canonical_name_and_category.id', 'snomed_description.concept_id')
//       .select((eb) => [
//         asText(eb, 'snomed_inferred_canonical_name_and_category.id').as('id'),
//         'snomed_inferred_canonical_name_and_category.name',
//         sql<number>`max(similarity(term, ${name}))`.as('sim'),
//       ])
//       .where('category', 'in', categories)
//       .where(sql<boolean>`term % ${name}`)
//       .groupBy('snomed_inferred_canonical_name_and_category.id')
//       .orderBy(sql<number>`max(similarity(term, ${name}))`, 'desc')
//       .limit(1)
//       .execute()

//     if (candidates.length > 0) result.set(name, candidates[0].id)
//   })

//   console.log(`  ${label} lookups: ${result.size}/${names.length} matched`)
//   return result
// }

// /** Normalises an EML dosage-form string to the primary form for SNOMED lookup */
// function primaryForm(form: string): string {
//   // "Tablet/Capsule" → "Tablet"; "Cream/Ointment" → "Cream"
//   return form.split('/')[0].trim()
// }

// /** Normalises an EML route string to a short term for SNOMED lookup */
// function primaryRoute(route: string): string {
//   const r = route.trim()
//   // "Intravenous injection (IV)" → "Intravenous route"
//   // "Intramuscular (IM)"         → "Intramuscular route"
//   // "Oral"                       → "Oral route"
//   if (/intravenous/i.test(r)) return 'Intravenous route'
//   if (/intramuscular/i.test(r)) return 'Intramuscular route'
//   if (/subcutaneous/i.test(r)) return 'Subcutaneous route'
//   if (/oral/i.test(r)) return 'Oral route'
//   if (/topical/i.test(r)) return 'Topical route'
//   if (/inhalat/i.test(r)) return 'Inhalation route'
//   if (/intranasal|nasal/i.test(r)) return 'Nasal route'
//   if (/rectal/i.test(r)) return 'Rectal route'
//   if (/vaginal/i.test(r)) return 'Vaginal route'
//   if (/ophthalmic|eye/i.test(r)) return 'Ophthalmic route'
//   if (/otic|ear/i.test(r)) return 'Otic route'
//   if (/intrathecal/i.test(r)) return 'Intrathecal route'
//   if (/intravitreal/i.test(r)) return 'Intravitreal route'
//   return r
// }

// export async function lookupFormSnomedConceptIds(
//   trx: TrxOrDb,
//   forms: string[],
// ): Promise<Map<string, string>> {
//   const primary_forms = [...new Set(forms.map(primaryForm))]
//   const by_primary = await lookupByTextSimilarity(
//     trx,
//     primary_forms,
//     ['dose form', 'basic dose form'],
//     'dose forms',
//   )
//   // Map original form → SNOMED id via primary form
//   const result = new Map<string, string>()
//   for (const form of forms) {
//     const id = by_primary.get(primaryForm(form))
//     if (id) result.set(form, id)
//   }
//   return result
// }

// export async function lookupRouteSnomedConceptIds(
//   trx: TrxOrDb,
//   routes: string[],
// ): Promise<Map<string, string>> {
//   const primary_routes = [...new Set(routes.map(primaryRoute))]
//   const by_primary = await lookupByTextSimilarity(
//     trx,
//     primary_routes,
//     ['qualifier value'],
//     'routes',
//   )
//   const result = new Map<string, string>()
//   for (const route of routes) {
//     const id = by_primary.get(primaryRoute(route))
//     if (id) result.set(route, id)
//   }
//   return result
// }

// /**
//  * Batch-looks up SNOMED concept IDs for a list of ICD-10 codes via
//  * snomed_iissscc_refset_extended_map.map_target.
//  * Returns a map of icd10_code → snomed_concept_id (as string).
//  */
// export async function lookupIcd10SnomedConceptIds(
//   trx: TrxOrDb,
//   icd10_codes: string[],
// ): Promise<Map<string, string>> {
//   const unique_codes = [...new Set(icd10_codes)]
//   if (unique_codes.length === 0) return new Map()

//   console.log(`Looking up SNOMED concepts for ${unique_codes.length} unique ICD-10 codes...`)

//   const rows = await trx
//     .selectFrom('snomed_iissscc_refset_extended_map')
//     .select((eb) => [
//       'map_target',
//       asText(eb, 'referenced_component_id').as('snomed_concept_id'),
//     ])
//     .where('active', '=', true)
//     .where('map_target', 'in', unique_codes)
//     // Prefer map_group=1, map_priority=1 (primary unconditional mapping)
//     .orderBy('map_group', 'asc')
//     .orderBy('map_priority', 'asc')
//     .execute()

//   const result = new Map<string, string>()
//   for (const row of rows) {
//     if (row.map_target && !result.has(row.map_target)) {
//       result.set(row.map_target, row.snomed_concept_id)
//     }
//   }

//   console.log(`  ICD-10 → SNOMED: ${result.size}/${unique_codes.length} matched`)
//   return result
// }

// /** Returns the id of the first ZA regulatory agency (HPCSA). */
// export async function lookupRegulatoryAgencyId(trx: TrxOrDb): Promise<string> {
//   const agency = await trx
//     .selectFrom('regulatory_agencies')
//     .select('id')
//     .where('country', '=', 'ZA')
//     .where('acronym', '=', 'HPCSA')
//     .executeTakeFirst()

//   assert(agency, 'Could not find ZA HPCSA regulatory agency – ensure 15_regulatory_agencies seed ran first')
//   return agency.id
// }

// // ─── EML lookup orchestration ────────────────────────────────────────────────

// export async function performEMLLookups(
//   trx: TrxOrDb,
//   recommended_doses: ParsedRecommendedDose[],
// ): Promise<ResolvedRecommendedDose[]> {
//   // 1. Collect unique values for batch lookup
//   const unique_medicine_names = [...new Set(recommended_doses.map((d) => d.medicine_name))]
//   const unique_forms = [...new Set(recommended_doses.map((d) => d.form))]
//   const unique_routes = [...new Set(recommended_doses.map((d) => d.route))]
//   const all_icd10 = recommended_doses.flatMap((d) => d.icd10_codes)
//   const unique_ingredient_names = [
//     ...new Set(recommended_doses.flatMap((d) => d.ingredients.map((s) => s.ingredient_name))),
//   ]

//   // 2. Run all independent lookups in parallel
//   const [
//     medicine_snomed_map,
//     form_snomed_map,
//     route_snomed_map,
//     icd10_snomed_map,
//     ingredient_snomed_map,
//     regulatory_agency_id,
//   ] = await Promise.all([
//     // Medicine: search substance / medicinal product
//     lookupDrugIngredientSnomedConceptIds(
//       trx,
//       unique_medicine_names.map((name) => ({ name, forms: [] })),
//     ),
//     lookupFormSnomedConceptIds(trx, unique_forms),
//     lookupRouteSnomedConceptIds(trx, unique_routes),
//     lookupIcd10SnomedConceptIds(trx, all_icd10),
//     // Ingredient substances (may overlap with medicine map)
//     lookupDrugIngredientSnomedConceptIds(
//       trx,
//       unique_ingredient_names.map((name) => ({ name, forms: [] })),
//     ),
//     lookupRegulatoryAgencyId(trx),
//   ])

//   const resolved: ResolvedRecommendedDose[] = []
//   const failures: { medicine_name: string; reason: string }[] = []

//   doses: for (const dose of recommended_doses) {
//     const medicine_snomed_concept_id = medicine_snomed_map.get(dose.medicine_name)
//     if (!medicine_snomed_concept_id) {
//       failures.push({ medicine_name: dose.medicine_name, reason: 'No SNOMED match for medicine' })
//       continue
//     }

//     const form_snomed_concept_id = form_snomed_map.get(dose.form)
//     if (!form_snomed_concept_id) {
//       failures.push({ medicine_name: dose.medicine_name, reason: `No SNOMED match for form: ${dose.form}` })
//       continue
//     }

//     const route_snomed_concept_id = route_snomed_map.get(dose.route)
//     if (!route_snomed_concept_id) {
//       failures.push({ medicine_name: dose.medicine_name, reason: `No SNOMED match for route: ${dose.route}` })
//       continue
//     }

//     // Resolve ingredient strengths
//     const resolved_ingredients: ResolvedIngredient[] = []
//     for (const ingredient of dose.ingredients) {
//       const active_ingredient_snomed_concept_id = ingredient_snomed_map.get(ingredient.ingredient_name)
//       if (!active_ingredient_snomed_concept_id) {
//         throw new Error(`Cannot find ingredient ${ingredient.ingredient_name}`)
//       }
//       if (!ingredient.strength) {
//         resolved_ingredients.push({ active_ingredient_snomed_concept_id, strength: null })
//         continue
//       }
//       const units_snomed_concept_id = lookupUnitSnomedConceptId(ingredient.strength.units)
//       if (!units_snomed_concept_id) {
//         failures.push({ medicine_name: dose.medicine_name, reason: `Could not find units ${ingredient.strength.units}` })
//         continue doses
//       }
//       if (ingredient.strength.value) {
//         resolved_ingredients.push({ active_ingredient_snomed_concept_id, strength: { units_snomed_concept_id, value: ingredient.strength.value } })
//         continue
//       }
//       assert(ingredient.strength.value_low)
//       resolved_ingredients.push({
//         active_ingredient_snomed_concept_id,
//         strength: { units_snomed_concept_id, value_low: ingredient.strength.value_low, value_high: ingredient.strength.value_high },
//       })
//     }
//     // Schedules – apply ingredient strengths to every schedule
//     const resolved_schedules: ResolvedSchedule[] = dose.schedules.map((schedule) => ({
//       ...schedule,
//       ingredients: resolved_ingredients,
//     }))

//     // Indication SNOMED IDs
//     const indication_snomed_concept_ids = dose.icd10_codes
//       .map((code) => icd10_snomed_map.get(code))
//       .filter((id): id is string => id !== undefined)

//     resolved.push({
//       medicine_snomed_concept_id,
//       form_snomed_concept_id,
//       route_snomed_concept_id,
//       atc: dose.atc,
//       age_years_low: dose.age_years_low,
//       age_years_high: dose.age_years_high,
//       prescriber: dose.prescriber,
//       special_instructions: dose.special_instructions,
//       regulatory_agency_id,
//       schedules: resolved_schedules,
//       indication_snomed_concept_ids,
//     })
//   }

//   console.log(`EML lookups: ${resolved.length}/${recommended_doses.length} resolved, ${failures.length} failures`)

//   Deno.writeTextFileSync(
//     './db/resources/25_recommended_doses_snomed_failures.json',
//     humanReadableJson(failures),
//   )

//   return resolved
// }
