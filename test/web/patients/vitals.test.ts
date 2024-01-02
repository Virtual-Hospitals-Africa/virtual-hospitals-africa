import { it } from 'std/testing/bdd.ts'
import * as cheerio from 'cheerio'
import { assertEquals } from 'std/assert/assert_equals.ts'
import {
  addTestHealthWorkerWithSession,
  describeWithWebServer,
  getFormValues,
} from '../utilities.ts'
import * as patients from '../../../db/models/patients.ts'
import * as patient_encounters from '../../../db/models/patient_encounters.ts'
import db from '../../../db/db.ts'

describeWithWebServer(
  '/app/patients/[patient_id]/encounters/open/vitals',
  8009,
  (route) => {
    it('renders a page on GET for an open encounter', async () => {
      const patient = await patients.upsert(db, { name: 'Test Patient' })
      const { healthWorker, fetch } = await addTestHealthWorkerWithSession({
        scenario: 'approved-nurse',
      })
      await patient_encounters.create(db, 1, {
        patient_id: patient.id,
        reason: 'seeking treatment',
        employment_ids: [healthWorker.employee_id!],
      })

      const response = await fetch(
        `${route}/app/patients/${patient.id}/encounters/open/vitals`,
      )

      if (!response.ok) throw new Error(await response.text())
      const pageContents = await response.text()

      const $ = cheerio.load(pageContents)

      const formValues = getFormValues($)
      assertEquals(formValues, {
        measurements: {
          height: [null, 'cm'],
          weight: [null, 'kg'],
          temperature: [null, 'celsius'],
          blood_pressure_diastolic: [null, 'mmHg'],
          blood_pressure_systolic: [null, 'mmHg'],
          blood_oxygen_saturation: [null, '%'],
          blood_glucose: [null, 'mg/dL'],
        },
      })
    })

    it('404s on a GET for a patient with no open encounter', async () => {
      const patient = await patients.upsert(db, { name: 'Test Patient' })
      const { fetch } = await addTestHealthWorkerWithSession({
        scenario: 'approved-nurse',
      })

      const response = await fetch(
        `${route}/app/patients/${patient.id}/encounters/open/vitals`,
      )

      assertEquals(response.status, 404)
      assertEquals(await response.text(), 'No open visit with this patient')
    })

    it('can save vitals on POST', async () => {
    })
  },
)
