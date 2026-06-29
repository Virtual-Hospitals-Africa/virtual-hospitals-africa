import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { afterAll } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import { snomed_to_icd10 } from '../../db/models/snomed_to_icd10.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'

describeParallel('db/models/snomed_to_icd10.ts', () => {
  afterAll(() => db.destroy())

  itParallel('maps a simple one-to-one concept (type 2 diabetes mellitus -> E11.9)', async () => {
    const codes = await snomed_to_icd10.icd10Codes(db, ['44054006'])
    assertEquals(codes.get('44054006'), ['E11.9'])
  })

  itParallel('maps asthma -> J45.9', async () => {
    const codes = await snomed_to_icd10.icd10Codes(db, ['195967001'])
    assertEquals(codes.get('195967001'), ['J45.9'])
  })

  itParallel('returns every map group for a multi-group concept, primary code first', async () => {
    const codes = await snomed_to_icd10.icd10Codes(db, ['103981000119101'])
    assertEquals(codes.get('103981000119101'), ['E14.3', 'H36.0', 'Y83.9'])
  })

  itParallel('omits concepts whose only mappings are context-dependent (no unconditional code)', async () => {
    // 1259396001 maps to C57.9 if female, C63.9 if male; its OTHERWISE default is empty.
    const codes = await snomed_to_icd10.icd10Codes(db, ['1259396001'])
    assertEquals(codes.has('1259396001'), false)
  })

  itParallel('resolves several concepts at once', async () => {
    const codes = await snomed_to_icd10.icd10Codes(db, ['44054006', '195967001'])
    assertEquals(codes.get('44054006'), ['E11.9'])
    assertEquals(codes.get('195967001'), ['J45.9'])
  })

  itParallel('returns an empty map when given no concepts', async () => {
    const codes = await snomed_to_icd10.icd10Codes(db, [])
    assertEquals(codes.size, 0)
  })
})
