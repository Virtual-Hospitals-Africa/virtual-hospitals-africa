import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { afterAll } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import { snomed_to_icd10 } from '../../db/models/snomed_to_icd10.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { RenderedPositiveRecordRelativeToHealthWorker } from '../../types.ts'
import { PEPTIC_ULCER } from '../../shared/snomed_concepts.ts'

const adult_context = { sex: 'female' as const, dob: '1988-01-01' }

// mapConcepts reads the record's SNOMED concept id and created_at (onset date for
// age-at-onset IFA rules). The result map is keyed by the record itself.
function asPositiveRecord(
  specific_snomed_concept_id: string,
  created_at?: Date | string,
): RenderedPositiveRecordRelativeToHealthWorker {
  return {
    specific_snomed_concept_id,
    ...(created_at !== undefined ? { created_at } : {}),
  } as RenderedPositiveRecordRelativeToHealthWorker
}

function mappedCodes(
  result: Awaited<ReturnType<typeof snomed_to_icd10.mapConcepts>>,
  record: RenderedPositiveRecordRelativeToHealthWorker,
) {
  return result.by_concept.get(record)?.codes.map((code) => code.icd10_code)
}

describeParallel('db/models/snomed_to_icd10.ts', () => {
  afterAll(() => db.destroy())

  itParallel('handles peptic ulcer', async () => {
    const record = asPositiveRecord(PEPTIC_ULCER.id)
    const result = await snomed_to_icd10.mapConcepts(db, adult_context, [record])
    assertEquals(result.by_concept.size, 1)
    const [mapped] = [...result.by_concept.values()]
    assertEquals(mapped, {
      snomed_concept_id: '13200003',
      status: 'mapped',
      codes: [
        {
          icd10_code: 'K27.9',
          map_group: 1,
          is_primary: true,
          map_category_id: '447637006',
          correlation_id: '447561005',
          map_rule: 'TRUE',
          map_advice: 'ALWAYS K27.9',
          resolved_via: 'unconditional',
        },
      ],
    })
  })

  itParallel('maps a simple one-to-one concept (type 2 diabetes mellitus -> E11.9)', async () => {
    const record = asPositiveRecord('44054006')
    const result = await snomed_to_icd10.mapConcepts(db, adult_context, [record])
    const mapping = result.by_concept.get(record)
    assertEquals(mapping?.status, 'mapped')
    assertEquals(mapping?.codes.map((code) => code.icd10_code), ['E11.9'])
    assertEquals(mapping?.codes.find((code) => code.icd10_code === 'E11.9')?.is_primary, true)
  })

  itParallel('maps asthma -> J45.9', async () => {
    const record = asPositiveRecord('195967001')
    const result = await snomed_to_icd10.mapConcepts(db, adult_context, [record])
    assertEquals(result.by_concept.get(record)?.codes.map((code) => code.icd10_code), ['J45.9'])
  })

  itParallel('returns every map group for a multi-group concept, primary code first', async () => {
    const record = asPositiveRecord('103981000119101')
    const result = await snomed_to_icd10.mapConcepts(db, adult_context, [record])
    assertEquals(
      result.by_concept.get(record)?.codes.map((code) => code.icd10_code),
      ['E14.3', 'H36.0', 'Y83.9'],
    )
  })

  itParallel('uses primary map group codes only for EML lookup', async () => {
    const record = asPositiveRecord('103981000119101')
    const result = await snomed_to_icd10.mapConcepts(db, adult_context, [record])
    assertEquals(snomed_to_icd10.primaryIcd10CodesForLookup(result), ['E14.3'])
  })

  itParallel('reports unresolved context when sex-dependent rules cannot be matched', async () => {
    const record = asPositiveRecord('1259396001')
    const result = await snomed_to_icd10.mapConcepts(db, { sex: 'female', dob: '1988-01-01' }, [record])
    const female_mapping = result.by_concept.get(record)
    assertEquals(female_mapping?.status, 'mapped')
    assertEquals(female_mapping?.codes.map((code) => code.icd10_code), ['C57.9'])
    assertEquals(female_mapping?.codes.find((code) => code.icd10_code === 'C57.9')?.resolved_via, 'context')

    const male_result = await snomed_to_icd10.mapConcepts(db, { sex: 'male', dob: '1988-01-01' }, [record])
    assertEquals(
      male_result.by_concept.get(record)?.codes.map((code) => code.icd10_code),
      ['C63.9'],
    )
  })

  itParallel('returns an empty map when given no concepts', async () => {
    const result = await snomed_to_icd10.mapConcepts(db, adult_context, [])
    assertEquals(result.by_concept.size, 0)
  })

  // --- Hardcoded IFA rules (sex + age-at-onset, including AND) ---

  itParallel('resolves sex IFA rules for infertility (8619003): female→N97.9, male→N46', async () => {
    const record = asPositiveRecord('8619003')
    const female_result = await snomed_to_icd10.mapConcepts(db, { sex: 'female', dob: '1988-01-01' }, [record])
    assertEquals(mappedCodes(female_result, record), ['N97.9'])
    assertEquals(female_result.by_concept.get(record)?.codes.find((c) => c.icd10_code === 'N97.9')?.resolved_via, 'context')

    const male_result = await snomed_to_icd10.mapConcepts(db, { sex: 'male', dob: '1988-01-01' }, [record])
    assertEquals(mappedCodes(male_result, record), ['N46'])
  })

  itParallel('resolves age-at-onset < 28 days (95350002): newborn→P83.0, older→M34.8', async () => {
    const dob = '2024-01-01'
    const context = { sex: 'female' as const, dob }

    const newborn = asPositiveRecord('95350002', '2024-01-10') // 9 days old
    const newborn_result = await snomed_to_icd10.mapConcepts(db, context, [newborn])
    assertEquals(mappedCodes(newborn_result, newborn), ['P83.0'])
    assertEquals(newborn_result.by_concept.get(newborn)?.codes.find((c) => c.icd10_code === 'P83.0')?.resolved_via, 'context')

    const older = asPositiveRecord('95350002', '2024-03-01') // ~2 months
    const older_result = await snomed_to_icd10.mapConcepts(db, context, [older])
    assertEquals(mappedCodes(older_result, older), ['M34.8'])
    assertEquals(older_result.by_concept.get(older)?.codes.find((c) => c.icd10_code === 'M34.8')?.resolved_via, 'fallback')
  })

  itParallel('resolves age-at-onset <= 15 years (13617004): child→J20.9, adult→J40', async () => {
    const child = asPositiveRecord('13617004', '2024-01-01') // onset at ~14y with dob 2010
    const child_result = await snomed_to_icd10.mapConcepts(
      db,
      { sex: 'female', dob: '2010-01-01' },
      [child],
    )
    assertEquals(mappedCodes(child_result, child), ['J20.9'])

    const adult = asPositiveRecord('13617004', '2024-01-01') // onset at ~24y
    const adult_result = await snomed_to_icd10.mapConcepts(
      db,
      { sex: 'female', dob: '2000-01-01' },
      [adult],
    )
    assertEquals(mappedCodes(adult_result, adult), ['J40'])
  })

  itParallel('resolves age-at-onset < 15 years (785728005): under-15→J20.9, older→J40', async () => {
    const under_15 = asPositiveRecord('785728005', '2024-01-01')
    const under_15_result = await snomed_to_icd10.mapConcepts(
      db,
      { sex: 'female', dob: '2010-06-01' }, // ~13.5y
      [under_15],
    )
    assertEquals(mappedCodes(under_15_result, under_15), ['J20.9'])

    const over_15 = asPositiveRecord('785728005', '2024-01-01')
    const over_15_result = await snomed_to_icd10.mapConcepts(
      db,
      { sex: 'female', dob: '2005-01-01' }, // ~19y
      [over_15],
    )
    assertEquals(mappedCodes(over_15_result, over_15), ['J40'])
  })

  itParallel('resolves age-at-onset <=18 / >=65 on same concept (717934004)', async () => {
    // priority 1: <= 18y → E55.0
    const adolescent = asPositiveRecord('717934004', '2024-01-01')
    const adolescent_result = await snomed_to_icd10.mapConcepts(
      db,
      { sex: 'female', dob: '2010-01-01' }, // ~14y
      [adolescent],
    )
    assertEquals(mappedCodes(adolescent_result, adolescent), ['E55.0'])

    // priority 2: >= 65y → M83.19
    const elderly = asPositiveRecord('717934004', '2024-01-01')
    const elderly_result = await snomed_to_icd10.mapConcepts(
      db,
      { sex: 'female', dob: '1950-01-01' }, // ~74y
      [elderly],
    )
    assertEquals(mappedCodes(elderly_result, elderly), ['M83.19'])

    // OTHERWISE → M83.89
    const middle_age = asPositiveRecord('717934004', '2024-01-01')
    const middle_age_result = await snomed_to_icd10.mapConcepts(
      db,
      { sex: 'female', dob: '1980-01-01' }, // ~44y
      [middle_age],
    )
    assertEquals(mappedCodes(middle_age_result, middle_age), ['M83.89'])
  })

  itParallel('resolves the AND age-at-onset rule (440311000124109): [12,19)→Z00.3, <19→Z00.2', async () => {
    // priority 1: >= 12 AND < 19 → Z00.3
    const teen = asPositiveRecord('440311000124109', '2024-01-01')
    const teen_result = await snomed_to_icd10.mapConcepts(
      db,
      { sex: 'female', dob: '2009-01-01' }, // ~15y
      [teen],
    )
    assertEquals(mappedCodes(teen_result, teen), ['Z00.3'])
    assertEquals(teen_result.by_concept.get(teen)?.codes.find((c) => c.icd10_code === 'Z00.3')?.resolved_via, 'context')

    // priority 2: < 19 (AND fails because age < 12) → Z00.2
    const young_child = asPositiveRecord('440311000124109', '2024-01-01')
    const young_child_result = await snomed_to_icd10.mapConcepts(
      db,
      { sex: 'female', dob: '2019-01-01' }, // ~5y
      [young_child],
    )
    assertEquals(mappedCodes(young_child_result, young_child), ['Z00.2'])

    // both IFA rules fail; OTHERWISE TRUE has null target → unresolved_context
    const adult = asPositiveRecord('440311000124109', '2024-01-01')
    const adult_result = await snomed_to_icd10.mapConcepts(
      db,
      { sex: 'female', dob: '1990-01-01' }, // ~34y
      [adult],
    )
    assertEquals(adult_result.by_concept.get(adult)?.status, 'unresolved_context')
    assertEquals(mappedCodes(adult_result, adult), [])
  })
})
