import { InsertRows, TrxOrDb } from '../../../../types.ts'
import generateUUID from '../../../../util/uuid.ts'
import { insertChunks } from '../../../helpers.ts'
import { ParsedMedicationWithSnomedConceptMedicinalProduct } from './shared.ts'

export async function insertMedications(
  trx: TrxOrDb,
  medications_with_medicinal_products: ParsedMedicationWithSnomedConceptMedicinalProduct[],
) {
  const insert_consumables: InsertRows<'consumables'> = []
  const insert_medications: InsertRows<'medications'> = []
  const insert_medication_doses: InsertRows<'medication_doses'> = []
  const insert_medication_dose_ingredients: InsertRows<'medication_dose_ingredients'> = []
  const insert_medication_dose_ingredient_strengths: InsertRows<'medication_dose_ingredient_strengths'> = []
  const insert_medication_availabilities: InsertRows<'medication_availabilities'> = []

  for (const medication of medications_with_medicinal_products) {
    const medication_id = generateUUID()

    insert_medications.push({
      id: medication_id,
      trade_name: medication.trade_name,
      applicant_name: medication.applicant_name,
      manufacturer_name: medication.manufacturers,
      form: medication.form,
      routes: medication.routes,
      snomed_concept_id: medication.snomed_concept_id,
    })

    for (const dose of medication.doses) {
      const medication_dose_id = generateUUID()
      insert_consumables.push({ id: medication_dose_id, name: `${medication.trade_name} ${dose.value} ${dose.form}` })
      insert_medication_doses.push({
        id: medication_dose_id,
        medication_id,
        value: dose.value,
        units: dose.units,
        description: dose.form,
      })

      for (const ingredient of dose.ingredients) {
        const medication_dose_ingredient_id = generateUUID()
        insert_medication_dose_ingredients.push({
          id: medication_dose_ingredient_id,
          medication_dose_id,
          snomed_concept_id: ingredient.snomed_concept_id,
        })
        if (ingredient.strength) {
          insert_medication_dose_ingredient_strengths.push({
            id: medication_dose_ingredient_id,
            value: ingredient.strength.value,
            units: ingredient.strength.units,
          })
        }
      }
    }

    insert_medication_availabilities.push({ medication_id, country: medication.country, registration_number: medication.registration_no })
  }

  await insertChunks(trx, 'consumables', insert_consumables)
  await insertChunks(trx, 'medications', insert_medications)
  await insertChunks(trx, 'medication_doses', insert_medication_doses)
  await insertChunks(trx, 'medication_dose_ingredients', insert_medication_dose_ingredients)
  await insertChunks(trx, 'medication_dose_ingredient_strengths', insert_medication_dose_ingredient_strengths)
  await insertChunks(trx, 'medication_availabilities', insert_medication_availabilities)
}
