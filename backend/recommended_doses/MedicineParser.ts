import { assert } from 'std/assert/assert.ts'
import last from '../../util/last.ts'
import zip from '../../util/zip.ts'
import { splitPartsAndParentheticals } from './split.ts'
import { DosageParser } from './DosageParser.ts'
import { MedicineRow, ParsedDose, ParsedMedicine, ParsedMedicineRecommendedDose } from './shared.ts'
import { combine } from '../../util/combine.ts'
import { parseIcd10Indications } from './icd10.ts'
import { parsePrescriber } from './prescriber.ts'
import { forms_with_singular_doses } from '../../db/seed/defs/inventory_medication/shared.ts'
import { FALLBACK_MEDICINE_SPECIAL_INSTRUCTIONS } from './fallback_medicine_special_instructions.ts'

export class MedicineParser {
  medicine: ParsedMedicine
  parsed: ParsedMedicineRecommendedDose
  constructor(public row: MedicineRow) {
    const medicine = this.medicine = this.parseMedicineField()

    const atc = (this.row['ATC'] ?? '').trim()
    const form = this.row['DOSAGE FORM'] ?? ''
    const route = this.row['ROUTE OF ADMINISTRATION'] ?? ''

    const aware_raw = this.row['AWaRe categorisation of antibiotics']
    const aware: 'Watch' | 'Access' | 'Reserve' | null = aware_raw === 'Watch'
      ? 'Watch'
      : aware_raw === 'Access'
      ? 'Access'
      : aware_raw === 'Reserve'
      ? 'Reserve'
      : null

    const acute_chronic_raw = this.row['ACUTE/CHRONIC']
    const acute_chronic: 'Acute' | 'Chronic' | null = acute_chronic_raw === 'Acute' ? 'Acute' : acute_chronic_raw === 'Chronic' ? 'Chronic' : null

    const prescriber = parsePrescriber(this.row['PRESCRIBER'])

    const dose_schedules = this.parseSchedules(this.row['DOSE'])
    const interval_schedules = this.parseSchedules(this.row['DOSING INTERVAL'])

    if (dose_schedules.length > 1 && interval_schedules.length > 1) {
      console.log(this, dose_schedules, interval_schedules)
      throw new Error('xxx')
    }

    const icd10_indications = parseIcd10Indications(this.row['ICD10 CODE'])

    this.parsed = {
      atc,
      form,
      route,
      aware,
      acute_chronic,
      prescriber,
      icd10_indications,
      medicine,
      schedules: this.combineSchedules(dose_schedules, interval_schedules),
    }

    Object.assign(this.parsed, {
      raw_dose: this.row['DOSE'],
      raw_dose_interval: this.row['DOSING INTERVAL'],
    })
  }

  static parse(medicine_row: MedicineRow) {
    return new MedicineParser(medicine_row)
  }

  parseSchedules(dosage_text: string): ParsedDose[] {
    const dose = dosage_text
      .replace(/\.$/, '')
      .replace(/^(.* at night) to (.*)$/, '$1 ; $2')
      .replaceAll('(recommended)', '')
      .replaceAll('24hours', '24 hours')
      .replaceAll(/(\d+) (\d+)/g, '$1$2')
      .replaceAll(/(\d+) to (\d+)/g, '$1-$2')
      .replaceAll('–', '-')
      .replaceAll('–', '-')
      .replaceAll(/ - (\d)/g, '-$1')
      .replace(/\/daily\b/g, '/day')
      .replaceAll('  ', ' ')
      .trim()

    if (dose === 'already specified') return [{}]
    if (dose === 'n/a') return [{}]
    if (FALLBACK_MEDICINE_SPECIAL_INSTRUCTIONS.has(dose)) return [{ special_instructions: dose }]
    const dose_parts = splitPartsAndParentheticals(dose)
    return dose_parts.map((dose_part) =>
      DosageParser.asParsedDose(
        this.medicine,
        this.row['DOSAGE FORM'],
        forms_with_singular_doses.includes(this.row['DOSAGE FORM'].toUpperCase()),
        false,
        dose_part.parenthetical,
        dose_part.rest,
      )
    ).flatMap(({ other_schedule, ...schedule }) => other_schedule ? [other_schedule, schedule] : [schedule])
  }

  parseMedicineField(): ParsedMedicine {
    const input = this.row['MEDICINE NAME (International Nonproprietary Name)']
      .replaceAll(', ', '/')
      .replaceAll(' + ', '/')

    const [{ parenthetical, rest }, ...others] = splitPartsAndParentheticals(input)
    const medicine_name = rest.trim()
    assert(!others.length)
    if (!parenthetical) {
      const ingredients = rest.split('/').map((name) => ({ name: name.trim() }))
      return { name: medicine_name, ingredients }
    }
    assert(!Array.isArray(parenthetical), `something weird regarding parentheticals ${input}`)
    if (medicine_name.includes('/') && medicine_name.indexOf('/') !== medicine_name.lastIndexOf('/')) {
      const ingredients = medicine_name.split('/').map((s) => s.trim()).map((name) => ({ name }))
      const strengths = new DosageParser(
        {
          name: input,
          ingredients,
        },
        '',
        true,
        true,
        false,
        parenthetical,
      ).parsed.active_ingredients
      assert(Array.isArray(strengths))
      return { name: input, ingredients: zip(ingredients, strengths).map(([{ name }, strength]) => ({ name, strength })).toArray() }
    }
    if (medicine_name.includes('/')) {
      assert(medicine_name.indexOf('/') === medicine_name.lastIndexOf('/'))
      const ingredients: ParsedMedicine['ingredients'] = medicine_name.split('/').map((name) => ({ name: name.trim() }))
      last(ingredients)!.alternate_name = parenthetical
      return { name: input, ingredients }
    }
    if (parenthetical.includes('/')) {
      const ingredients: ParsedMedicine['ingredients'] = parenthetical.split('/').map((name) => ({ name: name.trim() }))
      return { name: input, ingredients }
    }
    return { name: medicine_name, alternate_name: parenthetical, ingredients: [{ name: medicine_name, alternate_name: parenthetical }] }
  }

  combineSchedules(
    dose_schedules: ParsedDose[],
    interval_schedules: ParsedDose[],
  ): ParsedDose[] {
    return dose_schedules.flatMap((dose_schedule) =>
      interval_schedules.map((interval_schedule) => {
        if (dose_schedule.special_instructions && interval_schedule.special_instructions) {
          dose_schedule.special_instructions = [dose_schedule.special_instructions, interval_schedule.special_instructions].join(' ')
          delete interval_schedule.special_instructions
        }
        // When interval is a volume rate (e.g. 125ml/hour) and dose has different units, store rate as max
        if (
          dose_schedule.units && interval_schedule.units &&
          dose_schedule.units !== interval_schedule.units &&
          interval_schedule.per_time
        ) {
          const { value, units, per_time, ...rest } = interval_schedule
          Object.assign(interval_schedule, rest)
          interval_schedule.max = [{ value, units, per_time }]
          delete interval_schedule.value
          delete interval_schedule.units
          delete interval_schedule.per_time
        }
        if (dose_schedule.frequency && interval_schedule.frequency) {
          console.log({ dose_schedule, interval_schedule })
          assert(typeof dose_schedule.frequency === 'string')
          assert(typeof interval_schedule.frequency === 'string')
          if (dose_schedule.frequency !== interval_schedule.frequency) {
            dose_schedule.frequency = [dose_schedule.frequency, interval_schedule.frequency]
          }
          delete interval_schedule.frequency
        }
        return combine(dose_schedule, interval_schedule as never, { allow_collision_if_identical: true })
      })
    )
  }
}
