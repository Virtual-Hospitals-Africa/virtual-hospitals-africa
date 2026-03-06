import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'

import { PrescriptionFrequency } from '../../shared/prescription.ts'
import assertHasProperty from '../../util/assertHasProperty.ts'
import assertLength from '../../util/assertLength.ts'
import { combine } from '../../util/combine.ts'
import { escapeRegexp } from '../../util/escapeRegexp.ts'
import { exists } from '../../util/exists.ts'
import { humanReadableJson } from '../../util/humanReadableJson.ts'
import isEmpty from '../../util/isEmpty.ts'
import isNumber from '../../util/isNumber.ts'
import isShallowEqual from '../../util/isShallowEqual.ts'
import isString from '../../util/isString.ts'
import sortBy from '../../util/sortBy.ts'
import withProperty from '../../util/withProperty.ts'
import { ParsedDose, ParsedMedicine, TimeSpecification } from './shared.ts'
import { normalizeTimeUnit } from './normalizeTimeUnit.ts'
import { SPECIAL_INSTRUCTIONS_PATTERNS } from './special_instruction_patterns.ts'

const redundant = () => ({})

export class DosageParser {
  parsed: ParsedDose
  private _dosage_text: string

  constructor(
    public medicine: ParsedMedicine,
    public dosage_form: string,
    public singular_form: boolean,
    public is_parenthetical: boolean,
    public parenthetical: string[] | string | false,
    public original_dosage_text: string,
  ) {
    this._dosage_text = ''
    this.dosage_text = original_dosage_text
    this.parsed = {}
    if (this.dosage_text === 'n/a') return
    // if (ingredient_name) this.parsed.ingredient_name = ingredient_name

    this.lookFor(' = 1ml Dextrose 50% + 4ml water for injection', redundant)
    this.lookFor('PCV-13', redundant)

    this.lookFor(/orally/i, redundant)
    this.lookFor(/\badministered\b/i, redundant)
    this.lookFor(/\bbase\b/i, redundant)
    this.lookFor(/(130 - Na)/i, (equation) => ({ equation }))
    this.lookFor(/1000ml \+ 50ml\/kg\/24\s*hours for each kg/i, (equation) => ({ equation }))
    this.lookFor(/1500ml \+ 20ml\/kg\/24\s*hours for each kg >20kg/i, (equation) => ({ equation }))
    this.lookFor(/^diluted? (\d+):(\d+)(?: with (.+))?$/i, (num_str, den_str, diluent) => {
      const result: ParsedDose = { concentration_ratio: [parseFloat(num_str), parseFloat(den_str)] as [number, number] }
      if (diluent) result.diluents = [{ ingredient_name: diluent.trim() }]
      return result
    })
    this.lookFor(/^(\d+):(\d+)\s+m[lL]\s+(.+)$/i, (num_str, den_str, rest) => ({
      value: parseFloat(num_str),
      units: 'ml',
      concentration_ratio: [parseFloat(num_str), parseFloat(den_str)] as [number, number],
      special_instructions: rest.trim(),
    }))
    this.lookForSpecialInstructions()
    this.lookFor(/\binjections?\b/i, redundant)
    this.lookFor(/\bdiluted?\b/i, redundant)

    this.lookFor(/(placebo)/i, (ingredient_name) => ({ ingredient_name }))
    this.lookFor(/^dose titrated$/i, () => ({ titrate: { to_effect: true } }))
    this.lookFor(/^titrated to (?:effect|response)$/i, () => ({ titrate: { to_effect: true } }))

    this.handleOr()
    this.handleMultipliers()

    this.lookFor(/^\+-(\d+)(mg|mcg|g|mmol|IU|MU|million units|mEq|ml|L|units|unit|U|litre|liter)s?$/i, (value, units) => ({
      plus_minus: {
        value: parseFloat(value),
        units,
      },
    }))

    this.lookForSeriesBeforeAfter()
    this.lookForTitration()
    this.lookForEvery()
    this.lookForAgeRange()
    this.lookForMaxDose()
    this.lookForFrequencyAndDuration()
    this.lookForWeightLimits()
    this.lookForAlternateSpecification()
    this.lookForSpecialInstructions()

    // Tablet/suppository patterns must run before lookForDosage() to avoid partial matches
    this.lookFor(/^(\d+)\s*(suppository|suppositories|tablets|tablet)$/, (value) => ({ quantity: parseInt(value) }))
    this.lookFor(
      /^(\d+)\s*-\s*(\d+)\s*(suppository|suppositories|tablets|tablet)$/,
      (low, high) => ({ low: [{ quantity: parseInt(low) }], high: [{ quantity: parseInt(high) }] }),
    )

    this.lookFor('slowly', () => ({ slowly: true }))
    this.lookFor('slow IV', () => ({ slowly: true }))

    this.lookForDosage()
    this.handleSlash()

    this.lookFor(/^(\d+\.?\d*)$/i, (value) => {
      const updates: ParsedDose = { value: parseFloat(value) }
      if (this.singular_form) {
        updates.units = this.dosage_form
      }
      return updates
    })

    this.lookFor(/(ethinylestradiol)/, (ingredient_name) => ({ ingredient_name }))
    for (const ingredient of this.medicine.ingredients) {
      const ingredient_pattern = new RegExp('(?:of )?' + escapeRegexp(ingredient.name) + '(?: component)?', 'i')
      this.lookFor(ingredient_pattern, () => {
        if (this.parsed.ingredient_name === ingredient.name) return {}
        return { ingredient_name: ingredient.name }
      })
    }

    this.lookForSpecialInstructions()
    this.lookForDosage()

    if (this.is_parenthetical) {
      this.lookFor(/^(\d+\.?\d*)\s?(mg|mcg|g|mmol|IU|MU|million units|mEq|ml|L|units|unit|U|litre|liter)s? (.+)$/i, (value, units, special_instructions) => {
        assert(!this.parsed.minimum)
        return {
          units: units.toLowerCase(),
          value: parseFloat(value),
          special_instructions,
        }
      })
    }

    this.mergeRelatedFields()
    this.handleParenthetical()

    // if (this.dosage_text) {
    //   this.parsed.special_instructions = compact([
    //     this.parsed.special_instructions,
    //     this.dosage_text,
    //   ]).join(' ')
    //   this.dosage_text = ''
    // }
  }

  specialInstructions(pattern: string | RegExp) {
    const regex = isString(pattern) ? new RegExp(escapeRegexp(pattern), 'i') : pattern
    const match = this.dosage_text.match(regex)
    if (!match) return
    const new_instruction = match[0]
    // Concatenate if special_instructions already exists
    if (this.parsed.special_instructions) {
      this.parsed.special_instructions = `${this.parsed.special_instructions}; ${new_instruction}`
    } else {
      this.parsed.special_instructions = new_instruction
    }
    this.dosage_text = this.dosage_text.slice(0, match.index!) +
      this.dosage_text.slice(match.index! + match[0].length)
  }

  lookForSpecialInstructions() {
    SPECIAL_INSTRUCTIONS_PATTERNS.forEach((pattern) => this.specialInstructions(pattern))
  }

  lookForSeriesBeforeAfter() {
    this.lookFor(/(\d+|an?) (minute|min|hour|hr|day|wk|week|month|yr|year)(?:s)? after (.+)/i, (value, units, event) => ({
      after: {
        event,
        time: {
          value: value === 'a' || value === 'an' ? 1 : parseInt(value),
          units: normalizeTimeUnit(units),
        },
      },
    }))

    this.lookFor(/(\d+) (minute|min|hour|hr|day|wk|week|month|yr|year)(?:s)? before (.+)/i, (value, units, event) => ({
      before: {
        event,
        time: {
          value: parseInt(value),
          units: normalizeTimeUnit(units),
        },
      },
    }))

    this.lookFor(/(\d)(?: |-)dose series/i, (dose_count) => ({
      series: {
        dose_count: parseInt(dose_count),
      },
    }))

    this.lookFor(/(\d+|an?|one) (minute|min|hour|hr|day|wk|week|month|yr|year)(?:s)? apart/i, (value, units) => ({
      time_apart: {
        value: value === 'a' || value === 'an' || value === 'one' ? 1 : parseInt(value),
        units: normalizeTimeUnit(units),
      },
    }))
  }

  lookForFrequencyAndDuration() {
    this.lookFor(/(if|as) (?:required|needed)/i, () => ({ as_required: true }))
    this.lookFor(/nocte/i, () => ({
      frequency: 'nocte' as const,
    }))
    this.lookFor(/single dose at night/i, () => ({
      frequency: 'nocte' as const,
      duration: { value: 1, units: 'day' },
    }))
    this.lookFor(/^mane$/i, () => ({ frequency: 'mane' }))

    this.lookFor('alternate days', () => ({ frequency: 'qod' }))
    this.lookFor('12 hourly with meals', () => ({ frequency: 'bd', special_instructions: 'with meals' }))
    this.lookFor(/(with|before) (meals|feeds)/i, () => ({ frequency: 'ac' }))
    this.lookFor('annually', () => ({ frequency: { every: { value: 1, units: 'year' } } }))
    this.lookFor('1-4 times daily', () => ({ frequency: ['qd', 'bd', 'tds', 'qid'] }))
    this.lookFor('2-4 times daily', () => ({ frequency: ['bd', 'qid'] }))
    this.lookFor('2-3 times a week', () => ({ frequency: ['bw', 'tw'] }))
    this.lookFor('3 times a week', () => ({ frequency: 'tw' }))
    this.lookFor('3 times weekly', () => ({ frequency: 'tw' }))
    this.lookFor('once weekly', () => ({ frequency: 'qw' }))
    this.lookFor('three times weekly', () => ({ frequency: 'tw' }))
    this.lookFor('every 2nd month', () => ({ frequency: { every: { value: 2, units: 'month' } } }))
    this.lookFor('twice weekly', () => ({ frequency: 'bw' }))
    this.lookFor('twice daily', () => ({ frequency: 'bd' }))
    this.lookFor('qn', () => ({ frequency: 'qn' }))
    this.lookFor('bd', () => ({ frequency: 'bd' }))
    this.lookFor(/\btds\b/i, () => ({ frequency: 'tds' }))
    this.lookFor(/\bqid\b/i, () => ({ frequency: 'qid' }))
    this.lookFor(/\bod\b/i, () => ({ frequency: 'od' }))
    this.lookFor('stat', () => ({ frequency: 'stat' }))
    this.lookFor(/immediately as a single dose/i, () => ({ frequency: 'stat' }))
    this.lookFor('immediately', () => ({ frequency: 'stat' }))
    this.lookFor('rapidly', () => ({ frequency: 'stat' }))
    this.lookFor(/(?:as a )?single dose/i, () => ({
      frequency: 'stat',
    }))
    this.lookFor(/prn/i, () => ({ as_required: true }))
    // Combined pattern for "daily at bedtime" variations - must come before individual patterns
    this.lookFor(/daily,?\s+(?:taken\s+)?at\s+(night|bedtime)/i, () => ({ frequency: 'nocte' as const }))
    this.lookFor(/at (night|bedtime)/i, () => ({ frequency: 'nocte' as const }))
    this.lookFor(/per day in (\d+) divided doses/i, (divided_dose_count) => ({
      frequency: 'qd' as const,
      divided_dose_count: parseInt(divided_dose_count),
    }))
    this.lookFor(/(\d+)\s*-\s*(\d+) doses per day/i, (low, high) => ({
      frequency: 'qd' as const,
      divided_dose_count: [parseInt(low), parseInt(high)],
    }))
    this.lookFor(/\bin (\d+)\s*-\s*(\d+) doses\b/i, (low, high) => ({ divided_dose_count: [parseInt(low), parseInt(high)] }))
    this.lookFor(/(\d+)\s*-\s*(\d+) doses/i, (low, high) => ({ divided_dose_count: [parseInt(low), parseInt(high)] }))
    this.lookFor('2 doses', () => ({ divided_dose_count: 2 }))
    this.lookFor('3 doses', () => ({ divided_dose_count: 3 }))
    this.lookFor('in divided doses', () => ({ divided_dose_count: 2 }))
    this.lookFor('two divided doses', () => ({ divided_dose_count: 2 }))
    this.lookFor('three divided doses', () => ({ divided_dose_count: 3 }))
    this.lookFor(/(\d+)\s*-\s*(\d+) divided doses/i, (low, high) => ({ divided_dose_count: [parseInt(low), parseInt(high)] }))
    this.lookFor(/in (\d+) divided doses/i, (n) => ({ divided_dose_count: parseInt(n) }))
    this.lookFor(/(\d+) divided doses/i, (n) => ({ divided_dose_count: parseInt(n) }))
    this.lookFor(/(\d+) doses total/i, (n) => ({ series: { dose_count: parseInt(n) } }))
    this.lookFor(/for (\d+) doses?/i, (n) => ({ series: { dose_count: parseInt(n) } }))
    this.lookFor(/(\d+)\s*-\s*(\d+) times (?:daily|a day|per day)/i, (low, high) => ({ divided_dose_count: [parseInt(low), parseInt(high)] }))
    this.lookFor('2 times daily', () => ({ frequency: 'bd' }))
    this.lookFor('3 times daily', () => ({ frequency: 'tds' }))
    this.lookFor('4 times daily', () => ({ frequency: 'qid' }))
    this.lookFor('twice a day', () => ({ frequency: 'bd' }))
    this.lookFor(/(\d+) times (?:daily|a day|per day)/i, (n) => ({ divided_dose_count: parseInt(n) }))
    this.lookFor(/once daily/i, () => ({ frequency: 'od' }))
    this.lookFor(/daily/i, () => ({ frequency: 'qd' }))
    this.lookFor(/as a single dose/i, () => ({ frequency: 'stat' }))
    this.lookFor(/initially/i, () => ({ frequency: 'stat' }))
    this.lookFor(/per (\d+) hours/i, (hours) => ({
      per_time: { value: parseInt(hours), units: 'hour' as const },
    }))
    this.lookFor(/^week$/i, () => ({
      frequency: 'qw',
    }))
    this.lookFor(/\/(24 hours)/i, () => ({
      per_time: { value: 24, units: 'hour' as const },
    }))
    this.lookFor(/(?:at )?(\d+)\s*(minute|min|hour|hr|day|wk|week|month|yr|year)(?:s|ly)? intervals/i, (value, units) => ({
      frequency: { every: { value: parseInt(value), units: normalizeTimeUnit(units) } },
    }))
    this.lookFor(/within (\d+) (minute|min|hour|hr|day|wk|week|month|yr|year)s? of (.+)/i, (value, units, event) => ({
      within: { time: { value: parseInt(value), units: normalizeTimeUnit(units) }, event: event.trim() },
    }))
    this.lookFor(/within (\d+) (minute|min|hour|hr|day|wk|week|month|yr|year)s?/i, (value, units) => ({
      within: { time: { value: parseInt(value), units: normalizeTimeUnit(units) } },
    }))
    this.lookFor(/day 1/i, () => ({ duration: { value: 1, units: 'day' } }))
    this.lookFor(/over an? (minute|min|hour|hr|day|wk|week|month|yr|year)(?:s)?/i, (units) => ({
      duration: { value: 1, units: normalizeTimeUnit(units) },
    }))
    this.lookFor(/over a few minutes/i, () => ({
      duration: { value: [3, 7], units: 'minute' },
    }))
    this.lookFor(/over (\d+) (minute|min|hour|hr|day|wk|week|month|yr|year)(?:s)?/i, (value, units) => ({
      duration: { value: parseInt(value), units: normalizeTimeUnit(units) },
    }))
    this.lookFor(/over (\d+)\s*-\s*(\d+)\s*(minute|min|hour|hr|day|wk|week|month|yr|year)(?:s)?/i, (min, max, units) => ({
      duration: { value: [parseInt(min), parseInt(max)], units: normalizeTimeUnit(units) },
    }))
    this.lookFor(/(\d+) (minute|min|hour|hr|day|wk|week|month|yr|year)(?:s)? for (.+)/i, (value, units, for_condition) => ({
      for_condition,
      duration: { value: parseInt(value), units: normalizeTimeUnit(units) },
    }))
    this.lookFor(/for (\d+)-(\d+) (minute|min|hour|hr|day|wk|week|month|yr|year)(?:s)?/i, (min, max, units) => ({
      duration: { value: [parseInt(min), parseInt(max)], units: normalizeTimeUnit(units) },
    }))
    this.lookFor(/for (?:a further )?(?:first )?(\d+) (minute|min|hour|hr|day|wk|week|month|yr|year)(?:s)?/i, (value, units) => ({
      duration: { value: parseInt(value), units: normalizeTimeUnit(units) },
    }))
    // this.lookFor(/(minute|min|hour|hr|day|wk|week|month|yr|year)ly/i, (min, max, units) => ({
    //   frequency: { value: [parseInt(min), parseInt(max)], units: normalizeTimeUnit(units) },
    // }))
    this.lookFor(/(\d+)\s?-\s?(\d+) hourly/i, (hours1, hours2) => ({
      frequency: [`q${hours1}h`, `q${hours2}h`] as [PrescriptionFrequency, PrescriptionFrequency],
    }))
    this.lookFor(/(\d+) hourly/i, (hours) => ({
      frequency: `q${hours}h` as PrescriptionFrequency,
    }))
    this.lookFor(/in (\d+) hours/i, (hours) => ({
      per_time: { value: parseInt(hours), units: 'hour' as const },
    }))
    this.lookFor(/^(\d+)(?: |-)(minute|min|hour|hr|day|wk|week|month|yr|year)ly$/i, (value, units) => ({
      frequency: { every: { value: parseInt(value), units: normalizeTimeUnit(units) } },
    }))
    this.lookFor(/^(minute|min|hour|hr|day|wk|week|month|yr|year)ly$/i, (units) => ({
      frequency: { every: { value: 1, units: normalizeTimeUnit(units) } },
    }))
    this.lookFor(/\bper (minute|min|hour|hr|day|wk|week|month|yr|year)(?:s|ly)?\b/i, (units) => ({ per_time: { value: 1, units: normalizeTimeUnit(units) } }))
    this.lookFor(
      /\bper (\d+) (minute|min|hour|hr|day|wk|week|month|yr|year)(?:s|ly)?\b/i,
      (value, units) => ({ per_time: { value: parseInt(value), units: normalizeTimeUnit(units) } }),
    )
    this.lookFor(/^(\d+)\s?-\s?(\d+) (minute|min|hour|hr|day|wk|week|month|yr|year)s/i, (min, max, units) => ({
      duration: { value: [parseInt(min), parseInt(max)], units: normalizeTimeUnit(units) },
    }))
    this.lookFor(/^(\d+)\s? (minute|min|hour|hr|day|wk|week|month|yr|year)s/i, (value, units) => ({
      duration: { value: parseInt(value), units: normalizeTimeUnit(units) },
    }))
    this.lookFor(/^(?:1|one) (minute|min|hour|hr|day|wk|week|month|yr|year)/i, (units) => ({
      duration: { value: 1, units: normalizeTimeUnit(units) },
    }))
    this.lookFor(/^(?:second) (minute|min|hour|hr|day|wk|week|month|yr|year)/i, (units) => ({
      duration: { value: 1, units: normalizeTimeUnit(units) },
    }))
  }

  lookForWeightLimits() {
    this.lookFor(/(\d+)-(\d+)\s?kg/i, (kg_limit_min, kg_limit_max) => ({
      kg_limit_min: parseInt(kg_limit_min),
      kg_limit_max: parseInt(kg_limit_max),
    }))
    this.lookFor(/(?:if |for )?(?:>|≥)(\d+)\s?kg/i, (kg_limit_min) => ({
      kg_limit_min: parseInt(kg_limit_min),
    }))
    this.lookFor(/(?:if |for )?<(\d+)\s?kg/i, (kg_limit_max) => ({
      kg_limit_max: parseInt(kg_limit_max),
    }))
    this.lookFor(/(?:recommended average dose = |Usual range: )(.+)$/i, (recommended_average_dose_text) => ({
      recommended_average_dose: this.sub(recommended_average_dose_text).parsed,
    }))
  }

  lookForEvery() {
    this.lookFor(/(?:single dose )?every (\d+)\s?-\s?(\d+) (minute|min|hour|hr|day|wk|week|month|yr|year)(?:s|ly)?/i, (min, max, units) => ({
      frequency: { every: { value: [parseInt(min), parseInt(max)], units: normalizeTimeUnit(units) } },
    }))
    this.lookFor(/(?:single dose )?every (\d+) (minute|min|hour|hr|day|wk|week|month|yr|year)(?:s|ly)?/i, (value, units) => ({
      frequency: { every: { value: parseInt(value), units: normalizeTimeUnit(units) } },
    }))
  }

  lookForAgeRange() {
    this.lookFor(/^premature babies$/i, () => ({ age_range: 'premature babies' as const }))
    this.lookFor(/^breastfed infants$/i, () => ({ age_range: 'breastfed infants' as const }))
    this.lookFor(/^(?:>|over)\s?(\d+)\s?(month|year)s?(?: and adults)?$/i, (age_min_value, age_min_units) => ({
      age_range: {
        min: { value: parseInt(age_min_value), units: age_min_units + 's' as 'months' | 'years' },
      },
    }))
    this.lookFor(/^(?:<|under)\s?(\d+)\s?(month|year)s?$/i, (age_max_value, age_max_units) => ({
      age_range: {
        max: { value: parseInt(age_max_value), units: age_max_units + 's' as 'months' | 'years' },
      },
    }))
    this.lookFor(/(?:>)?(?:Infants )?(\d+)\s?(?:-|to)\s?(\d+)\s?(month|year)s?$/i, (age_min_value, age_max_value, age_max_units) => ({
      age_range: {
        min: { value: parseInt(age_min_value), units: age_max_units + 's' as 'months' | 'years' },
        max: { value: parseInt(age_max_value), units: age_max_units + 's' as 'months' | 'years' },
      },
    }))
    this.lookFor(
      /(?:>)?(?:infants )?(\d+)\s?(month|year)s?\s?(?:-|to)\s?(\d+)\s?(month|year)s?/i,
      (age_min_value, age_min_units, age_max_value, age_max_units) => ({
        age_range: {
          min: { value: parseInt(age_min_value), units: age_min_units + 's' as 'months' | 'years' },
          max: { value: parseInt(age_max_value), units: age_max_units + 's' as 'months' | 'years' },
        },
      }),
    )
    this.lookFor(/^(\d+)\s?(month|year)s?$/i, (age_min_value, age_min_units) => ({
      age_range: {
        min: { value: parseInt(age_min_value), units: age_min_units + 's' as 'months' | 'years' },
      },
    }))
  }

  lookForAlternateSpecification() {
    this.lookFor(/i\.e\.(.+)$/i, (alternate_specification) => ({
      alternate_specification: this.sub(alternate_specification).parsed,
    }))
  }

  lookForMaxDose() {
    // Handle "up to N-M times daily" before the generic max dose pattern
    this.lookFor(/^up to (\d+)\s*-\s*(\d+) times (?:daily|a day|per day)$/i, (low, high) => ({
      divided_dose_count: [parseInt(low), parseInt(high)],
    }))
    // this.lookFor(/(?:up to )?(?:maximum|cumulative) (?:daily|total|cumulative) dose[:= ]+(.+)$/i, (max_text) => {
    //   const max_parser = this.sub(max_text.trim())
    //   const p = max_parser.parsed!
    //   if (p.value !== undefined) return { max: [{ ...p, per_time: { value: 1, units: 'day' } }] }
    //   if (p.low || p.high) return { max: [p] }
    //   return {}
    // })

    this.lookFor(/(?:up to )?max(?:imum)?( daily)?(?: dose)? = (.+) (?:=|up to) (.+)$/i, (daily, max_text1, max_text2) => {
      const max_parser1 = this.sub(max_text1)
      const max_parser2 = this.sub(max_text2)
      const max1 = withProperty(max_parser1.parsed, 'value')
      const max2 = withProperty(max_parser2.parsed, 'value')
      if (daily) {
        max1.per_time = { value: 1, units: 'day' as const }
        max2.per_time = { value: 1, units: 'day' as const }
      }
      return {
        max: [max1, max2],
      }
    })

    this.lookFor(/(?:up to )?max(?:imum)? (daily|total) dose(?:: )?(?: = )?(.+)$/i, (daily_or_total, max_text) => {
      const max_parser = this.sub(max_text)
      if (daily_or_total === 'daily') {
        max_parser.parsed.per_time = {
          value: 1,
          units: 'day' as const,
        }
      } else {
        assert(daily_or_total === 'total')
        max_parser.parsed.total = true
      }
      return { max: [max_parser.parsed] }
    })
    this.lookFor(/max(?:imum)?(?: dose)? = (\d+\.?\d*\s*mg|mcg|g|mmol|U|IU|MU|million units|mEq|ml|units|unit|litre|liter) daily/i, (max_text) => {
      const max_parser = this.sub(max_text)
      return { max: [withProperty(max_parser.parsed!, 'value')] }
    })
    this.lookFor(/max(?:imum)? dose of (.+?)\s*=\s*(\d.*)$/i, (ingredient_text, max_text) => {
      const max_parser = this.sub(max_text.trim())
      const ingredient_match = this.medicine.ingredients.find((ing) => ingredient_text.toLowerCase().includes(ing.name.toLowerCase()))
      if (ingredient_match) max_parser.parsed.ingredient_name = ingredient_match.name
      return { max: [withProperty(max_parser.parsed!, 'value')] }
    })
    this.lookFor(/max(?:imum)? single dose\s*=\s*(\d.*)$/i, (max_text) => {
      const max_parser = this.sub(max_text.trim())
      max_parser.parsed.frequency = 'stat'
      return { max: [withProperty(max_parser.parsed!, 'value')] }
    })
    this.lookFor(/maximum bolus dose\s*=\s*(.+)$/i, (max_text) => {
      const max_parser = this.sub(max_text.trim())
      return { max: [withProperty(max_parser.parsed!, 'value')] }
    })
    this.lookFor(/(?:maximum )?cumulative dose\s*=\s*(\d.*)$/i, (max_text) => {
      const max_parser = this.sub(max_text.trim())
      const p = max_parser.parsed!
      if (p.value != null || p.low != null || p.high != null) return { max: [p] }
      return {}
    })
    this.lookFor(/(?:up to )?(?:to a )?(?:maximum|up to|max)(?: cumulative)?(?: dose)?\s*(?:of)?\s*(?:=)?\s*(\d.*)$/i, (max_text) => {
      const max_parser = this.sub(max_text)
      const p = max_parser.parsed!
      if (p.low != null || p.high != null) return { max: [p] }
      return { max: [withProperty(p, 'value')] }
    })
  }

  lookForTitration() {
    this.lookFor(/^titration for (\d+) (minute|min|hour|hr|day|wk|week|month|yr|year)s?$/i, (time_value, time_units) => ({
      titrate: {
        duration: {
          value: parseInt(time_value),
          units: normalizeTimeUnit(time_units),
        },
      },
    }))

    this.lookFor('titrate the dose slowly upwards', () => ({
      titrate: {
        rate: { increment: 'slow' as const },
      },
    }))
    this.lookFor(/increased by (.+)\/day to (.+)\/day/i, (increase_text, titrate_to_text) => {
      const increase_parser = this.sub(increase_text)
      const titrate_to_parser = this.sub(titrate_to_text)
      const titrate: NonNullable<ParsedDose['titrate']> = {
        rate: {
          increment: {
            value: exists(increase_parser.parsed!.value),
            units: exists(increase_parser.parsed.units),
          },
          per_size: increase_parser.parsed.per_size,
          per_time: { value: 1, units: 'day' },
        },
      }
      if (titrate_to_parser.parsed.high) {
        assertLength(titrate_to_parser.parsed.high, 1)
        titrate.high = titrate_to_parser.parsed.high[0]
      }
      if (titrate_to_parser.parsed.low) {
        assertLength(titrate_to_parser.parsed.low, 1)
        titrate.low = titrate_to_parser.parsed.low[0]
      }
      return { titrate }
    })
    this.lookFor(
      /increased by (.+) (?:up )to (.+) every (\d+) (minute|min|hour|hr|day|wk|week|month|yr|year)s?/i,
      (increase_text, titrate_to_text, per_time_value, per_time_units) => {
        const increase_parser = this.sub(increase_text)
        const titrate_to_parser = this.sub(titrate_to_text)
        const titrate: NonNullable<ParsedDose['titrate']> = {
          rate: {
            increment: {
              value: exists(increase_parser.parsed!.value),
              units: exists(increase_parser.parsed.units),
            },
            per_size: increase_parser.parsed.per_size,
            per_time: { value: parseInt(per_time_value), units: normalizeTimeUnit(per_time_units) },
          },
        }
        if (titrate_to_parser.parsed.high) {
          assert(titrate_to_parser.parsed.low)
          assertLength(titrate_to_parser.parsed.high, 1)
          assertLength(titrate_to_parser.parsed.low, 1)
          titrate.high = titrate_to_parser.parsed.high[0]
          titrate.low = titrate_to_parser.parsed.low[0]
        } else {
          titrate.max = titrate_to_parser.parsed
        }
        return { titrate }
      },
    )
    this.lookFor(/increased by (.+)\/day to (.+)\/day/i, (increase_text, titrate_to_text) => {
      const increase_parser = this.sub(increase_text)
      const titrate_to_parser = this.sub(titrate_to_text)
      const titrate: NonNullable<ParsedDose['titrate']> = {
        rate: {
          increment: {
            value: exists(increase_parser.parsed.value),
            units: exists(increase_parser.parsed.units),
          },
          per_size: increase_parser.parsed.per_size,
          per_time: { value: 1, units: 'day' },
        },
      }
      if (titrate_to_parser.parsed.value) {
        titrate.max = titrate_to_parser.parsed
      } else {
        assert(titrate_to_parser.parsed.high)
        assertLength(titrate_to_parser.parsed.high, 1)
        titrate.high = titrate_to_parser.parsed.high[0]

        assert(titrate_to_parser.parsed.low)
        assertLength(titrate_to_parser.parsed.low, 1)
        titrate.low = titrate_to_parser.parsed.low[0]
      }
      return { titrate }
    })
    this.lookFor(/increased by (.+)\/day at (.+) day intervals/i, (increase_text, interval_text) => {
      const increase_parser = this.sub(increase_text)
      const interval_parser = this.sub(interval_text)
      assert(typeof interval_parser.parsed.minimum === 'number')
      assert(typeof interval_parser.parsed.maximum === 'number')
      return {
        titrate: {
          rate: {
            increment: {
              value: exists(increase_parser.parsed.value),
              units: exists(increase_parser.parsed.units),
            },
            per_size: increase_parser.parsed!.per_size,
            per_time: {
              units: 'day',
              value: [interval_parser.parsed.minimum, interval_parser.parsed.maximum],
            },
          },
        },
      }
    })
    this.lookFor(
      /increasing to (\d+\.?\d*)\s*(mg|mcg|g|mmol|IU|MU|million units|mEq|ml|L|units|unit|U|litre|liter)s?\s*(if necessary)?/i,
      (value, units, if_necessary) => ({
        titrate: {
          max: { value: parseFloat(value), units },
          if_necessary: !!if_necessary,
        },
      }),
    )
    this.lookFor(/titrated?( slowly)?( at \d+ weekly intervals)?( by .+)?( up to .+)?/i, (slowly, weekly_interval_text, by_text, max_text) => {
      const titrate: NonNullable<ParsedDose['titrate']> = {}
      if (slowly) {
        titrate.rate = { increment: 'slow' }
      } else if (by_text) {
        let without_by = by_text.replace(/^ by /i, '')
        let weekly = false
        if (without_by.endsWith(' weekly')) {
          without_by = without_by.slice(0, -(' weekly'.length))
          weekly = true
        }
        const sub = this.sub(without_by)
        titrate.rate = { increment: withProperty(sub.parsed!, 'value', 'units') }
        if (weekly) titrate.rate!.per_time = { value: 1, units: 'week' }
      }
      if (weekly_interval_text) {
        const weeks = weekly_interval_text.match(/(\d+)/)![1]
        titrate.rate!.per_time = { value: parseInt(weeks), units: 'week' }
      }
      if (max_text) {
        const titrate_to_parser = this.sub(max_text.replace(/^ up to /i, ''))
        if (titrate_to_parser.parsed.value) {
          titrate.max = withProperty(titrate_to_parser.parsed, 'value', 'units')
        } else {
          assert(titrate_to_parser.parsed.high)
          assertLength(titrate_to_parser.parsed.high, 1)
          titrate.high = titrate_to_parser.parsed.high[0]

          assert(titrate_to_parser.parsed.low)
          assertLength(titrate_to_parser.parsed.low, 1)
          titrate.low = titrate_to_parser.parsed.low[0]
        }
      }
      return { titrate }
    })
    this.lookFor(/^up to (.+) slowly and incrementally$/i, (max_text) => {
      const max_parser = this.sub(max_text)
      return {
        titrate: {
          rate: { increment: 'slow' as const },
          max: withProperty(max_parser.parsed!, 'value'),
        },
      }
    })
  }

  sub(part: string, opts?: { is_parenthetical?: boolean }) {
    return new DosageParser(
      this.medicine,
      this.dosage_form,
      this.singular_form,
      opts?.is_parenthetical || false,
      this.parenthetical,
      part,
      // this.parsed.ingredient_name,
    )
  }

  lookFor(
    pattern: RegExp | string,
    replace: (capture1: string, capture2: string, capture3: string, capture4: string, capture5: string) => Partial<ParsedDose>,
    opts?: { use_whole_match: boolean },
  ) {
    const regex = isString(pattern) ? new RegExp(escapeRegexp(pattern), 'i') : pattern
    const match = this.dosage_text.match(regex)
    if (!match) return
    // deno-lint-ignore no-explicit-any
    const updates = opts?.use_whole_match ? (replace as any)(match[0]) : replace(match[1], match[2], match[3], match[4], match[5])
    this.parsed = combine(this.parsed, updates as never)

    this.dosage_text = this.dosage_text.slice(0, match.index!) +
      this.dosage_text.slice(match.index! + match[0].length)
  }

  get dosage_text() {
    return this._dosage_text
  }
  set dosage_text(value: string) {
    this._dosage_text = value
      .trim()
      .replaceAll('–', '-')
      .replace('kg body mass', 'kg')
      .replace('kg body weight', 'kg')
      .replace(/mgkg/g, 'mg/kg')
      .replace(/\/diose\b/i, '/dose')
      .replace(' OR ', ' or ')
      .replaceAll('  ', ' ')
      .replace(/^=/i, '')
      .replace(/^,/i, '')
      .replace(/,$/i, '')
      .replace(/^\/$/i, '')
      .replace(/i,$/i, '')
      .replace(/^\./i, '')
      .replace(/\.$/i, '')
      .replace(/^:/i, '')
      .replace(/^of /i, '')
      .replaceAll('%.', '%')
      .trim()
  }

  lookForDosage() {
    this.lookFor('/% burn', () => ({
      per_percent_burn: true,
    }))
    this.lookFor(/^1 dose$/i, () => ({
      value: 1,
      units: 'dose',
    }))
    this.lookFor(/^(?:in )?3-4 doses$/i, () => ({
      frequency: ['tds', 'qid'],
    }))

    this.lookFor(/^MAC = ((\d+\.?\d*)\s*)%$/i, (concentration) => ({
      min: [{
        concentration: parseFloat(concentration),
      }],
    }))
    this.lookFor(/^(\d+\.?\d*)\s*(?:-|to)\s*(\d+\.?\d*)\s*%$/i, (low, high) => ({
      low: [{ concentration: parseFloat(low) }],
      high: [{ concentration: parseFloat(high) }],
    }))
    this.lookFor(/^(\d+\.?\d*)\s*%\s*\/\s*(\d+\.?\d*)\s*%$/i, (low, high) => ({
      low: [{ concentration: parseFloat(low) }],
      high: [{ concentration: parseFloat(high) }],
    }))
    this.lookFor(/^[Dd]ilut(?:e|ed) (\d+):(\d+)$/i, (num_str, den_str) => ({
      concentration_ratio: [parseFloat(num_str), parseFloat(den_str)] as [number, number],
    }))
    this.lookFor(/^(\d+\.?\d*)\s*ml\s+of\s+(\d+):(\d+)$/i, (vol_str, num_str, den_str) => ({
      value: parseFloat(vol_str),
      units: 'ml',
      concentration_ratio: [parseFloat(num_str), parseFloat(den_str)] as [number, number],
    }))
    this.lookFor(/^(\d+):(\d+)$/i, (num_str, den_str) => ({
      concentration_ratio: [parseFloat(num_str), parseFloat(den_str)] as [number, number],
    }))
    this.lookFor(/^(\d+\.?\d*)\s*%$/i, (concentration) => ({
      concentration: parseFloat(concentration),
    }))
    this.lookFor(/^(\d+\.?\d*)\s*ml in (\d+\.?\d*)\s*ml (.+)$/i, (value, diluent_value, diluent_ingredient) => ({
      value: parseFloat(value),
      units: 'ml',
      diluents: [{
        value: parseFloat(diluent_value),
        units: 'ml',
        ingredient_name: diluent_ingredient,
      }],
    }))

    this.lookFor(/^(\d+\.?\d*)\s*ml in NaCl 0.9%$/i, (value) => ({
      value: parseFloat(value),
      units: 'ml',
      diluents: [{
        ingredient_name: 'NaCl 0.9%',
      }],
    }))

    this.lookFor(/\bin (\d+\.?\d*)\s*m[lL] (.+)/i, (diluent_value, diluent_ingredient) => ({
      diluents: [{
        value: parseFloat(diluent_value),
        units: 'ml',
        ingredient_name: diluent_ingredient.trim(),
      }],
    }))

    this.lookFor(/\bin (.+?) (\d+\.?\d*)\s*m[lL]\b/i, (diluent_ingredient, diluent_value) => ({
      diluents: [{
        value: parseFloat(diluent_value),
        units: 'ml',
        ingredient_name: diluent_ingredient.trim(),
      }],
    }))

    this.lookFor(/^(\d+\.?\d*)\s*%\s+(\d+)\s*mL$/i, (concentration, dosage) => ({
      concentration: parseFloat(concentration),
      value: parseInt(dosage),
      units: 'ml',
    }))

    this.lookFor(/\/(dose)/i, () => ({ per_dose: true }))
    this.lookFor(/\/?(% burn)/i, () => ({ per_percent_burn: true }))

    this.lookFor(/\/(kg|m2)/i, (per_size) => ({ per_size: per_size as 'kg' | 'm2' }))
    this.lookFor(/\/\d*(\.\d+)?kg/i, (kg) => ({ per_size: { kg: parseFloat(kg) || 1 } }))
    this.lookFor(/\/(minute|min|hour|hr|day|week)/i, (units) => ({
      per_time: {
        value: 1,
        units: normalizeTimeUnit(units),
      },
    }))

    this.lookFor(/\/(\d+)\s?(?:hours?|h)\b/i, (hours) => ({ per_time: { value: parseInt(hours), units: 'hour' as const } }))
    this.lookFor(
      /^(\d+\.?\d*)\s*(?:-|to)\s*(\d+\.?\d*)\s*(mg|mcg|g|mmol|IU|MU|million units|mEq|ml|L|units|unit|U|litre|liter|drop|millunit|inhalation|puff|applicator|amp|ampoule)s?/i,
      (minimum, maximum, units) => ({
        minimum: parseFloat(minimum),
        maximum: parseFloat(maximum),
        units,
      }),
    )
    this.lookFor(
      /^(?:dose )?(?:range)?(?: = )?(\d+\.?\d*)\s*(?:-|to)\s*(\d+\.?\d*)\s*(mg|mcg|g|mmol|IU|MU|million units|mEq|ml|L|units|unit|U|litre|liter|drop|millunit|inhalation|puff|applicator|amp|ampoule)s?/i,
      (minimum_value, maximum_value, units) => ({
        low: [{
          value: parseFloat(minimum_value),
          units,
        }],
        high: [{
          value: parseFloat(maximum_value),
          units,
        }],
      }),
    )
    this.lookFor(
      /^(\d+\.?\d*)(mg|mcg|g|mmol|IU|MU|million units|mEq|ml|L|units|unit|U|litre|liter|drop|millunit|inhalation|puff|applicator|amp|ampoule)s?\s*(?:-| to )/i,
      (minimum_value, minimum_units) => ({
        low: [{
          value: parseFloat(minimum_value),
          units: minimum_units,
        }],
      }),
    )
    this.lookFor(
      /^(?:dose )?(?:range)?(?: = )?(\d+\.?\d*)(mg|mcg|g|mmol|IU|MU|million units|mEq|ml|L|units|unit|U|litre|liter|drop|millunit|inhalation|puff|applicator|amp|ampoule)s?\s*(?:-| to )/i,
      (value, units) => ({
        low: [{
          value: parseFloat(value),
          units: units.toLowerCase(),
        }],
      }),
    )
    this.lookFor(/^(\d+\.?\d*)\s*(?:-|to)\s*(\d+\.?\d*)(?!\s*(?:tablet|suppository))/i, (minimum, maximum) => ({
      minimum: parseFloat(minimum),
      maximum: parseFloat(maximum),
    }))
    this.lookFor(/^(\d+\.?\d*)\s*(?:-| to )/i, (minimum) => {
      throw new Error(minimum)
    })
    this.lookFor(/\/(\d+\.?\d*)?\s?(ml|l|g)\.?$/i, (value, units) => ({
      denominator: {
        value: value ? parseFloat(value) : 1,
        units: units.toLowerCase(),
      },
    }))
    this.lookFor(
      /^(\d+\.?\d*)\s?(mg|mcg|g|mmol|IU|MU|million units|mEq|ml|L|units|unit|U|litre|liter|drop|millunit|inhalation|puff|applicator|amp|ampoule)s?\.?$/i,
      (value, units) => {
        if (this.parsed.minimum) {
          return {
            units: units.toLowerCase(),
            high: [{
              value: parseFloat(value),
            }],
          }
        }
        return {
          units: units.toLowerCase(),
          value: parseFloat(value),
        }
      },
    )
  }

  handleParenthetical() {
    if (!this.parenthetical) return
    const parts = [this.parenthetical].flat()
    this.parenthetical = false
    for (const part of parts) {
      const sub = this.sub(part, { is_parenthetical: true })
      if (sub.dosage_text === 'max' || sub.dosage_text === 'max dose') {
        this.parsed = {
          max: [this.parsed],
        }
        continue
      }
      // deno-lint-ignore no-explicit-any
      assert(!sub.dosage_text, `Remaining parenthetical text ${sub.dosage_text} ${humanReadableJson(sub as any)}`)
      if ('special_instructions' in sub.parsed && 'special_instructions' in this.parsed) {
        this.parsed.special_instructions = `${this.parsed.special_instructions} (${sub.parsed.special_instructions})`
        delete sub.parsed.special_instructions
      }

      if (sub.parsed.max) {
        this.parsed.max = [
          ...(this.parsed.max || []),
          ...sub.parsed.max,
        ]
        delete sub.parsed.max
      }
      if (sub.parsed.min) {
        this.parsed.min = [
          ...(this.parsed.min || []),
          ...sub.parsed.min,
        ]
        delete sub.parsed.min
      }
      if (sub.parsed.high) {
        this.parsed.high = [
          ...(this.parsed.high || []),
          ...sub.parsed.high,
        ]
        delete sub.parsed.high
      }
      if (sub.parsed.low) {
        this.parsed.low = [
          ...(this.parsed.low || []),
          ...sub.parsed.low,
        ]
        delete sub.parsed.low
      }
      if (sub.parsed.ingredient_name) {
        assert(!this.parsed.active_ingredients)
        this.parsed.active_ingredients = [sub.parsed as { ingredient_name: string }]
        return
      }
      if (this.parsed.value && this.parsed.units && sub.parsed.value && sub.parsed.units) {
        this.parsed.other_schedule = sub.parsed
        return
      }

      this.parsed = combine(this.parsed, sub.parsed as never)
      this.mergeRelatedFields()
    }
  }

  mergeRelatedFields() {
    if (isNumber(this.parsed.minimum) && this.parsed.units) {
      assert(isNumber(this.parsed.maximum))
      assert(!this.parsed.value)
      assert(!this.parsed.low)
      assert(!this.parsed.high)
      const { minimum, maximum, ...rest } = this.parsed
      this.parsed = {
        low: [{
          ...rest,
          value: minimum,
        }],
        high: [{
          ...rest,
          value: maximum,
        }],
      }
    }
    if (this.parsed.as_required && !this.parsed.frequency) {
      this.parsed.frequency = 'prn' as const
      delete this.parsed.as_required
    }
    if (this.parsed.plus_minus && this.parsed.value && this.parsed.units) {
      assertEquals(this.parsed.plus_minus.units, this.parsed.units)
      assert(typeof this.parsed.value === 'number')
      assert(!this.parsed.high)
      assert(!this.parsed.low)
      assert(!this.parsed.minimum)
      this.parsed.high = [{
        value: this.parsed.value + this.parsed.plus_minus.value,
      }]
      this.parsed.low = [{
        value: this.parsed.value - this.parsed.plus_minus.value,
      }]
      delete this.parsed.plus_minus
    }
    // if (!this.parsed.value) {
    //   for (
    //     const condition of [
    //       ...(this.parsed.max || []),
    //       ...(this.parsed.min || []),
    //       ...(this.parsed.high || []),
    //       ...(this.parsed.low || []),
    //     ]
    //   ) {
    //     if (condition.units) {
    //       assertEquals(this.parsed.units, condition.units)
    //     } else {
    //       condition.units = this.parsed.units
    //     }
    //   }
    // }
    if (this.parsed.per_size && !this.parsed.value && !this.parsed.units) {
      if (this.parsed.max?.length === 1) {
        this.parsed.max[0].per_size = this.parsed.per_size
      }
      if (this.parsed.min?.length === 1) {
        this.parsed.min[0].per_size = this.parsed.per_size
      }
      if (this.parsed.high?.length === 1) {
        this.parsed.high[0].per_size = this.parsed.per_size
      }
      if (this.parsed.low?.length === 1) {
        this.parsed.low[0].per_size = this.parsed.per_size
      }
      delete this.parsed.per_size
    }
    if (this.parsed.per_time && !this.parsed.value && !this.parsed.units) {
      if (this.parsed.max?.length === 1) {
        this.parsed.max[0].per_time = this.parsed.per_time
      }
      if (this.parsed.min?.length === 1) {
        this.parsed.min[0].per_time = this.parsed.per_time
      }
      if (this.parsed.high?.length === 1) {
        this.parsed.high[0].per_time = this.parsed.per_time
      }
      if (this.parsed.low?.length === 1) {
        this.parsed.low[0].per_time = this.parsed.per_time
      }
      delete this.parsed.per_time
    }
    if (this.parsed.per_dose && !this.parsed.value && !this.parsed.units) {
      if (this.parsed.max?.length === 1) {
        this.parsed.max[0].per_dose = this.parsed.per_dose
      }
      if (this.parsed.min?.length === 1) {
        this.parsed.min[0].per_dose = this.parsed.per_dose
      }
      if (this.parsed.high?.length === 1) {
        this.parsed.high[0].per_dose = this.parsed.per_dose
      }
      if (this.parsed.low?.length === 1) {
        this.parsed.low[0].per_dose = this.parsed.per_dose
      }
      delete this.parsed.per_dose
    }
    if (this.parsed.time_apart) {
      if (this.parsed.divided_dose_count) {
        assert(typeof this.parsed.divided_dose_count === 'number')
        this.parsed.series = {
          dose_count: this.parsed.divided_dose_count,
          time_apart: this.parsed.time_apart,
        }
        delete this.parsed.divided_dose_count
        delete this.parsed.time_apart
      } else if (this.parsed.series) {
        this.parsed.series.time_apart = this.parsed.time_apart
        delete this.parsed.time_apart
      }
    }
  }

  handleOr() {
    this.lookFor('8 hourly with or after a meal', () => ({ frequency: 'q8h', special_instructions: 'with or after a meal' }))
    this.lookFor('once or twice weekly', () => ({ frequency: ['qw', 'bw'] }))
    this.lookFor('once or twice daily', () => ({ frequency: ['od', 'bd'] }))
    this.lookFor('single or divided doses', () => ({ divided_dose_count: [1, 2] }))
    this.lookFor(/single dose or (\d+) divided doses(?: on the same day)?/i, (n) => ({ divided_dose_count: [1, parseInt(n)] }))
    this.lookFor('12 hourly or per week', () => ({ frequency: ['bd', 'qw'] }))
    this.lookFor(/once daily or weekly/i, () => ({ frequency: ['od', 'qw'] }))
TimeSpecification
    if (!this.dosage_text.includes(' or ')) return

    const [first, second, ...others] = sortBy(
      this.dosage_text
        .split(' or ')
        .map((part) => this.sub(part)),
      (x) => -4 * Number(!!x.parsed.max) - 3 * Number(!!x.parsed.per_size) - 2 * Number(!!x.parsed.per_time) - 1 * Number(!!x.parsed.duration),
    )

    assert(!others.length)

    if (this.medicine.ingredients.length === 1 && first.parsed.max) {
      const second_dosage = second.parsed
      this.parsed = first.parsed
      assert(second_dosage)
      assertHasProperty(second_dosage, 'per_time')
      this.parsed.max!.push(second_dosage as (typeof second_dosage & { per_time: PerTime; value: number }))
      this.dosage_text = ''
      return
    }

    if (
      first.parsed.frequency &&
      second.parsed.frequency &&
      !first.parsed.value &&
      !second.parsed.value
    ) {
      assert(typeof first.parsed.frequency === 'string')
      assert(typeof second.parsed.frequency === 'string')

      this.parsed = {
        frequency: [
          first.parsed.frequency,
          second.parsed.frequency,
        ],
      }

      if (first.parsed.duration) {
        assert(!second.parsed.duration)
        this.parsed.duration = first.parsed.duration
      }

      this.dosage_text = ''
      return
    }

    if (this.medicine.ingredients.length === 1) {
      if (
        isShallowEqual(
          Object.keys(first.parsed).sort(),
          Object.keys(second.parsed).sort(),
        )
      ) {
        if (first.parsed.value) {
          assert(second.parsed.value)
          const [low, high] = first.parsed.value < second.parsed.value ? [first, second] : [second, first]
          this.parsed = {
            low: [low.parsed],
            high: [high.parsed],
          }
          this.dosage_text = ''
          return
        }
        assert(typeof first.parsed.concentration === 'number')
        assert(typeof second.parsed.concentration === 'number')
        this.parsed = {
          concentration: [first.parsed.concentration, second.parsed.concentration],
        }
        this.dosage_text = ''
        return
      }

      assert(first.parsed!.per_size)
      assert(!second.parsed!.per_size)
      this.parsed = first.parsed
      this.parsed.max = [second.parsed as (typeof second.parsed & { value: number })]
      this.dosage_text = ''
      return
    }

    if (first.parsed.active_ingredients && second.parsed.active_ingredients) {
      // throw new Error('where?!?!')
      assertEquals(first.parsed.active_ingredients.length, second.parsed.active_ingredients.length)
      assertEquals(first.parsed.active_ingredients.length, this.medicine.ingredients.length)
      this.parsed.active_ingredients = first.parsed.active_ingredients.map((ingredient, i) => {
        const { value, units, ingredient_name, ...rest } = ingredient
        assert(value)
        assert(units)
        assert(isEmpty(rest))
        const second_ingredient = second.parsed.active_ingredients![i]
        assert(second_ingredient)
        const { value: second_value, units: second_units, ingredient_name: second_ingredient_name, ...second_rest } = second_ingredient
        assert(second_value)
        assert(isEmpty(second_rest))
        assertEquals(ingredient_name, second_ingredient_name)
        assertEquals(units, second_units)

        return {
          ingredient_name,
          units,
          low: [{ value: Math.min(value!, second_value) }],
          high: [{ value: Math.max(value!, second_value) }],
        }
      })
      this.dosage_text = ''
      return
    }

    this.parsed = combine(first.parsed, second.parsed as never)
    this.dosage_text = ''
    return
  }

  handleMultipliers() {
    if (!this.dosage_text.includes(' x ')) return

    const [first, ...multipliers] = this.dosage_text
      .split(' x ')
      .map((part) => this.sub(part))

    assert(first.parsed.value || first.parsed.equation)
    this.parsed = first.parsed
    this.parsed.multipliers = multipliers.map((multiplier) => {
      if (isEmpty(multiplier.parsed)) return multiplier.dosage_text
      return multiplier.parsed
    })
    this.dosage_text = ''
    return
  }

  handleSlash() {
    if (!this.dosage_text.includes('/')) return

    if (this.dosage_form === 'Inhaler') {
      this.lookFor(/^(\d+)\/(\d+)\s*(?:mcg)?$/, (value1, value2) => {
        assert(this.medicine.ingredients.length === 2)
        return {
          active_ingredients: [
            {
              ingredient_name: this.medicine.ingredients[0].name,
              value: parseInt(value1),
              units: 'mcg',
            },
            {
              ingredient_name: this.medicine.ingredients[1].name,
              value: parseInt(value2),
              units: 'mcg',
            },
          ],
        }
      })
      return
    }

    const split_slash = this.dosage_text.split('/').map((part) => part.trim())
    const last = split_slash.pop()!
    // const last_with_units = /^\d*(\.\d+)?$/.test(last) ? (this.singular_form ? `${last}mg` : `${last}ml`) : last
    const last_parser = this.sub(last)
    assert(last_parser.parsed)

    const other_dosages = split_slash.map((strength) => {
      const strength_match = strength.match(/^(\d+\.?\d*)?\s?(mg|mcg|g|mmol|U|IU|MU|million units|mEq|ml)?$/i)
      assert(strength_match, 'mm' + strength)
      assert(last_parser.parsed, 'nn' + strength)
      return {
        value: parseFloat(strength_match[1]),
        units: (strength_match[2] || exists(last_parser.parsed.units)).toLowerCase(),
      }
    })

    if (
      other_dosages.length === 1 &&
      other_dosages[0].units === 'ml' &&
      ['mg', 'mcg', 'g', 'mmol', 'u', 'iu'].includes(exists(last_parser.parsed.units))
    ) {
      assertLength(this.medicine.ingredients, 1)
      this.parsed.active_ingredients = [{
        ...other_dosages[0],
        ingredient_name: this.medicine.ingredients[0].name,
      }]
      this.parsed = last_parser.parsed
      this.dosage_text = ''
      return
    }

    if (this.medicine.ingredients.length === 1) {
      assertLength(other_dosages, 1)
      assertEquals(other_dosages[0].units, last_parser.parsed.units)
      throw new Error('where am i?')
      // this.parsed = {
      //   minimum: Math.min(last_parser.parsed.value!, other_dosages[0].value),
      //   value: Math.max(last_parser.parsed.value!, other_dosages[0].value),
      //   units: last_parser.parsed.units,
      // }
      // this.dosage_text = ''
      // return
    }

    this.parsed.active_ingredients = [
      ...other_dosages,
      last_parser.parsed,
    ].map((ingredient, i) => ({
      ...ingredient,
      ingredient_name: exists(this.medicine.ingredients[i].name),
    }))

    this.dosage_text = ''
  }

  asParsedDose(): ParsedDose {
    if (!Object.keys(this.parsed).length) {
      throw new Error(`Did not parse anything ${this.original_dosage_text}`)
    }
    if (this.dosage_text) {
      throw new Error(`Dosage text remaining "${this.dosage_text}"`)
    }
    return this.parsed
  }

  static asParsedDose(
    medicine: ParsedMedicine,
    dosage_form: string,
    singular_form: boolean,
    is_parenthetical: boolean,
    parenthetical: string[] | string | false,
    original_dosage_text: string,
  ): ParsedDose {
    return new DosageParser(
      medicine,
      dosage_form,
      singular_form,
      is_parenthetical,
      parenthetical,
      original_dosage_text,
    ).asParsedDose()
  }
}
