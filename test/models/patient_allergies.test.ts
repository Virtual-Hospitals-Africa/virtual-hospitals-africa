import { beforeEach, describe } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { resetInTest } from '../../db/meta.ts'
import * as patients from '../../db/models/patients.ts'
import * as patient_allergies from '../../db/models/patient_allergies.ts'
import { itUsesTrxAnd } from '../web/utilities.ts'

describe('db/models/patient_allergies.ts', { sanitizeResources: false }, () => {
  beforeEach(resetInTest)

  describe('upsertAllergies', () => {
    itUsesTrxAnd('upserts allergies when no allergies exist', async (trx) => {
      const patient = await patients.upsert(trx, { name: 'Billy Bob' })

      await patient_allergies.upsert(trx, patient.id, [
        { id: 1 },
        { id: 2 },
        { id: 3 },
      ])
      const patientAllergies = await patient_allergies.get(
        trx,
        patient.id,
      )

      assertEquals(patientAllergies.length, 3)
    })

    itUsesTrxAnd('handles updates and removing patient allergies', async (trx) => {
      const patient = await patients.upsert(trx, { name: 'Billy Bob' })

      await patient_allergies.upsert(trx, patient.id, [
        { id: 1 },
        { id: 2 },
        { id: 3 },
      ])
      const patientAllergies = await patient_allergies.get(
        trx,
        patient.id,
      )

      assertEquals(patientAllergies.length, 3)

      await patient_allergies.upsert(trx, patient.id, [
        { id: 1 },
        { id: 5 },
      ])

      const patientAllergiesAfterRemoving = await patient_allergies
        .get(trx, patient.id)

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
