import { define } from '../define.ts'
import { addMedicationSeedDataFromJSON } from './inventory_medication/_etl.ts'

export default define([
  'medications',
  'consumables',
  'medication_doses',
  'medication_dose_ingredients',
  'medication_dose_ingredient_strengths',
  'medication_availabilities',
], addMedicationSeedDataFromJSON)
