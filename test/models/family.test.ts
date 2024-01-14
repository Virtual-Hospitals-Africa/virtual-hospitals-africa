import { describe } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import * as patients from '../../db/models/patients.ts'
import * as family from '../../db/models/family.ts'
import { itUsesTrxAnd } from '../web/utilities.ts'

describe(
  'db/models/family.ts',
  { sanitizeResources: false },
  () => {
    describe('addGuardian', () => {
      itUsesTrxAnd('stores the gender-neutral guardian relationship', async (trx) => {
        const guardian = await patients.upsert(trx, {
          name: 'Billy Bob',
          gender: 'male',
        })
        const dependent = await patients.upsert(trx, {
          name: 'Janey Jane',
          gender: 'female',
        })
        const relation = await family.addGuardian(trx, {
          guardian_relation: 'biological parent',
          guardian_patient_id: guardian.id,
          dependent_patient_id: dependent.id,
        })
        const dependent_relations = await family.get(trx, {
          patient_id: dependent.id,
        })
        const guardian_relations = await family.get(trx, {
          patient_id: guardian.id,
        })

        assertEquals(dependent_relations, {
          guardians: [
            {
              relation_id: relation.id,
              patient_id: guardian.id,
              patient_name: 'Billy Bob',
              patient_phone_number: null,
              guardian_relation: 'biological parent',
              family_relation: 'biological parent',
              family_relation_gendered: 'biological father',
              patient_gender: 'male',
              next_of_kin: false,
            },
          ],
          dependents: [],
          marital_status: 'TODO',
          religion: 'TODO',
          other_next_of_kin: undefined,
        })
        assertEquals(guardian_relations, {
          guardians: [],
          dependents: [
            {
              relation_id: relation.id,
              patient_id: dependent.id,
              patient_name: 'Janey Jane',
              patient_phone_number: null,
              guardian_relation: 'biological parent',
              family_relation: 'biological child',
              family_relation_gendered: 'biological daughter',
              patient_gender: 'female',
            },
          ],
          marital_status: 'TODO',
          religion: 'TODO',
          other_next_of_kin: undefined,
        })
      })
    })

    describe('upsert', () => {
      itUsesTrxAnd("updates an existing patient's gender if the provided family relation is gendered", async (trx) => {
        const dependent = await patients.upsert(trx, { name: 'Billy Bob' })
        const guardian = await patients.upsert(trx, { name: 'Janey Jane' })
        await family.upsert(trx, dependent.id, {
          guardians: [{
            family_relation_gendered: 'biological mother',
            patient_id: guardian.id,
            patient_name: 'Janey Jane',
            patient_phone_number: '555-555-5555',
            next_of_kin: true,
          }],
          dependents: [],
          other_next_of_kin: undefined,
        })
        const relations = await family.get(trx, { patient_id: dependent.id })
        assertEquals(relations, {
          dependents: [],
          guardians: [{
            family_relation: 'biological parent',
            family_relation_gendered: 'biological mother',
            guardian_relation: 'biological parent',
            patient_gender: 'female',
            patient_id: guardian.id,
            patient_name: 'Janey Jane',
            patient_phone_number: '555-555-5555',
            relation_id: relations['guardians'][0].relation_id,
            next_of_kin: true,
          }],
          marital_status: 'TODO',
          religion: 'TODO',
          other_next_of_kin: undefined,
        })
      })

      itUsesTrxAnd("does not update an existing patient's gender if the provided family relation is not gendered", async (trx) => {
        const dependent = await patients.upsert(trx, { name: 'Billy Bob' })
        const guardian = await patients.upsert(trx, {
          name: 'Janey Jane',
          gender: 'female',
        })
        await family.upsert(trx, dependent.id, {
          guardians: [{
            family_relation_gendered: 'biological parent',
            patient_id: guardian.id,
            patient_name: 'Janey Jane',
            patient_phone_number: '555-555-5555',
            next_of_kin: false,
          }],
          dependents: [],
          other_next_of_kin: undefined,
        })
        const relations = await family.get(trx, { patient_id: dependent.id })
        assertEquals(relations, {
          dependents: [],
          guardians: [{
            family_relation: 'biological parent',
            family_relation_gendered: 'biological mother',
            guardian_relation: 'biological parent',
            patient_gender: 'female',
            patient_id: guardian.id,
            patient_name: 'Janey Jane',
            patient_phone_number: '555-555-5555',
            relation_id: relations['guardians'][0].relation_id,
            next_of_kin: false,
          }],
          marital_status: 'TODO',
          religion: 'TODO',
          other_next_of_kin: undefined,
        })
      })

      itUsesTrxAnd('inserts a new patient if a specified guardian does not already exist', async (trx) => {
        const dependent = await patients.upsert(trx, { name: 'Billy Bob' })

        await family.upsert(trx, dependent.id, {
          guardians: [{
            family_relation_gendered: 'biological mother',
            patient_name: 'Janey Jane',
            patient_phone_number: '555-555-5555',
            next_of_kin: false,
          }],
          dependents: [],
          other_next_of_kin: undefined,
        })
        const relations = await family.get(trx, { patient_id: dependent.id })
        assertEquals(relations, {
          dependents: [],
          guardians: [{
            family_relation: 'biological parent',
            family_relation_gendered: 'biological mother',
            guardian_relation: 'biological parent',
            patient_gender: 'female',
            patient_id: relations['guardians'][0].patient_id,
            patient_name: 'Janey Jane',
            patient_phone_number: '555-555-5555',
            relation_id: relations['guardians'][0].relation_id,
            next_of_kin: false,
          }],
          marital_status: 'TODO',
          religion: 'TODO',
          other_next_of_kin: undefined,
        })
      })

      itUsesTrxAnd('removes an existing relation, but not the patient if not present', async (trx) => {
        const dependent = await patients.upsert(trx, { name: 'Billy Bob' })
        const guardian = await patients.upsert(trx, {
          name: 'Janey Jane',
          gender: 'female',
        })

        await family.addGuardian(trx, {
          guardian_relation: 'biological parent',
          guardian_patient_id: guardian.id,
          dependent_patient_id: dependent.id,
        })

        await family.upsert(trx, dependent.id, {
          guardians: [],
          dependents: [],
          other_next_of_kin: undefined,
        })
        const relations = await family.get(trx, { patient_id: dependent.id })
        assertEquals(relations, {
          dependents: [],
          guardians: [],
          marital_status: 'TODO',
          religion: 'TODO',
          other_next_of_kin: undefined,
        })
        assertEquals(
          (await patients.getByID(trx, { id: guardian.id })).name,
          'Janey Jane',
        )
      })

      itUsesTrxAnd('supports changing your next of kin', async (trx) => {
        const dependent = await patients.upsert(trx, { name: 'Billy Bob' })

        await family.upsert(trx, dependent.id, {
          guardians: [{
            family_relation_gendered: 'biological mother',
            patient_name: 'Janey Jane',
            patient_phone_number: '555-555-5555',
            next_of_kin: false,
          }, {
            family_relation_gendered: 'biological father',
            patient_name: 'James Doe',
            patient_phone_number: '555-555-5556',
            next_of_kin: true,
          }],
          dependents: [],
          other_next_of_kin: undefined,
        })
        const relations = await family.get(trx, { patient_id: dependent.id })
        assertEquals(relations, {
          dependents: [],
          guardians: [{
            family_relation: 'biological parent',
            family_relation_gendered: 'biological mother',
            guardian_relation: 'biological parent',
            patient_gender: 'female',
            patient_id: relations['guardians'][0].patient_id,
            patient_name: 'Janey Jane',
            patient_phone_number: '555-555-5555',
            relation_id: relations['guardians'][0].relation_id,
            next_of_kin: false,
          }, {
            family_relation: 'biological parent',
            family_relation_gendered: 'biological father',
            guardian_relation: 'biological parent',
            patient_gender: 'male',
            patient_id: relations['guardians'][1].patient_id,
            patient_name: 'James Doe',
            patient_phone_number: '555-555-5556',
            relation_id: relations['guardians'][1].relation_id,
            next_of_kin: true,
          }],
          marital_status: 'TODO',
          religion: 'TODO',
          other_next_of_kin: undefined,
        })

        await family.upsert(trx, dependent.id, {
          guardians: [{
            family_relation_gendered: 'biological mother',
            patient_id: relations['guardians'][0].patient_id,
            patient_name: 'Janey Jane',
            patient_phone_number: '555-555-5555',
            next_of_kin: true,
          }, {
            family_relation_gendered: 'biological father',
            patient_id: relations['guardians'][1].patient_id,
            patient_name: 'James Doe',
            patient_phone_number: '555-555-5556',
            next_of_kin: false,
          }],
          dependents: [],
          other_next_of_kin: undefined,
        })

        const modified_relations = await family.get(trx, {
          patient_id: dependent.id,
        })
        assertEquals(modified_relations, {
          dependents: [],
          guardians: [{
            family_relation: 'biological parent',
            family_relation_gendered: 'biological mother',
            guardian_relation: 'biological parent',
            patient_gender: 'female',
            patient_id: relations['guardians'][0].patient_id,
            patient_name: 'Janey Jane',
            patient_phone_number: '555-555-5555',
            relation_id: relations['guardians'][0].relation_id,
            next_of_kin: true,
          }, {
            family_relation: 'biological parent',
            family_relation_gendered: 'biological father',
            guardian_relation: 'biological parent',
            patient_gender: 'male',
            patient_id: relations['guardians'][1].patient_id,
            patient_name: 'James Doe',
            patient_phone_number: '555-555-5556',
            relation_id: relations['guardians'][1].relation_id,
            next_of_kin: false,
          }],
          marital_status: 'TODO',
          religion: 'TODO',
          other_next_of_kin: undefined,
        })
      })

      itUsesTrxAnd('inserts a new patient other next of kin', async (trx) => {
        const dependent = await patients.upsert(trx, { name: 'Billy Bob' })

        await family.upsert(trx, dependent.id, {
          guardians: [],
          dependents: [],
          other_next_of_kin: {
            family_relation_gendered: 'biological mother',
            patient_name: 'Janey Jane',
            patient_phone_number: '555-555-5555',
            next_of_kin: true,
          },
        })
        const relations = await family.get(trx, { patient_id: dependent.id })
        assertEquals(relations, {
          dependents: [],
          guardians: [],
          marital_status: 'TODO',
          religion: 'TODO',
          other_next_of_kin: {
            patient_gender: 'female',
            patient_id: relations['other_next_of_kin']!.patient_id,
            patient_name: 'Janey Jane',
            patient_phone_number: '555-555-5555',
            relation: 'biological mother',
            id: relations['other_next_of_kin']?.id,
          },
        })
      })
    })
  },
)
