import { assertEquals } from 'std/assert/assert_equals.ts'
import {
  addTestHealthWorkerWithSession,
  describeWithWebServer,
  getFormValues,
  itUsesTrxAnd,
} from '../utilities.ts'
import * as patient_encounters from '../../../db/models/patient_encounters.ts'

describeWithWebServer(
  '/app/patients/[patient_id]/encounters/open/symptoms',
  8010,
  (route) => {
    itUsesTrxAnd('renders a page on GET for an open encounter', async (trx) => {
      const { healthWorker, fetchCheerio } =
        await addTestHealthWorkerWithSession(trx, {
          scenario: 'approved-nurse',
        })
      const { patient_id } = await patient_encounters.upsert(trx, 1, {
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
