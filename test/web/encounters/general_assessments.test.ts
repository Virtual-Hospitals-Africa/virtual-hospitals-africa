import { it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import {
  addTestHealthWorkerWithSession,
  describeWithWebServer,
} from '../utilities.ts'
import * as patient_encounters from '../../../db/models/patient_encounters.ts'
import * as patient_general_assessment from '../../../db/models/patient_general_assessment.ts'
import db from '../../../db/db.ts'

describeWithWebServer(
  '/app/patients/[patient_id]/encounters/open/general_assessments',
  8011,
  (route) => {
    it('can save asssessments on POST', async () => {
      const { healthWorker, fetch } = await addTestHealthWorkerWithSession(db, {
        scenario: 'approved-nurse',
      })
      const encounter = await patient_encounters.upsert(db, 1, {
        patient_name: 'Test Patient',
        reason: 'seeking treatment',
        provider_ids: [healthWorker.employee_id!],
      })

      const body = new FormData()
      body.append('patient_assessments.0', 'cold')
      body.append('patient_assessments.1', 'musty')
      body.append('patient_assessments.2', 'alcohol')

      const response = await fetch(
        `${route}/app/patients/${encounter.patient_id}/encounters/open/general_assessments`,
        {
          method: 'POST',
          body,
        },
      )
      if (!response.ok) throw new Error(await response.text())
      const assessments = await patient_general_assessment.get(
        db,
        encounter.patient_id,
      )
      assertEquals(assessments, [{ id: 'cold' }, { id: 'musty' }, {
        id: 'alcohol',
      }])
    })

    it('can overwrite existing asssessments on POST', async () => {
      const { healthWorker, fetch } = await addTestHealthWorkerWithSession(db, {
        scenario: 'approved-nurse',
      })
      const encounter = await patient_encounters.upsert(db, 1, {
        patient_name: 'Test Patient',
        reason: 'seeking treatment',
        provider_ids: [healthWorker.employee_id!],
      })
      await patient_general_assessment.upsert(db, encounter.patient_id, [
        { id: 'cold' },
        { id: 'musty' },
        { id: 'alcohol' },
      ])

      const body = new FormData()
      body.append('patient_assessments.0', 'cold')
      body.append('patient_assessments.1', 'thin')

      const response = await fetch(
        `${route}/app/patients/${encounter.patient_id}/encounters/open/general_assessments`,
        {
          method: 'POST',
          body,
        },
      )
      if (!response.ok) throw new Error(await response.text())
      const assessments = await patient_general_assessment.get(
        db,
        encounter.patient_id,
      )
      assertEquals(assessments, [{ id: 'cold' }, { id: 'thin' }])
    })

    it('can remove existing asssessments with all All Normal on POST', async () => {
      const { healthWorker, fetch } = await addTestHealthWorkerWithSession(db, {
        scenario: 'approved-nurse',
      })
      const encounter = await patient_encounters.upsert(db, 1, {
        patient_name: 'Test Patient',
        reason: 'seeking treatment',
        provider_ids: [healthWorker.employee_id!],
      })
      await patient_general_assessment.upsert(db, encounter.patient_id, [
        { id: 'thin' },
        { id: 'cold' },
        { id: 'alcohol' },
      ])

      const body = new FormData()
      body.append('patient_assessments.0', 'All Normal')

      const response = await fetch(
        `${route}/app/patients/${encounter.patient_id}/encounters/open/general_assessments`,
        {
          method: 'POST',
          body,
        },
      )
      if (!response.ok) throw new Error(await response.text())
      const assessments = await patient_general_assessment.get(
        db,
        encounter.patient_id,
      )
      assertEquals(assessments.length, 0)
    })
  },
)
