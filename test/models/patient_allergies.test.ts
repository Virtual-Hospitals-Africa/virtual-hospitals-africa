import { beforeEach, describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../db/db.ts'
import { resetInTest } from '../../db/meta.ts'
import * as patients from '../../db/models/patients.ts'
import * as patient_allergies from '../../db/models/patient_allergies.ts'

describe('db/models/patient_allergies.ts', { sanitizeResources: false }, () => {
  beforeEach(resetInTest)

  describe('upsertAllergies', () => {
    it('upserts allergies when no allergies exist', async () => {
      const patient = await patients.upsert(db, { name: 'Billy Bob' })

      await patient_allergies.upsert(db, patient.id, [
        { id: 1 },
        { id: 2 },
        { id: 3 },
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
        { id: 1 },
        { id: 2 },
        { id: 3 },
      ])
      const patientAllergies = await patient_allergies.get(
        db,
        patient.id,
      )

      assertEquals(patientAllergies.length, 3)

      await patient_allergies.upsert(db, patient.id, [
        { id: 1 },
        { id: 5 },
      ])

      const patientAllergiesAfterRemoving = await patient_allergies
        .get(db, patient.id)

      assertEquals(patientAllergiesAfterRemoving.length, 2)
      assertEquals(
        patientAllergiesAfterRemoving.some((c) => c.id === 1),
        true,
      )
      assertEquals(
        patientAllergiesAfterRemoving.some((c) => c.id === 5),
        true,
      )
    })
  })
})
