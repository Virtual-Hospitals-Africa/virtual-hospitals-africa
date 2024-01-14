import { it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import {
  addTestHealthWorkerWithSession,
  describeWithWebServer,
  getFormValues,
} from '../utilities.ts'
import * as patient_encounters from '../../../db/models/patient_encounters.ts'
import db from '../../../db/db.ts'

describeWithWebServer(
  '/app/patients/[patient_id]/encounters/open/symptoms',
  8010,
  (route) => {
    it('renders a page on GET for an open encounter', async () => {
      const { healthWorker, fetchCheerio } =
        await addTestHealthWorkerWithSession({
          scenario: 'approved-nurse',
        })
      const { patient_id } = await patient_encounters.upsert(db, 1, {
        patient_name: 'Test Patient',
        reason: 'seeking treatment',
        provider_ids: [healthWorker.employee_id!],
      })

      const $ = await fetchCheerio(
        `${route}/app/patients/${patient_id}/encounters/open/symptoms`,
      )

      const formValues = getFormValues($)

      assertEquals(formValues, {})
    })
  },
)
