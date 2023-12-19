import { sql } from 'kysely'
import { beforeEach, describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../db/db.ts'
import { resetInTest } from '../../db/reset.ts'
import * as patients from '../../db/models/patients.ts'
import * as patient_allergies from '../../db/models/patient_allergies.ts'

describe('db/models/patient_allergies.ts', { sanitizeResources: false }, () => {
  beforeEach(resetInTest)

  describe('upsertAllergies', () => {
    it('upserts allergies when no allergies exist', async () => {
      const patient = await patients.upsert(db, { name: 'Billy Bob' })

      await patient_allergies.upsertAllergies(db, patient.id, [
        {
          allergy_id: 1,
        },
        {
          allergy_id: 2,
        },
        {
          allergy_id: 3,
        },
      ])
      const patientAllergies = await patient_allergies.getPatientAllergies(
        db,
        patient.id,
      )

      assertEquals(patientAllergies.length, 3)
    })

    it('handle updates and removing patient allergies', async () => {
      const patient = await patients.upsert(db, { name: 'Billy Bob' })

      await patient_allergies.upsertAllergies(db, patient.id, [
        {
          allergy_id: 1,
        },
        {
          allergy_id: 2,
        },
        {
          allergy_id: 3,
        },
      ])
      const patientAllergies = await patient_allergies.getPatientAllergies(
        db,
        patient.id,
      )

      assertEquals(patientAllergies.length, 3)

      const patientAllergy = await db
        .selectFrom('patient_allergies')
        .where('allergy_id', '=', 1)
        .select(['id'])
        .executeTakeFirst()
      await patient_allergies.upsertAllergies(db, patient.id, [
        {
          id: patientAllergy!.id,
          allergy_id: 1,
          removed: true,
        },
      ])

      const patientAllergiesAfterRemoving = await patient_allergies
        .getPatientAllergies(db, patient.id)

      assertEquals(patientAllergiesAfterRemoving.length, 2)
      assertEquals(
        patientAllergiesAfterRemoving.some((c) => c.allergy_id === 2),
        true,
      )
      assertEquals(
        patientAllergiesAfterRemoving.some((c) => c.allergy_id === 3),
        true,
      )

      const allergies = patientAllergiesAfterRemoving.map((c) => ({
        id: c.id,
        allergy_id: c.allergy_id,
      }))
      await patient_allergies.upsertAllergies(db, patient.id, [
        ...allergies,
        { allergy_id: 4 },
      ])
      const patientAllergiesAfterModifing = await patient_allergies
        .getPatientAllergies(db, patient.id)
      assertEquals(patientAllergiesAfterModifing.length, 3)
      assertEquals(
        patientAllergiesAfterModifing.some((c) => c.allergy_id === 4),
        true,
      )
    })
  })
})
