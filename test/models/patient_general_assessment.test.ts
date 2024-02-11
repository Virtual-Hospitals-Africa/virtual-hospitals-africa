import { describe } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import * as patients from '../../db/models/patients.ts'
import * as patient_general_assessment from '../../db/models/patient_general_assessment.ts'
import { itUsesTrxAnd } from '../web/utilities.ts'

describe('db/models/patient_general_assessment.ts', {
  sanitizeResources: false,
}, () => {
  describe('upsertPatientGeneralAssessment', () => {
    itUsesTrxAnd(
      'upserts Assessments when no Assessment exist',
      async (trx) => {
        const patient = await patients.upsert(trx, { name: 'Billy Bob' })

        await patient_general_assessment.upsert(trx, patient.id, [
          { id: 'thin' },
          { id: 'cold' },
          { id: 'alcohol' },
        ])
        const patientAssessments = await patient_general_assessment.get(
          trx,
          patient.id,
        )

        assertEquals(patientAssessments.length, 3)
      },
    )

    itUsesTrxAnd(
      'handles updates and removing patient assessments',
      async (trx) => {
        const patient = await patients.upsert(trx, { name: 'Billy Bob' })

        await patient_general_assessment.upsert(trx, patient.id, [
          { id: 'thin' },
          { id: 'cold' },
          { id: 'alcohol' },
        ])
        const patientAssessments = await patient_general_assessment.get(
          trx,
          patient.id,
        )

        assertEquals(patientAssessments.length, 3)

        await patient_general_assessment.upsert(trx, patient.id, [
          { id: 'cold' },
          { id: 'rash' },
        ])

        const patientAssessmentsAfterRemoving = await patient_general_assessment
          .get(trx, patient.id)

        assertEquals(patientAssessmentsAfterRemoving.length, 2)
        assertEquals(
          patientAssessmentsAfterRemoving.some((c) => c.id === 'cold'),
          true,
        )
        assertEquals(
          patientAssessmentsAfterRemoving.some((c) => c.id === 'rash'),
          true,
        )
      },
    )
  })
})
