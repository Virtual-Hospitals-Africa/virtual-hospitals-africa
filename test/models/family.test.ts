import { beforeEach, describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../db/db.ts'
import { resetInTest } from '../../db/reset.ts'
import * as patients from '../../db/models/patients.ts'
import * as family from '../../db/models/family.ts'

describe(
  'db/models/family.ts',
  { sanitizeResources: false },
  () => {
    beforeEach(resetInTest)

    describe('addGuardian', () => {
      it('stores the gender-neutral guardian relationship, returning the ', async () => {
        const guardian = await patients.upsert(db, {
          name: 'Billy Bob',
          gender: 'male',
        })
        const dependent = await patients.upsert(db, {
          name: 'Janey Jane',
          gender: 'female',
        })
        const relation = await family.addGuardian(db, {
          guardian_relation: 'biological parent',
          guardian_patient_id: guardian.id,
          dependent_patient_id: dependent.id,
        })
        const dependent_relations = await family.get(db, {
          patient_id: dependent.id,
        })
        const guardian_relations = await family.get(db, {
          patient_id: guardian.id,
        })
        assertEquals(dependent_relations, {
          guardians: [
            {
              relation_id: relation.id,
              patient_id: guardian.id,
              patient_name: 'Billy Bob',
              patient_phone_number: null,
              family_relation: 'biological parent',
              family_relation_gendered: 'biological father',
            },
          ],
          dependents: [],
        })
        assertEquals(guardian_relations, {
          guardians: [],
          dependents: [
            {
              relation_id: relation.id,
              patient_id: dependent.id,
              patient_name: 'Janey Jane',
              patient_phone_number: null,
              family_relation: 'biological child',
              family_relation_gendered: 'biological daughter',
            },
          ],
        })
      })
    })
  },
)
