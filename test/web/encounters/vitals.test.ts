import { describe, it } from 'std/testing/bdd.ts'
import * as cheerio from 'cheerio'
import { assertEquals } from 'std/assert/assert_equals.ts'
import {
  addTestHealthWorkerWithSession,
  getFormValues,
  route,
} from '../utilities.ts'
import * as patients from '../../../db/models/patients.ts'
import * as patient_encounters from '../../../db/models/patient_encounters.ts'
import * as patient_measurements from '../../../db/models/patient_measurements.ts'
import db from '../../../db/db.ts'

describe(
  '/app/patients/[patient_id]/encounters/open/vitals',
  { sanitizeResources: false, sanitizeOps: false },
  () => {
    it('renders a page on GET for an open encounter', async () => {
      const patient = await patients.insert(db, { name: 'Test Patient' })
      const { healthWorker, fetch } = await addTestHealthWorkerWithSession(db, {
        scenario: 'approved-nurse',
      })
      await patient_encounters.upsert(
        db,
        '00000000-0000-0000-0000-000000000001',
        {
          patient_id: patient.id,
          reason: 'seeking treatment',
          provider_ids: [healthWorker.employee_id!],
        },
      )

      const response = await fetch(
        `${route}/app/patients/${patient.id}/encounters/open/vitals`,
      )

      if (!response.ok) throw new Error(await response.text())
      const pageContents = await response.text()

      const $ = cheerio.load(pageContents)

      const formValues = getFormValues($)
      assertEquals(formValues, {
        measurements: {
          height: null,
          weight: null,
          temperature: null,
          blood_pressure_diastolic: null,
          blood_pressure_systolic: null,
          blood_oxygen_saturation: null,
          blood_glucose: null,
          pulse: null,
          respiratory_rate: null,
        },
        no_vitals_required: false,
      })
    })

    it('404s on a GET for a patient with no open encounter', async () => {
      const patient = await patients.insert(db, { name: 'Test Patient' })
      const { fetch } = await addTestHealthWorkerWithSession(db, {
        scenario: 'approved-nurse',
      })

      const response = await fetch(
        `${route}/app/patients/${patient.id}/encounters/open/vitals?expectedTestError=1`,
      )

      assertEquals(response.status, 404)
      assertEquals(await response.text(), 'No open visit with this patient')
    })

    it('can save vitals on POST', async () => {
      const { healthWorker, fetch } = await addTestHealthWorkerWithSession(db, {
        scenario: 'approved-nurse',
      })
      const encounter = await patient_encounters.upsert(
        db,
        '00000000-0000-0000-0000-000000000001',
        {
          patient_name: 'Test Patient',
          reason: 'seeking treatment',
          provider_ids: [healthWorker.employee_id!],
        },
      )

      const body = new FormData()
      body.append('measurements.height', '123')

      const response = await fetch(
        `${route}/app/patients/${encounter.patient_id}/encounters/open/vitals`,
        {
          method: 'POST',
          body,
        },
      )
      if (!response.ok) throw new Error(await response.text())
      const vitals = await patient_measurements.getEncounterVitals(db, {
        encounter_id: encounter.id,
        patient_id: encounter.patient_id,
      })
      assertEquals(vitals, {
        height: [123, 'cm'],
      })

      {
        const response = await fetch(
          `${route}/app/patients/${encounter.patient_id}/encounters/open/vitals`,
        )

        if (!response.ok) throw new Error(await response.text())
        const pageContents = await response.text()

        const $ = cheerio.load(pageContents)

        const formValues = getFormValues($)
        assertEquals(formValues, {
          measurements: {
            height: 123,
            weight: null,
            temperature: null,
            blood_pressure_diastolic: null,
            blood_pressure_systolic: null,
            blood_oxygen_saturation: null,
            blood_glucose: null,
            pulse: null,
            respiratory_rate: null,
          },
          no_vitals_required: false,
        })
      }
    })

    it('can overwrite existing vitals on POST', async () => {
      const { healthWorker, fetch } = await addTestHealthWorkerWithSession(db, {
        scenario: 'approved-nurse',
      })
      const encounter = await patient_encounters.upsert(
        db,
        '00000000-0000-0000-0000-000000000001',
        {
          patient_name: 'Test Patient',
          reason: 'seeking treatment',
          provider_ids: [healthWorker.employee_id!],
        },
      )
      await patient_measurements.upsertVitals(db, {
        encounter_id: encounter.id,
        patient_id: encounter.patient_id,
        encounter_provider_id: encounter.providers[0].encounter_provider_id,
        measurements: {
          height: 100,
          weight: 100,
        },
      })

      const body = new FormData()
      body.append('measurements.height', '123')
      body.append('measurements.weight', '456')

      const response = await fetch(
        `${route}/app/patients/${encounter.patient_id}/encounters/open/vitals`,
        {
          method: 'POST',
          body,
        },
      )
      if (!response.ok) throw new Error(await response.text())
      const vitals = await patient_measurements.getEncounterVitals(db, {
        encounter_id: encounter.id,
        patient_id: encounter.patient_id,
      })
      assertEquals(vitals, {
        height: [123, 'cm'],
        weight: [456, 'kg'],
      })

      {
        const response = await fetch(
          `${route}/app/patients/${encounter.patient_id}/encounters/open/vitals`,
        )

        if (!response.ok) throw new Error(await response.text())
        const pageContents = await response.text()

        const $ = cheerio.load(pageContents)

        const formValues = getFormValues($)
        assertEquals(formValues, {
          measurements: {
            height: 123,
            weight: 456,
            temperature: null,
            blood_pressure_diastolic: null,
            blood_pressure_systolic: null,
            blood_oxygen_saturation: null,
            blood_glucose: null,
            pulse: null,
            respiratory_rate: null,
          },
          no_vitals_required: false,
        })
      }
    })

    it('can remove existing vitals on POST', async () => {
      const { healthWorker, fetch } = await addTestHealthWorkerWithSession(db, {
        scenario: 'approved-nurse',
      })
      const encounter = await patient_encounters.upsert(
        db,
        '00000000-0000-0000-0000-000000000001',
        {
          patient_name: 'Test Patient',
          reason: 'seeking treatment',
          provider_ids: [healthWorker.employee_id!],
        },
      )
      await patient_measurements.upsertVitals(db, {
        encounter_id: encounter.id,
        patient_id: encounter.patient_id,
        encounter_provider_id: encounter.providers[0].encounter_provider_id,
        measurements: {
          height: 100,
          weight: 100,
          temperature: 50,
        },
      })

      const body = new FormData()
      body.append('measurements.height', '123')
      body.append('measurements.weight', '456')

      const response = await fetch(
        `${route}/app/patients/${encounter.patient_id}/encounters/open/vitals`,
        {
          method: 'POST',
          body,
        },
      )
      if (!response.ok) throw new Error(await response.text())
      const vitals = await patient_measurements.getEncounterVitals(db, {
        encounter_id: encounter.id,
        patient_id: encounter.patient_id,
      })
      assertEquals(vitals, {
        height: [123, 'cm'],
        weight: [456, 'kg'],
      })
    })
  },
)
