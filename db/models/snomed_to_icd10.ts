import { assert } from 'std/assert/assert.ts'
import {
  primaryIcd10CodesFromSnomedMappings,
  SNOMED_ICD10_COMPLEX_MAP_REFSET_ID,
  SNOMED_MAP_CATEGORY,
  SnomedIcd10CodeMapping,
  SnomedIcd10ConceptMapping,
  SnomedIcd10MappingResult,
  SnomedIcd10MapStatus,
  SnomedIcd10PatientContext,
  SnomedIcd10ResolvedVia,
} from '../../shared/snomed_to_icd10.ts'
import { TrxOrDb } from '../../types.ts'
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

// All distinct IFA (If Applicable) map_rule strings present in the
// International Extended Map (SNOMED release 2025-12-01). If a future SNOMED
// release adds new rules outside this set the assertion in evaluateIFARule will
// catch it so we can update the handling explicitly.
const KNOWN_IFA_RULES = new Set([
  'IFA 248152002 | Female (finding) |',
  'IFA 248153007 | Male (finding) |',
  'IFA 445518008 | Age at onset of clinical finding (observable entity) | <= 15.0 years',
  'IFA 445518008 | Age at onset of clinical finding (observable entity) | < 15.0 years',
  'IFA 445518008 | Age at onset of clinical finding (observable entity) | < 19.0 years',
  'IFA 445518008 | Age at onset of clinical finding (observable entity) | < 28.0 days',
  'IFA 445518008 | Age at onset of clinical finding (observable entity) | <= 18.0 years',
  'IFA 445518008 | Age at onset of clinical finding (observable entity) | >= 12.0 years AND IFA 445518008 | Age at onset of clinical finding (observable entity) | < 19.0 years',
  'IFA 445518008 | Age at onset of clinical finding (observable entity) | >= 65.0 years',
])

// Evaluate a single IFA rule against the patient context.
// Returns true  — condition is met (use this row's ICD-10 code).
// Returns false — condition is not met (skip this row).
// Returns null  — condition cannot be evaluated with available context
//                 (e.g. age-at-onset rules require onset age, not current age).
//                 Callers should fall through to TRUE / OTHERWISE rows.
function evaluateIFARule(map_rule: string, context: SnomedIcd10PatientContext): boolean | null {
  // AND: split on the literal token and require every part to match.
  if (map_rule.includes(' AND ')) {
    const parts = map_rule.split(' AND ')
    const results = parts.map((part) => evaluateIFARule(part.trim(), context))
    if (results.some((r) => r === null)) return null
    return results.every((r) => r === true)
  }

  assert(KNOWN_IFA_RULES.has(map_rule), `Unexpected IFA map_rule: ${map_rule}`)

  if (map_rule === 'IFA 248152002 | Female (finding) |') return context.sex === 'female'
  if (map_rule === 'IFA 248153007 | Male (finding) |') return context.sex === 'male'

  // All remaining rules reference 445518008 (Age at onset of clinical finding).
  // We do not have onset age — only current age from DOB — so these cannot be resolved.
  return null
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
): { code: SnomedIcd10CodeMapping | null; status: SnomedIcd10MapStatus | null } {
  const ifa_rows = rows
    .filter((row) => row.map_rule?.startsWith('IFA '))
    .sort(comparePriority)
  const true_row = rows.find((row) => row.map_rule === 'TRUE')
  const otherwise_row = rows.find((row) => isOtherwiseRule(row.map_rule))

  for (const row of ifa_rows) {
    if (evaluateIFARule(row.map_rule!, context) === true && row.map_target) {
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
    const resolved = resolveMapGroup(group_rows, context)
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
    positive_records: PositiveRecord[],
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
      by_concept.set(
        positive_record,
        buildConceptMapping(
          positive_record.specific_snomed_concept_id,
          rows_by_concept.get(positive_record.specific_snomed_concept_id) ?? [],
          context,
        ),
      )
    }

    return { by_concept }
  },

  primaryIcd10CodesForLookup<PositiveRecord extends { specific_snomed_concept_id: string }>(mappings: SnomedIcd10MappingResult<PositiveRecord>): string[] {
    return primaryIcd10CodesFromSnomedMappings(mappings.by_concept.values())
  },
}
