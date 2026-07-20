import { assert } from 'std/assert/assert.ts'
import {
  primaryIcd10CodesFromSnomedMappings,
  SNOMED_ICD10_COMPLEX_MAP_REFSET_ID,
  SNOMED_IFA_AGE_AT_ONSET_CONCEPT_ID,
  SNOMED_IFA_FEMALE_CONCEPT_ID,
  SNOMED_IFA_MALE_CONCEPT_ID,
  SNOMED_MAP_CATEGORY,
  SnomedIcd10CodeMapping,
  SnomedIcd10ConceptMapping,
  SnomedIcd10MappingResult,
  SnomedIcd10MapStatus,
  SnomedIcd10PatientContext,
  SnomedIcd10ResolvedVia,
} from '../../shared/snomed_to_icd10.ts'
import { RenderedPositiveRecordRelativeToHealthWorker, TrxOrDb } from '../../types.ts'
import { groupBy } from '../../util/groupBy.ts'

type ExtendedMapRow = {
  referenced_component_id: string | bigint
  map_group: string | bigint
  map_priority: string | bigint
  map_rule: string | null
  map_advice: string | null
  map_target: string | null
  map_category_id: string | bigint
  correlation_id: string | bigint
}

// The International Extended Map (release 2025-12-01) contains exactly 9
// non-TRUE/OTHERWISE map_rule rows, 8 distinct clauses (one row is a compound
// AND of two age-at-onset clauses). Hardcoded per mentor guidance rather than
// generically parsed, since the set is small and stable. If a future SNOMED
// release introduces a rule outside this set, evaluateIFAClause asserts below
// so we notice and add explicit handling instead of silently mismapping.
const SEX_IFA_RULES: Record<string, 'female' | 'male'> = {
  [`IFA ${SNOMED_IFA_FEMALE_CONCEPT_ID} | Female (finding) |`]: 'female',
  [`IFA ${SNOMED_IFA_MALE_CONCEPT_ID} | Male (finding) |`]: 'male',
}

type AgeAtOnsetClause = {
  comparator: '<' | '<=' | '>='
  value: number
  unit: 'years' | 'days'
}

const AGE_AT_ONSET_IFA_PREFIX = `IFA ${SNOMED_IFA_AGE_AT_ONSET_CONCEPT_ID} | Age at onset of clinical finding (observable entity) | `

// Includes '>= 12.0 years', which never appears as its own row — only as the
// first clause of the single AND row.
const AGE_AT_ONSET_IFA_CLAUSES: Record<string, AgeAtOnsetClause> = {
  [`${AGE_AT_ONSET_IFA_PREFIX}< 15.0 years`]: { comparator: '<', value: 15, unit: 'years' },
  [`${AGE_AT_ONSET_IFA_PREFIX}<= 15.0 years`]: { comparator: '<=', value: 15, unit: 'years' },
  [`${AGE_AT_ONSET_IFA_PREFIX}< 19.0 years`]: { comparator: '<', value: 19, unit: 'years' },
  [`${AGE_AT_ONSET_IFA_PREFIX}< 28.0 days`]: { comparator: '<', value: 28, unit: 'days' },
  [`${AGE_AT_ONSET_IFA_PREFIX}<= 18.0 years`]: { comparator: '<=', value: 18, unit: 'years' },
  [`${AGE_AT_ONSET_IFA_PREFIX}>= 65.0 years`]: { comparator: '>=', value: 65, unit: 'years' },
  [`${AGE_AT_ONSET_IFA_PREFIX}>= 12.0 years`]: { comparator: '>=', value: 12, unit: 'years' },
}

// Age in days between the patient's DOB and when the finding/diagnosis was
// recorded — this is what the age-at-onset IFA rules actually need, not the
// patient's current age. Returns null if either date is missing/invalid so
// callers can fall through to TRUE/OTHERWISE rather than mismatching on NaN.
function ageAtOnsetInDays(dob: string, onset_date: Date | string): number | null {
  const birth_date = new Date(dob)
  const onset = new Date(onset_date)
  if (Number.isNaN(birth_date.getTime()) || Number.isNaN(onset.getTime())) return null
  return (onset.getTime() - birth_date.getTime()) / (1000 * 60 * 60 * 24)
}

function evaluateAgeAtOnsetClause(clause: AgeAtOnsetClause, onset_age_days: number): boolean {
  const threshold_days = clause.unit === 'years' ? clause.value * 365.25 : clause.value
  switch (clause.comparator) {
    case '<':
      return onset_age_days < threshold_days
    case '<=':
      return onset_age_days <= threshold_days
    case '>=':
      return onset_age_days >= threshold_days
  }
}

// Evaluates a single (non-AND) clause.
// Returns true/false when it can be resolved with available context.
// Returns null when the clause is an age-at-onset check but we don't have an
// onset date for this finding (caller should fall through to TRUE/OTHERWISE).
function evaluateIFAClause(
  clause: string,
  context: SnomedIcd10PatientContext,
  onset_age_days: number | null,
): boolean | null {
  const sex = SEX_IFA_RULES[clause]
  if (sex) return context.sex === sex

  const age_clause = AGE_AT_ONSET_IFA_CLAUSES[clause]
  if (age_clause) {
    if (onset_age_days === null) return null
    return evaluateAgeAtOnsetClause(age_clause, onset_age_days)
  }

  assert(false, `Unexpected IFA map_rule clause: ${clause}`)
}

// Handles the single known AND rule generically by splitting on ' AND ' and
// requiring every clause to resolve to true. Any clause that can't be
// resolved (missing onset date) makes the whole rule unresolved.
function evaluateIFARule(
  map_rule: string,
  context: SnomedIcd10PatientContext,
  onset_age_days: number | null,
): boolean | null {
  const results = map_rule.split(' AND ').map((clause) => evaluateIFAClause(clause.trim(), context, onset_age_days))
  if (results.some((result) => result === null)) return null
  return results.every((result) => result === true)
}

function isOtherwiseRule(map_rule: string | null): boolean {
  return !!map_rule?.startsWith('OTHERWISE')
}

function comparePriority(
  left: ExtendedMapRow,
  right: ExtendedMapRow,
): number {
  return Number(left.map_priority) - Number(right.map_priority)
}

function resolveMapGroup(
  rows: ExtendedMapRow[],
  context: SnomedIcd10PatientContext,
  onset_age_days: number | null,
): { code: SnomedIcd10CodeMapping | null; status: SnomedIcd10MapStatus | null } {
  const ifa_rows = rows
    .filter((row) => row.map_rule?.startsWith('IFA '))
    .sort(comparePriority)
  const true_row = rows.find((row) => row.map_rule === 'TRUE')
  const otherwise_row = rows.find((row) => isOtherwiseRule(row.map_rule))

  for (const row of ifa_rows) {
    if (evaluateIFARule(row.map_rule!, context, onset_age_days) === true && row.map_target) {
      return {
        code: rowToCodeMapping(row, 'context'),
        status: 'mapped',
      }
    }
  }

  if (true_row?.map_target) {
    return {
      code: rowToCodeMapping(true_row, 'unconditional'),
      status: 'mapped',
    }
  }

  if (otherwise_row?.map_target) {
    return {
      code: rowToCodeMapping(otherwise_row, 'fallback'),
      status: 'mapped',
    }
  }

  if (ifa_rows.length) {
    return {
      code: null,
      status: 'unresolved_context',
    }
  }

  if (otherwise_row && otherwise_row.map_category_id === SNOMED_MAP_CATEGORY.not_classifiable) {
    return {
      code: null,
      status: 'not_classifiable',
    }
  }

  return {
    code: null,
    status: null,
  }
}

function rowToCodeMapping(
  row: ExtendedMapRow,
  resolved_via: SnomedIcd10ResolvedVia,
): SnomedIcd10CodeMapping {
  const map_group = Number(row.map_group)
  return {
    icd10_code: row.map_target!,
    map_group,
    is_primary: map_group === 1,
    map_category_id: String(row.map_category_id),
    correlation_id: String(row.correlation_id),
    map_rule: row.map_rule ?? '',
    map_advice: row.map_advice,
    resolved_via,
  }
}

function buildConceptMapping(
  snomed_concept_id: string,
  rows: ExtendedMapRow[],
  context: SnomedIcd10PatientContext,
  onset_age_days: number | null,
): SnomedIcd10ConceptMapping {
  if (!rows.length) {
    return {
      snomed_concept_id,
      status: 'no_mapping',
      codes: [],
    }
  }

  const rows_by_group = new Map<number, ExtendedMapRow[]>()
  for (const row of rows) {
    const map_group = Number(row.map_group)
    const group_rows = rows_by_group.get(map_group) ?? []
    group_rows.push(row)
    rows_by_group.set(map_group, group_rows)
  }

  const codes: SnomedIcd10CodeMapping[] = []
  let unresolved_status: SnomedIcd10MapStatus | null = null

  for (const map_group of [...rows_by_group.keys()].sort((left, right) => left - right)) {
    const group_rows = rows_by_group.get(map_group)
    if (!group_rows) continue
    const resolved = resolveMapGroup(group_rows, context, onset_age_days)
    if (resolved.code) {
      codes.push(resolved.code)
    } else if (resolved.status === 'unresolved_context' || resolved.status === 'not_classifiable') {
      unresolved_status = resolved.status
    }
  }

  if (codes.length) {
    return {
      snomed_concept_id,
      status: 'mapped',
      codes,
    }
  }

  return {
    snomed_concept_id,
    status: unresolved_status ?? 'not_classifiable',
    codes: [],
  }
}

export const snomed_to_icd10 = {
  async mapConcepts<PositiveRecord extends { specific_snomed_concept_id: string }>(
    trx: TrxOrDb,
    context: SnomedIcd10PatientContext,
    positive_records: RenderedPositiveRecordRelativeToHealthWorker[],
  ): Promise<SnomedIcd10MappingResult<PositiveRecord>> {
    if (!positive_records.length) {
      return { by_concept: new Map() }
    }
    const snomed_concept_ids = positive_records.map((record) => record.specific_snomed_concept_id)

    const rows = await trx
      .selectFrom('snomed_iissscc_refset_extended_map')
      .where('refset_id', '=', SNOMED_ICD10_COMPLEX_MAP_REFSET_ID)
      .where('active', '=', true)
      .where('referenced_component_id', 'in', snomed_concept_ids)
      .select([
        'referenced_component_id',
        'map_group',
        'map_priority',
        'map_rule',
        'map_advice',
        'map_target',
        'map_category_id',
        'correlation_id',
      ])
      .orderBy('referenced_component_id')
      .orderBy('map_group')
      .orderBy('map_priority')
      .execute()

    const rows_by_concept = groupBy(rows, 'referenced_component_id')

    const by_concept = new Map()
    for (const positive_record of positive_records) {
      const onset_age_days = ageAtOnsetInDays(context.dob, positive_record.created_at)
      by_concept.set(
        positive_record,
        buildConceptMapping(
          positive_record.specific_snomed_concept_id,
          rows_by_concept.get(positive_record.specific_snomed_concept_id) ?? [],
          context,
          onset_age_days,
        ),
      )
    }

    return { by_concept }
  },

  primaryIcd10CodesForLookup<PositiveRecord extends { specific_snomed_concept_id: string }>(mappings: SnomedIcd10MappingResult<PositiveRecord>): string[] {
    return primaryIcd10CodesFromSnomedMappings(mappings.by_concept.values())
  },
}
