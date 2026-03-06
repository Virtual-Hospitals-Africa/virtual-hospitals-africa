// ─── ICD-10 parsing ─────────────────────────────────────────────────────────

/**
 * Expands a single ICD-10 segment that may be a range into individual codes.
 * Handles:
 *   "I48.0-I48.2" (full-code range) → I48.0, I48.1, I48.2
 *   "A15.0-3"     (short range)     → A15.0, A15.1, A15.2, A15.3
 *   "B77.0"       (standalone)      → B77.0
 */
function expandIcd10Range(code: string): string[] {
  const trimmed = code.trim()

  // Full-code range: "I48.0-I48.2" (same base letter+digits, different sub-codes)
  const full_range = trimmed.match(/^([A-Z]\d+)\.(\d+)-[A-Z]\d+\.(\d+)$/)
  if (full_range) {
    const prefix = full_range[1]
    const start = parseInt(full_range[2])
    const end = parseInt(full_range[3])
    const result: string[] = []
    for (let i = start; i <= end; i++) result.push(`${prefix}.${i}`)
    return result
  }

  // Short range: "A15.0-3" (prefix + start digit + "-" + end digit)
  const short_range = trimmed.match(/^([A-Z]\d+\.)(\d)-(\d)$/)
  if (short_range) {
    const prefix = short_range[1]
    const start = parseInt(short_range[2])
    const end = parseInt(short_range[3])
    const result: string[] = []
    for (let i = start; i <= end; i++) result.push(`${prefix}${i}`)
    return result
  }

  if (!trimmed || !/^[A-Z]\d/.test(trimmed)) return []
  return [trimmed]
}

type ICD10IndicationsCodes = { type: 'codes'; codes: string[] }
type ICD10Indications = ICD10IndicationsCodes | { type: 'and'; indications: ICD10IndicationsCodes[] }

/**
 * Expands all ICD-10 codes from a slash-separated group string.
 * When is_parenthesized is true and a single code ends in ".0", strips the ".0"
 * to normalise to the parent code (e.g. "(B20.0)" → "B20").
 */
function expandCodesFromGroup(group: string): string[] {
  const trimmed = group.trim()
  const is_parenthesized = trimmed.startsWith('(') && trimmed.endsWith(')')
  const cleaned = trimmed.replace(/[()]/g, '').trim()

  const codes: string[] = []
  for (const slash_part of cleaned.split('/')) {
    const code_part = slash_part.trim()
    if (!code_part) continue
    const expanded = expandIcd10Range(code_part)
    if (is_parenthesized && expanded.length === 1) {
      codes.push(...expanded.map((c) => c.replace(/\.0$/, '')))
    } else {
      codes.push(...expanded)
    }
  }
  return [...new Set(codes)].filter((c) => /^[A-Z]\d/.test(c))
}

/**
 * Parses the ICD10 CODE column into an ICD10Indications object.
 * "+" separates AND conditions (e.g. primary + complication code).
 * "/" separates alternative codes within a group.
 */
export function parseIcd10Indications(icd10_str: string | null | undefined): ICD10Indications {
  if (!icd10_str) return { type: 'codes', codes: [] }

  const plus_parts = icd10_str.split('+').map((p) => p.trim()).filter(Boolean)

  if (plus_parts.length > 1) {
    return {
      type: 'and',
      indications: plus_parts.map((part) => ({
        type: 'codes' as const,
        codes: expandCodesFromGroup(part),
      })),
    }
  }

  return { type: 'codes', codes: expandCodesFromGroup(icd10_str) }
}
