import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import {
  addTestHealthWorkerWithSession,
  getFormValues,
  route,
} from '../utilities.ts'
import * as patient_encounters from '../../../db/models/patient_encounters.ts'
import db from '../../../db/db.ts'

describe(
  '/app/patients/[patient_id]/encounters/open/symptoms',
  { sanitizeResources: false, sanitizeOps: false },
  () => {
    it('renders a page on GET for an open encounter', async () => {
      const { health_worker, fetchCheerio } =
        await addTestHealthWorkerWithSession(db, {
          scenario: 'approved-nurse',
        })
      const { patient_id } = await patient_encounters.insert(
        db,
        '00000000-0000-0000-0000-000000000001',
        {
          patient_name: 'Test Patient',
          reason: 'seeking treatment',
          provider_ids: [health_worker.employee_id!],
        },
      )

      const $ = await fetchCheerio(
        `${route}/app/patients/${patient_id}/encounters/open/symptoms`,
      )

      const form_values = getFormValues($)

      assertEquals(form_values, {
        done: true,
        chief_complaint: null,
      })
    })
  },
)
