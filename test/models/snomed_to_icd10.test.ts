import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { afterAll } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import { snomed_to_icd10 } from '../../db/models/snomed_to_icd10.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { RenderedPositiveRecordRelativeToHealthWorker } from '../../types.ts'
import { PEPTIC_ULCER } from '../../shared/snomed_concepts.ts'

const adult_context = { sex: 'female' as const, dob: '1988-01-01' }

// mapConcepts only reads the record's SNOMED concept id; the result map is
// keyed by the record itself
function asPositiveRecord(specific_snomed_concept_id: string): RenderedPositiveRecordRelativeToHealthWorker {
  return { specific_snomed_concept_id } as RenderedPositiveRecordRelativeToHealthWorker
}

describeParallel('db/models/snomed_to_icd10.ts', () => {
  afterAll(() => db.destroy())

  itParallel('handles peptic ulcer', async () => {
    const record = asPositiveRecord(PEPTIC_ULCER.id)
    const result = await snomed_to_icd10.mapConcepts(db, adult_context, [record])
    assertEquals(result.by_concept.size, 1)
    const [x] = [...result.by_concept.values()]
    console.log(x)
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
})
