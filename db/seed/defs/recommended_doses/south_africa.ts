// import { stripAnsiCode } from 'std/fmt/colors.ts'
// import type { DurationUnits, Prescriber } from '../../../../db.d.ts'
// import compactMap from '../../../../util/compactMap.ts'
// import { humanReadableJson } from '../../../../util/humanReadableJson.ts'
// import { PrescriptionFrequency } from '../../../../shared/prescription.ts'
// import ZA_ESSENTIAL_MEDICINES from '../../../resources/Essential-Medicines-List_V1.1-2-October-2025.xlsx - EML V1.1.ts'
// import { ParsedMedicine } from './shared.ts'
// import entries from '../../../../util/entries.ts'
// import keys from '../../../../util/keys.ts'
// import isString from '../../../../util/isString.ts'
// import { NonEmptyArray } from '../../../../types.ts'

// export type EMLRow = typeof ZA_ESSENTIAL_MEDICINES[number]

// // ─── ICD-10 parsing ─────────────────────────────────────────────────────────

// /**
//  * Expands a single ICD-10 segment that may be a range into individual codes.
//  * Handles:
//  *   "I48.0-I48.2" (full-code range) → I48.0, I48.1, I48.2
//  *   "A15.0-3"     (short range)     → A15.0, A15.1, A15.2, A15.3
//  *   "B77.0"       (standalone)      → B77.0
//  */
// function expandIcd10Range(code: string): string[] {
//   const trimmed = code.trim()

//   // Full-code range: "I48.0-I48.2" (same base letter+digits, different sub-codes)
//   const full_range = trimmed.match(/^([A-Z]\d+)\.(\d+)-[A-Z]\d+\.(\d+)$/)
//   if (full_range) {
//     const prefix = full_range[1]
//     const start = parseInt(full_range[2])
//     const end = parseInt(full_range[3])
//     const result: string[] = []
//     for (let i = start; i <= end; i++) result.push(`${prefix}.${i}`)
//     return result
//   }

//   // Short range: "A15.0-3" (prefix + start digit + "-" + end digit)
//   const short_range = trimmed.match(/^([A-Z]\d+\.)(\d)-(\d)$/)
//   if (short_range) {
//     const prefix = short_range[1]
//     const start = parseInt(short_range[2])
//     const end = parseInt(short_range[3])
//     const result: string[] = []
//     for (let i = start; i <= end; i++) result.push(`${prefix}${i}`)
//     return result
//   }

//   if (!trimmed || !/^[A-Z]\d/.test(trimmed)) return []
//   return [trimmed]
// }

// type ICD10IndicationsCodes = { type: 'codes'; codes: string[] }
// type ICD10Indications = ICD10IndicationsCodes | { type: 'and'; indications: ICD10IndicationsCodes[] }

// /**
//  * Expands all ICD-10 codes from a slash-separated group string.
//  * When is_parenthesized is true and a single code ends in ".0", strips the ".0"
//  * to normalise to the parent code (e.g. "(B20.0)" → "B20").
//  */
// function expandCodesFromGroup(group: string): string[] {
//   const trimmed = group.trim()
//   const is_parenthesized = trimmed.startsWith('(') && trimmed.endsWith(')')
//   const cleaned = trimmed.replace(/[()]/g, '').trim()

//   const codes: string[] = []
//   for (const slash_part of cleaned.split('/')) {
//     const code_part = slash_part.trim()
//     if (!code_part) continue
//     const expanded = expandIcd10Range(code_part)
//     if (is_parenthesized && expanded.length === 1) {
//       codes.push(...expanded.map((c) => c.replace(/\.0$/, '')))
//     } else {
//       codes.push(...expanded)
//     }
//   }
//   return [...new Set(codes)].filter((c) => /^[A-Z]\d/.test(c))
// }

// /**
//  * Parses the ICD10 CODE column into an ICD10Indications object.
//  * "+" separates AND conditions (e.g. primary + complication code).
//  * "/" separates alternative codes within a group.
//  */
// function parseIcd10Indications(icd10_str: string | null | undefined): ICD10Indications {
//   if (!icd10_str) return { type: 'codes', codes: [] }

//   const plus_parts = icd10_str.split('+').map((p) => p.trim()).filter(Boolean)

//   if (plus_parts.length > 1) {
//     return {
//       type: 'and',
//       indications: plus_parts.map((part) => ({
//         type: 'codes' as const,
//         codes: expandCodesFromGroup(part),
//       })),
//     }
//   }

//   return { type: 'codes', codes: expandCodesFromGroup(icd10_str) }
// }

// // ─── Frequency parsing ──────────────────────────────────────────────────────

// function parseFrequency(text: string): PrescriptionFrequency | PrescriptionFrequency[] | null {
//   const t = text.toLowerCase().trim()

//   if (/\bsingle\s+dose\b|\bonce\s+only\b|\bstat\b/.test(t)) return 'stat'
//   if (/\bas\s+needed\b|\bas\s+required\b|\bprn\b|\bwhen\s+required\b/.test(t)) return 'prn'

//   if (/\b72[\s-]?hourly\b|every\s+72\s+hours?/.test(t)) return 'q72h'
//   if (/\b48[\s-]?hourly\b|every\s+48\s+hours?/.test(t)) return 'q48h'
//   if (/\b24[\s-]?hourly\b|every\s+24\s+hours?/.test(t)) return 'q24h'
//   if (/\b12[\s-]?hourly\b|every\s+12\s+hours?/.test(t)) return 'bd'
//   if (/\b8[\s-]?hourly\b|every\s+8\s+hours?/.test(t)) return 'q8h'
//   if (/\b6[\s-]?hourly\b|every\s+6\s+hours?/.test(t)) return 'q6h'
//   if (/\b4[\s-]?hourly\b|every\s+4\s+hours?/.test(t)) return 'q4h'
//   if (/\b2[\s-]?hourly\b|every\s+2\s+hours?/.test(t)) return 'q2h'
//   if (/\bhourly\b|every\s+hour\b/.test(t)) return 'q1h'

//   // "X-Y hourly" ranges – return all frequencies within the range
//   const range_hourly = t.match(/(\d+)\s*[-–]\s*(\d+)\s*hourly/)
//   if (range_hourly) {
//     const frequencies: PrescriptionFrequency[] = []
//     const n_low = parseInt(range_hourly[1])
//     const n_high = parseInt(range_hourly[2])
//     for (
//       const [frequency, hour] of entries({
//         q1h: 1,
//         q2h: 2,
//         q4h: 4,
//         q6h: 6,
//         q8h: 8,
//         qd: 24,
//       })
//     ) {
//       if (hour >= n_low && hour <= n_high) frequencies.push(frequency)
//     }
//     if (!frequencies.length) throw new Error('could not determine frequencies')
//     return frequencies
//   }

//   if (/\bfour\s+times\s+(a\s+)?day\b|\bqid\b/.test(t)) return 'qid'
//   if (/\bthree\s+times\s+(a\s+)?day\b|\btds\b|\btid\b|\bthrice\s+daily\b/.test(t)) return 'tds'
//   if (/\btwice\s+(a\s+)?day\b|\btwice\s+daily\b|\bbd\b/.test(t)) return 'bd'
//   if (/\bonce\s+(a\s+)?day\b|\bonce\s+daily\b|\bod\b/.test(t)) return 'od'
//   if (/\bdaily\b/.test(t)) return 'od'

//   if (/\bnightly\b|\bnocte\b|\bat\s+night\b|\bevery\s+night\b/.test(t)) return 'nocte'
//   if (/\bmane\b|\bin\s+the\s+morning\b/.test(t)) return 'mane'
//   if (/\bevery\s+morning\b/.test(t)) return 'qmane'
//   if (/\bat\s+bedtime\b/.test(t)) return 'hs'

//   if (/\balternate\s+days?\b|\bevery\s+other\s+day\b|\bqod\b/.test(t)) return 'qod'

//   if (/\bthree\s+times\s+(a\s+)?week\b|\btw\b/.test(t)) return 'tw'
//   if (/\btwice\s+(a\s+)?week(ly)?\b|\bbw\b/.test(t)) return 'bw'
//   if (/\bonce\s+(a\s+)?week(ly)?\b|\bweekly\b|\bqw\b|\bonce\s+weekly\b/.test(t)) return 'qw'

//   if (/\bonce\s+(a\s+)?month(ly)?\b|\bmonthly\b|\bqm\b/.test(t)) return 'qm'

//   if (/\bover\s+\d+|\d+\s*[-–]\s*\d+\s*minutes?/.test(t)) return 'stat'

//   return null
// }

// // ─── Duration parsing ────────────────────────────────────────────────────────

// const DURATION_RE = /\bfor\s+(?:the\s+)?(?:first\s+)?(\d+)\s+(day|days|week|weeks|month|months|year|years)\b/

// function parseDurationUnit(word: string): DurationUnits {
//   if (word.startsWith('minute')) return 'minutes'
//   if (word.startsWith('hour')) return 'hours'
//   if (word.startsWith('day')) return 'days'
//   if (word.startsWith('week')) return 'weeks'
//   if (word.startsWith('month')) return 'months'
//   return 'years'
// }

// const ORDINALS: Record<string, number> = { first: 1, second: 1, third: 1, fourth: 1, fifth: 1 }

// /** Parse a parenthetical duration like "(1 week)", "(second week)", "(3 days)". */
// function parseDurationFromParens(content: string): { value: number; units: DurationUnits } | null {
//   const c = content.toLowerCase().trim()

//   // "1 week", "2 weeks", "3 days"
//   const m1 = c.match(/^(\d+)\s+(day|days|week|weeks|month|months|year|years)/)
//   if (m1) return { value: parseInt(m1[1]), units: parseDurationUnit(m1[2]) }

//   // "second week", "first month" (ordinal → period of 1 of that unit)
//   const m2 = c.match(/^(first|second|third|fourth|fifth)\s+(day|days|week|weeks|month|months)/)
//   if (m2) return { value: ORDINALS[m2[1]], units: parseDurationUnit(m2[2]) }

//   return null
// }

// // ─── Strength parsing ────────────────────────────────────────────────────────

// type ExactValueOrRange = number | [number, number]

// function normalizeStrengthUnit(unit: string): string {
//   return unit.toUpperCase()
//     .replace(/^UG$/, 'MCG')
//     .replace(/^UNITS?$/, 'UNITS')
// }

// function parseStrength(str: string): { value: ExactValueOrRange; units: string; per?: 'hr' } | null {
//   const d = str.trim()

//   // Range per hour: "2-5 mg/h"
//   const range_per_h = d.match(/^(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*(mg|g|ml|mcg|ug|iu|mmol|units?)\s*\/h\b/i)
//   if (range_per_h) {
//     return { value: [parseFloat(range_per_h[1]), parseFloat(range_per_h[2])], units: normalizeStrengthUnit(range_per_h[3]), per: 'hr' }
//   }

//   // Standard per hour: "10 mg/h"
//   const standard_per_h = d.match(/^(\d+(?:\.\d+)?)\s*(mg|g|ml|mcg|ug|iu|mmol|units?)\s*\/h\b/i)
//   if (standard_per_h) {
//     return { value: parseFloat(standard_per_h[1]), units: normalizeStrengthUnit(standard_per_h[2]), per: 'hr' }
//   }

//   // Range: "2-10 mg"
//   const range = d.match(/^(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*(mg|g|ml|mcg|ug|iu|mmol|units?)\b/i)
//   if (range) {
//     return { value: [parseFloat(range[1]), parseFloat(range[2])], units: normalizeStrengthUnit(range[3]) }
//   }

//   // Standard: "200mg", "75 IU", "1g"
//   const standard = d.match(/^(\d+(?:\.\d+)?)\s*(mg|g|ml|mcg|ug|iu|mmol|units?)\b/i)
//   if (standard) {
//     return { value: parseFloat(standard[1]), units: normalizeStrengthUnit(standard[2]) }
//   }

//   return null
// }

// // ─── Age range parsing ───────────────────────────────────────────────────────

// const ADULT_AGE_YEARS = 12

// function parseAdultChildrenAgeRange(value: string | null): { min: number; max?: number } {
//   if (!value) return { min: 0 }
//   const v = value.trim().toLowerCase()
//   if (v === 'adult') return { min: ADULT_AGE_YEARS }
//   if (v.startsWith('children') || v.startsWith('child')) {
//     // "Children >8years" → { min: 8 }
//     const age_match = v.match(/>(\d+)\s*years?/)
//     if (age_match) return { min: parseInt(age_match[1]) }
//     return { min: 0, max: ADULT_AGE_YEARS }
//   }
//   // "Adult/ Children", "All", etc.
//   return { min: 0 }
// }

// /** Parse age qualifier from parenthetical like "(1-2 years)", "(>2 years)", "(<5 years)". */
// function parseAgeQualifier(text: string): { min: number; max?: number } | null {
//   const m = text.match(/\(([^)]+)\)/)
//   if (!m) return null
//   const age_text = m[1].toLowerCase().trim()

//   const gt = age_text.match(/^>\s*(\d+)\s*years?$/)
//   if (gt) return { min: parseInt(gt[1]) }

//   const lt = age_text.match(/^<\s*(\d+)\s*years?$/)
//   if (lt) return { min: 0, max: parseInt(lt[1]) }

//   const range = age_text.match(/^(\d+)\s*-\s*(\d+)\s*years?$/)
//   if (range) return { min: parseInt(range[1]), max: parseInt(range[2]) }

//   return null
// }

// // ─── Dose column parsing with age qualifiers ─────────────────────────────────

// type AgeQualifiedStrength = {
//   strength: { value: ExactValueOrRange; units: string } | null
//   age_years_range: { min: number; max?: number }
// }

// /**
//  * Parses the DOSE column for age-qualified entries like "100mg (1-2 years); 500mg (>2 years)".
//  * Returns one entry per age group. Falls back to a single entry using default_age_range
//  * when no age qualifiers are found.
//  */
// function parseAgeQualifiedStrengths(
//   dose_str: string | null,
//   default_age_range: { min: number; max?: number },
// ): AgeQualifiedStrength[] {
//   if (!dose_str) return [{ strength: null, age_years_range: default_age_range }]

//   const parts = dose_str.split(';').map((p) => p.trim()).filter(Boolean)

//   const has_age_qualifiers = parts.length > 1 && parts.some((p) => parseAgeQualifier(p) !== null)

//   if (has_age_qualifiers) {
//     return parts.map((part) => {
//       const age_years_range = parseAgeQualifier(part) ?? default_age_range
//       const strength_str = part.replace(/\([^)]*\)/g, '').trim()
//       const strength = parseStrength(strength_str)
//       return { strength, age_years_range }
//     })
//   }

//   return [{ strength: parseStrength(dose_str), age_years_range: default_age_range }]
// }

// // ─── Schedule parsing ────────────────────────────────────────────────────────

// type ParsedNewSchedule = {
//   frequencies: NonEmptyArray<PrescriptionFrequency>
//   dosage: { value: ExactValueOrRange; units: string }
//   duration: null | { value: ExactValueOrRange; units: DurationUnits }
//   strength: { value: ExactValueOrRange; units: string; per?: 'kg' | 'hr' | 'kg/hr' } | null
// }

// /**
//  * Parses a single semicolon-separated segment of DOSING INTERVAL into a schedule.
//  * Handles "or" alternatives for frequency, parenthetical durations, etc.
//  */
// function parseIntervalSegment(
//   segment: string,
//   strength: { value: ExactValueOrRange; units: string } | null,
// ): ParsedNewSchedule | null {
//   let text = segment.trim()

//   // Extract parenthetical duration: "(1 week)", "(second week)", etc.
//   let duration: { value: ExactValueOrRange; units: DurationUnits } | null = null
//   const paren_match = text.match(/\(([^)]+)\)/)
//   if (paren_match) {
//     const parsed_dur = parseDurationFromParens(paren_match[1])
//     if (parsed_dur) duration = parsed_dur
//     text = text.replace(paren_match[0], '').trim()
//   }

//   // "for X weeks" pattern
//   const dur_match = text.match(DURATION_RE)
//   if (dur_match && !duration) {
//     duration = { value: parseInt(dur_match[1]), units: parseDurationUnit(dur_match[2]) }
//     text = text.replace(dur_match[0], '').trim()
//   }

//   // Parse frequencies, handling "X or Y" alternatives
//   const or_parts = text.split(/\s+or\s+/i)
//   const frequencies: PrescriptionFrequency[] = []
//   for (const part of or_parts) {
//     const f = parseFrequency(part.trim())
//     if (f) frequencies.push(...[f].flat())
//   }

//   if (!frequencies.length) return null

//   // If any special frequency (stat/prn/qs), duration must be null
//   const has_special = frequencies.some((f) => f === 'stat' || f === 'prn' || f === 'qs')
//   if (has_special) {
//     duration = null
//   } else if (!duration) {
//     // No parseable duration → indefinitely
//     duration = { value: 1, units: 'indefinitely' as DurationUnits }
//   }

//   return {
//     frequencies: frequencies as NonEmptyArray<PrescriptionFrequency>,
//     dosage: { value: 1, units: 'DOSE' },
//     duration,
//     strength,
//   }
// }

// /**
//  * Parses DOSING INTERVAL into one or more schedules.
//  * Splits on ";" for multi-phase schedules (e.g. Amiodarone's loading/maintenance doses).
//  */
// function parseDosingIntervalNew(
//   dosing_interval: string | null,
//   strength: { value: ExactValueOrRange; units: string } | null,
// ): NonEmptyArray<ParsedNewSchedule> {
//   if (!dosing_interval) {
//     return [{ frequencies: ['prn'], dosage: { value: 1, units: 'DOSE' }, duration: null, strength }]
//   }

//   const segments = dosing_interval.split(';').map((s) => s.trim()).filter(Boolean)
//   const schedules = compactMap(segments, (seg) => parseIntervalSegment(seg, strength))

//   if (!schedules.length) {
//     return [{ frequencies: ['prn'], dosage: { value: 1, units: 'DOSE' }, duration: null, strength }]
//   }

//   return schedules as NonEmptyArray<ParsedNewSchedule>
// }

// // ─── Bolus / maintenance dose detection ──────────────────────────────────────

// function getDoseSegmentType(segment: string): 'bolus' | 'maintenance' | null {
//   const lower = segment.toLowerCase()
//   if (/\bbolus\b|\bloading\b/.test(lower)) return 'bolus'
//   if (/\bmaintenance\b/.test(lower)) return 'maintenance'
//   return null
// }

// /** Extracts the hour count from "X hourly" patterns, e.g. "4 hourly prn" → 4 hours. */
// function parseDurationFromHourly(text: string): { value: number; units: DurationUnits } | null {
//   const m = text.match(/(\d+)\s*hourly\b/i)
//   if (m) return { value: parseInt(m[1]), units: 'hours' }
//   return null
// }

// // ─── Prescriber mapping ──────────────────────────────────────────────────────

// const KNOWN_PRESCRIBERS = new Set<Prescriber>([
//   'Dentist, Dental therapist',
//   'Dentist',
//   'Doctor prescribed',
//   'Doctor',
//   'Doctor/Nurse',
//   'Nurse',
//   'Specialist advice',
//   'Specialist consultation',
//   'Specialist initiated',
//   'Specialist prescribed',
//   'Specialist supervision',
//   'Specialist',
//   'Specialist/subspecialist supervision',
//   'Subspecialist initiated',
//   'Subspecialist supervision',
// ])

// function parsePrescriber(raw: string | null): Prescriber | null {
//   if (!raw) return null
//   const trimmed = raw as Prescriber
//   if (KNOWN_PRESCRIBERS.has(trimmed)) return trimmed
//   for (const known of KNOWN_PRESCRIBERS) {
//     if (trimmed.toLowerCase().startsWith(known.toLowerCase())) return known
//   }
//   throw new Error(`could not parse ${raw}`)
// }

// // ─── Row parser ──────────────────────────────────────────────────────────────

// export function parseEMLRow(row: EMLRow): ParsedMedicine {
//   for (const key of keys(row)) {
//     if (row[key] === 'n/a' || row[key] === 'N/A') {
//       // deno-lint-ignore no-explicit-any
//       ;(row as any)[key] = null
//     } else if (isString(row[key])) {
//       // deno-lint-ignore no-explicit-any
//       ;(row as any)[key] = (row[key] as string).trim()
//     }
//   }

//   const medicine_name = row['MEDICINE NAME (International Nonproprietary Name)']
//   if (!medicine_name) throw new Error('Missing medicine name')

//   const atc = (row['ATC'] ?? '').trim()
//   const form = row['DOSAGE FORM'] ?? ''
//   const route = row['ROUTE OF ADMINISTRATION'] ?? ''
//   const dose_str = row['DOSE']
//   const dosing_interval = row['DOSING INTERVAL']

//   const aware_raw = row['AWaRe categorisation of antibiotics']
//   const aware: 'Watch' | 'Access' | 'Reserve' | null = aware_raw === 'Watch'
//     ? 'Watch'
//     : aware_raw === 'Access'
//     ? 'Access'
//     : aware_raw === 'Reserve'
//     ? 'Reserve'
//     : null

//   const acute_chronic_raw = row['ACUTE/CHRONIC']
//   const acute_chronic: 'Acute' | 'Chronic' | null = acute_chronic_raw === 'Acute' ? 'Acute' : acute_chronic_raw === 'Chronic' ? 'Chronic' : null

//   const prescriber = parsePrescriber(row['PRESCRIBER'])
//   const icd10_indications = parseIcd10Indications(row['ICD10 CODE'])

//   const instruction_parts: string[] = []
//   if (dose_str) instruction_parts.push(`Dose: ${dose_str}`)
//   if (dosing_interval) instruction_parts.push(`Interval: ${dosing_interval}`)
//   const special_instructions = instruction_parts.length > 0 ? instruction_parts.join('; ') : null

//   const default_age_range = parseAdultChildrenAgeRange(row['ADULT/ CHILDREN'])

//   // Check for bolus/maintenance dose patterns (e.g. "2-10 mg bolus; 2-5 mg/h maintenance")
//   const raw_dose_parts = dose_str ? dose_str.split(';').map((p) => p.trim()).filter(Boolean) : []
//   const dose_segment_types = raw_dose_parts.map(getDoseSegmentType)
//   const has_bolus_maintenance = raw_dose_parts.length > 1 && dose_segment_types.some((t) => t !== null)

//   type DoseRecommendation = { age_years_range: { min: number; max?: number }; schedules: NonEmptyArray<ParsedNewSchedule> }

//   let dose_recommendations: NonEmptyArray<DoseRecommendation>

//   if (has_bolus_maintenance) {
//     const schedules = raw_dose_parts.map((part, i) => {
//       const dose_type = dose_segment_types[i]
//       const clean = part.replace(/\bbolus\b|\bloading\s+dose?\b|\bmaintenance\b/gi, '').trim()
//       const strength = parseStrength(clean)

//       if (dose_type === 'bolus') {
//         return { frequencies: ['stat'] as NonEmptyArray<PrescriptionFrequency>, dosage: { value: 1, units: 'DOSE' }, duration: null, strength }
//       } else if (dose_type === 'maintenance') {
//         const duration = dosing_interval ? parseDurationFromHourly(dosing_interval) : null
//         return { frequencies: ['stat'] as NonEmptyArray<PrescriptionFrequency>, dosage: { value: 1, units: 'DOSE' }, duration, strength }
//       } else {
//         return { frequencies: ['prn'] as NonEmptyArray<PrescriptionFrequency>, dosage: { value: 1, units: 'DOSE' }, duration: null, strength }
//       }
//     }) as NonEmptyArray<ParsedNewSchedule>

//     dose_recommendations = [{ age_years_range: default_age_range, schedules }] as NonEmptyArray<DoseRecommendation>
//   } else {
//     const age_qualified_strengths = parseAgeQualifiedStrengths(dose_str, default_age_range)
//     dose_recommendations = age_qualified_strengths.map(({ strength, age_years_range }) => ({
//       age_years_range,
//       schedules: parseDosingIntervalNew(dosing_interval, strength),
//     })) as NonEmptyArray<DoseRecommendation>
//   }

//   return {
//     medicine_name,
//     atc,
//     form,
//     route,
//     aware,
//     acute_chronic,
//     prescriber,
//     special_instructions,
//     icd10_indications,
//     dose_recommendations,
//   }
// }

// // ─── Public entrypoint ───────────────────────────────────────────────────────

// export function parseEMLData(): { parsed: ParsedMedicine[]; failed: { row: EMLRow; reason: string }[] } {
//   const failed: { row: EMLRow; reason: string }[] = []
//   const parsed = compactMap(ZA_ESSENTIAL_MEDICINES, (row) => {
//     try {
//       return parseEMLRow(row)
//     } catch (e) {
//       failed.push({
//         row,
//         reason: stripAnsiCode((e as Error).message),
//       })
//     }
//   })
//   Deno.writeTextFileSync('./db/resources/25_recommended_doses_south_africa_failed.json', humanReadableJson(failed))
//   return { parsed, failed }
// }
