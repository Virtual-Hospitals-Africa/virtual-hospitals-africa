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
import { TrxOrDb } from '../../types.ts'

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

function ifaContextConceptId(map_rule: string): string | null {
  const match = map_rule.match(/^IFA (\d+)/)
  return match?.[1] ?? null
}

function ifaRuleMatches(map_rule: string, context: SnomedIcd10PatientContext): boolean {
  const concept_id = ifaContextConceptId(map_rule)
  if (!concept_id) return false
  if (concept_id === SNOMED_IFA_FEMALE_CONCEPT_ID) return context.sex === 'female'
  if (concept_id === SNOMED_IFA_MALE_CONCEPT_ID) return context.sex === 'male'
  // Age-at-onset IFA rules need the age when the finding began, not current age from DOB.
  if (concept_id === SNOMED_IFA_AGE_AT_ONSET_CONCEPT_ID) return false
  return false
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
    if (ifaRuleMatches(row.map_rule!, context) && row.map_target) {
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
  async mapConcepts(
    trx: TrxOrDb,
    snomed_concept_ids: string[],
    context: SnomedIcd10PatientContext,
  ): Promise<SnomedIcd10MappingResult> {
    const by_concept = new Map<string, SnomedIcd10ConceptMapping>()
    if (!snomed_concept_ids.length) return { by_concept }

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

    const rows_by_concept = new Map<string, ExtendedMapRow[]>()
    for (const row of rows) {
      const concept_id = String(row.referenced_component_id)
      const concept_rows = rows_by_concept.get(concept_id) ?? []
      concept_rows.push({
        referenced_component_id: row.referenced_component_id,
        map_group: row.map_group,
        map_priority: row.map_priority,
        map_rule: row.map_rule,
        map_advice: row.map_advice,
        map_target: row.map_target,
        map_category_id: row.map_category_id,
        correlation_id: row.correlation_id,
      })
      rows_by_concept.set(concept_id, concept_rows)
    }

    for (const snomed_concept_id of snomed_concept_ids) {
      by_concept.set(
        snomed_concept_id,
        buildConceptMapping(
          snomed_concept_id,
          rows_by_concept.get(snomed_concept_id) ?? [],
          context,
        ),
      )
    }

    return { by_concept }
  },

  // Returns every resolved ICD-10 code per SNOMED concept (all map groups).
  async icd10Codes(
    trx: TrxOrDb,
    snomed_concept_ids: string[],
    context: SnomedIcd10PatientContext,
  ): Promise<Map<string, string[]>> {
    const { by_concept } = await this.mapConcepts(trx, snomed_concept_ids, context)
    const codes_by_concept = new Map<string, string[]>()
    for (const [concept_id, mapping] of by_concept) {
      const codes = mapping.codes.map((code) => code.icd10_code)
      if (codes.length) codes_by_concept.set(concept_id, codes)
    }
    return codes_by_concept
  },

  primaryIcd10CodesForLookup(mappings: SnomedIcd10MappingResult): string[] {
    return primaryIcd10CodesFromSnomedMappings(mappings.by_concept.values())
  },
}
