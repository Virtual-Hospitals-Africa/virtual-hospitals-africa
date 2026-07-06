import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { afterAll } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import { snomed_to_icd10 } from '../../db/models/snomed_to_icd10.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'

const adult_context = { sex: 'female' as const, dob: '1988-01-01' }

describeParallel('db/models/snomed_to_icd10.ts', () => {
  afterAll(() => db.destroy())

  itParallel('maps a simple one-to-one concept (type 2 diabetes mellitus -> E11.9)', async () => {
    const result = await snomed_to_icd10.mapConcepts(db, ['44054006'], adult_context)
    const mapping = result.by_concept.get('44054006')
    assertEquals(mapping?.status, 'mapped')
    assertEquals(mapping?.codes.map((code) => code.icd10_code), ['E11.9'])
    assertEquals(mapping?.codes.find((code) => code.icd10_code === 'E11.9')?.is_primary, true)
  })

  itParallel('maps asthma -> J45.9', async () => {
    const result = await snomed_to_icd10.mapConcepts(db, ['195967001'], adult_context)
    assertEquals(result.by_concept.get('195967001')?.codes.map((code) => code.icd10_code), ['J45.9'])
  })

  itParallel('returns every map group for a multi-group concept, primary code first', async () => {
    const result = await snomed_to_icd10.mapConcepts(db, ['103981000119101'], adult_context)
    assertEquals(
      result.by_concept.get('103981000119101')?.codes.map((code) => code.icd10_code),
      ['E14.3', 'H36.0', 'Y83.9'],
    )
  })

  itParallel('uses primary map group codes only for EML lookup', async () => {
    const result = await snomed_to_icd10.mapConcepts(db, ['103981000119101'], adult_context)
    assertEquals(snomed_to_icd10.primaryIcd10CodesForLookup(result), ['E14.3'])
  })

  itParallel('reports unresolved context when sex-dependent rules cannot be matched', async () => {
    const result = await snomed_to_icd10.mapConcepts(db, ['1259396001'], { sex: 'female', dob: '1988-01-01' })
    const female_mapping = result.by_concept.get('1259396001')
    assertEquals(female_mapping?.status, 'mapped')
    assertEquals(female_mapping?.codes.map((code) => code.icd10_code), ['C57.9'])
    assertEquals(female_mapping?.codes.find((code) => code.icd10_code === 'C57.9')?.resolved_via, 'context')

    const male_result = await snomed_to_icd10.mapConcepts(db, ['1259396001'], { sex: 'male', dob: '1988-01-01' })
    assertEquals(
      male_result.by_concept.get('1259396001')?.codes.map((code) => code.icd10_code),
      ['C63.9'],
    )
  })

  itParallel('resolves several concepts at once', async () => {
    const codes = await snomed_to_icd10.icd10Codes(db, ['44054006', '195967001'], adult_context)
    assertEquals(codes.get('44054006'), ['E11.9'])
    assertEquals(codes.get('195967001'), ['J45.9'])
  })

  itParallel('returns an empty map when given no concepts', async () => {
    const result = await snomed_to_icd10.mapConcepts(db, [], adult_context)
    assertEquals(result.by_concept.size, 0)
  })
})
