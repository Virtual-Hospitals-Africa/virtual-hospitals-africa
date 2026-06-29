import { TrxOrDb } from '../../types.ts'

// SNOMED CT International edition ICD-10 complex map reference set.
// Every row in snomed_iissscc_refset_extended_map belongs to this refset.
const ICD10_COMPLEX_MAP_REFSET_ID = '447562003'

export const snomed_to_icd10 = {
  // Resolves SNOMED concept ids to their mapped ICD-10 codes via the
  // International ICD-10 complex map reference set
  // (der2_iisssccRefset_ExtendedMap, loaded by the snomed base seed).
  //
  // The map is deliberately not one-to-one:
  //  - A concept can produce several ICD-10 codes, one per map group: a primary
  //    code in group 1 plus supplementary manifestation/external-cause codes in
  //    later groups. Codes are returned ordered by group, so the primary code is
  //    first.
  //  - Within a group the chosen code can be context dependent (mapRule "IFA ...").
  //    We take the single unconditional default of each group (the lone "TRUE" or
  //    "OTHERWISE TRUE" row), which is the correct context-free resolution.
  //  - Some concepts cannot be classified and yield no code; they are omitted
  //    from the returned map.
  //
  // TODO: sex/age dependent IFA rules (e.g. C57.9 if female, C63.9 if male) could
  // be resolved more precisely once patient demographics are available, rather
  // than falling back to the (often empty) OTHERWISE default.
  async icd10Codes(
    trx: TrxOrDb,
    snomed_concept_ids: string[],
  ): Promise<Map<string, string[]>> {
    const codes_by_concept = new Map<string, string[]>()
    if (!snomed_concept_ids.length) return codes_by_concept

    const rows = await trx
      .selectFrom('snomed_iissscc_refset_extended_map')
      .where('refset_id', '=', ICD10_COMPLEX_MAP_REFSET_ID)
      .where('active', '=', true)
      .where('referenced_component_id', 'in', snomed_concept_ids)
      .where('map_target', 'is not', null)
      .where('map_target', '!=', '')
      .where((eb) =>
        eb.or([
          eb('map_rule', '=', 'TRUE'),
          eb('map_rule', 'like', 'OTHERWISE%'),
        ])
      )
      .select(['referenced_component_id', 'map_target'])
      .orderBy('referenced_component_id')
      .orderBy('map_group')
      .execute()

    for (const { referenced_component_id, map_target } of rows) {
      if (!map_target) continue
      const concept_id = String(referenced_component_id)
      const codes = codes_by_concept.get(concept_id) ?? []
      if (!codes.includes(map_target)) codes.push(map_target)
      codes_by_concept.set(concept_id, codes)
    }

    return codes_by_concept
  },
}
