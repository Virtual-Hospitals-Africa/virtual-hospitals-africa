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
  8009,
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
      body.append('patient_assessments.0', '1')
      body.append('patient_assessments.1', '2')
      body.append('patient_assessments.2', '5')

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
      assertEquals(assessments, [{ id: 1 }, { id: 2 }, { id: 5 }])
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
        { id: 1 },
        { id: 2 },
        { id: 5 },
      ])

      const body = new FormData()
      body.append('patient_assessments.0', '6')
      body.append('patient_assessments.1', '8')

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
      assertEquals(assessments, [{ id: 6 }, { id: 8 }])
    })

    it('can remove existing asssessments with all all_normal on POST', async () => {
      const { healthWorker, fetch } = await addTestHealthWorkerWithSession(db, {
        scenario: 'approved-nurse',
      })
      const encounter = await patient_encounters.upsert(db, 1, {
        patient_name: 'Test Patient',
        reason: 'seeking treatment',
        provider_ids: [healthWorker.employee_id!],
      })
      await patient_general_assessment.upsert(db, encounter.patient_id, [
        { id: 1 },
        { id: 2 },
        { id: 5 },
      ])

      const body = new FormData()
      body.append('all_normal', 'true')

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
