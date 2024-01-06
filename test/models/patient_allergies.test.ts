import { beforeEach, describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../db/db.ts'
import { resetInTest } from '../../db/meta.ts'
import * as patients from '../../db/models/patients.ts'
import * as patient_allergies from '../../db/models/patient_allergies.ts'
import { assert } from 'std/assert/assert.ts'
import { StatusError } from '../../util/assertOr.ts'

describe('db/models/patient_allergies.ts', { sanitizeResources: false }, () => {
  beforeEach(resetInTest)

  describe('upsertAllergies', () => {
    it('upserts allergies when no allergies exist', async () => {
      const patient = await patients.upsert(db, { name: 'Billy Bob' })

      await patient_allergies.upsert(db, patient.id, [
        { allergy_id: 1 },
        { allergy_id: 2 },
        { allergy_id: 3 },
      ])
      const patientAllergies = await patient_allergies.get(
        db,
        patient.id,
      )

      assertEquals(patientAllergies.length, 3)
    })

    it('handles updates and removing patient allergies', async () => {
      const patient = await patients.upsert(db, { name: 'Billy Bob' })

      await patient_allergies.upsert(db, patient.id, [
        { allergy_id: 1 },
        { allergy_id: 2 },
        { allergy_id: 3 },
      ])
      const patientAllergies = await patient_allergies.get(
        db,
        patient.id,
      )

      assertEquals(patientAllergies.length, 3)

      const patientAllergy = await db
        .selectFrom('patient_allergies')
        .where('allergy_id', '=', 1)
        .select(['id'])
        .executeTakeFirst()

      await patient_allergies.upsert(db, patient.id, [
        {
          id: patientAllergy!.id,
          allergy_id: 1,
        },
        {
          allergy_id: 5,
        },
      ])

      const patientAllergiesAfterRemoving = await patient_allergies
        .get(db, patient.id)

      assertEquals(patientAllergiesAfterRemoving.length, 2)
      assertEquals(
        patientAllergiesAfterRemoving.some((c) => c.allergy_id === 1),
        true,
      )
      assertEquals(
        patientAllergiesAfterRemoving.some((c) => c.allergy_id === 5),
        true,
      )
    })

    it('throws a 400 on an attempt to change the allergy_id for an existing patient_allergy', async () => {
      const patient = await patients.upsert(db, { name: 'Billy Bob' })

      await patient_allergies.upsert(db, patient.id, [{ allergy_id: 1 }])

      const [patient_existing_allergy] = await patient_allergies.get(
        db,
        patient.id,
      )

      let expected_error: StatusError | undefined
      try {
        await patient_allergies.upsert(db, patient.id, [
          {
            id: patient_existing_allergy.id,
            allergy_id: 5,
          },
        ])
      } catch (error) {
        expected_error = error
      }
      assert(expected_error)
      assertEquals(expected_error.status, 400)
      assertEquals(
        expected_error.message,
        `Unexpected attempt to change allergy_id for patient_allergy with id: ${patient_existing_allergy.id}`,
      )
    })
  })
})
