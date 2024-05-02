import { describe } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import * as patients from '../../db/models/patients.ts'
import * as patient_allergies from '../../db/models/patient_allergies.ts'
import { itUsesTrxAnd, readFirstFiveRowsOfSeedDump } from '../web/utilities.ts'

describe('db/models/patient_allergies.ts', { sanitizeResources: false }, () => {
  describe('upsertAllergies', () => {
    const allergies = readFirstFiveRowsOfSeedDump('allergies')

    itUsesTrxAnd('upserts allergies when no allergies exist', async (trx) => {
      const patient = await patients.upsert(trx, { name: 'Billy Bob' })

      await patient_allergies.upsert(trx, patient.id, [
        { id: allergies.value[0].id },
        { id: allergies.value[1].id },
        { id: allergies.value[2].id },
      ])
      const patientAllergies = await patient_allergies.get(
        trx,
        patient.id,
      )

      assertEquals(patientAllergies.length, 3)
    })

    itUsesTrxAnd(
      'handles updates and removing patient allergies',
      async (trx) => {
        const patient = await patients.upsert(trx, { name: 'Billy Bob' })

        await patient_allergies.upsert(trx, patient.id, [
          { id: allergies.value[0].id },
          { id: allergies.value[1].id },
          { id: allergies.value[2].id },
        ])
        const patientAllergies = await patient_allergies.get(
          trx,
          patient.id,
        )

        assertEquals(patientAllergies.length, 3)

        await patient_allergies.upsert(trx, patient.id, [
          { id: allergies.value[0].id },
          { id: allergies.value[4].id },
        ])

        const patientAllergiesAfterRemoving = await patient_allergies
          .get(trx, patient.id)

        assertEquals(patientAllergiesAfterRemoving.length, 2)
        assertEquals(
          patientAllergiesAfterRemoving.some((c) =>
            c.id === allergies.value[0].id
          ),
          true,
        )
        assertEquals(
          patientAllergiesAfterRemoving.some((c) =>
            c.id === allergies.value[4].id
          ),
          true,
        )
      },
    )
  })
})
