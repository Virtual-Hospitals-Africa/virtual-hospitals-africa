import { afterAll, describe } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import * as patients from '../../db/models/patients.ts'
import * as patient_allergies from '../../db/models/patient_allergies.ts'
import { itUsesTrxAnd } from '../web/utilities.ts'
import generateUUID from '../../util/uuid.ts'
import db from '../../db/db.ts'

describe('db/models/patient_allergies.ts', () => {
  afterAll(() => db.destroy())
  describe('upsertAllergies', () => {
    itUsesTrxAnd('upserts allergies when no allergies exist', async (trx) => {
      const patient = await patients.insert(trx, { name: 'Billy Bob' })

      await patient_allergies.upsert(trx, patient.id, [
        {
          snomed_concept_id: 123,
          patient_allergy_id: generateUUID(),
          snomed_english_term: 'Allergy 1',
        },
        {
          snomed_concept_id: 456,
          patient_allergy_id: generateUUID(),
          snomed_english_term: 'Allergy 2',
        },
        {
          snomed_concept_id: 789,
          patient_allergy_id: generateUUID(),
          snomed_english_term: 'Allergy 3',
        },
      ])
      const patientAllergies = await patient_allergies.getWithName(
        trx,
        patient.id,
      )

      assertEquals(patientAllergies.length, 3)
    })

    itUsesTrxAnd(
      'handles updates and removing patient allergies',
      async (trx) => {
        const patient = await patients.insert(trx, { name: 'Billy Bob' })

        const upserted = await patient_allergies.upsert(trx, patient.id, [
          {
            snomed_concept_id: 123,
            patient_allergy_id: generateUUID(),
            snomed_english_term: 'Allergy 1',
          },
          {
            snomed_concept_id: 456,
            patient_allergy_id: generateUUID(),
            snomed_english_term: 'Allergy 2',
          },
          {
            snomed_concept_id: 789,
            patient_allergy_id: generateUUID(),
            snomed_english_term: 'Allergy 3',
          },
        ])
        const patientAllergies = await patient_allergies.getWithName(
          trx,
          patient.id,
        )

        assertEquals(patientAllergies.length, 3)

        await patient_allergies.upsert(trx, patient.id, [
          {
            patient_allergy_id: upserted[0].id,
            snomed_concept_id: upserted[0].snomed_concept_id,
            snomed_english_term: 'Allergy 1',
          },
          {
            patient_allergy_id: upserted[1].id,
            snomed_concept_id: upserted[1].snomed_concept_id,
            snomed_english_term: 'Allergy 2',
          },
        ])

        const patientAllergiesAfterRemoving = await patient_allergies
          .getWithName(trx, patient.id)

        assertEquals(patientAllergiesAfterRemoving.length, 2)
      },
    )
  })
})
