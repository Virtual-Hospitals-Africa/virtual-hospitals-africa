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
        measurements: [
          {
            is_flagged: false,
            measurement_name: 'height',
            value: null,
          },
          {
            is_flagged: false,
            measurement_name: 'weight',
            value: null,
          },
          {
            is_flagged: false,
            measurement_name: 'temperature',
            value: null,
          },
          {
            is_flagged: false,
            measurement_name: 'blood_oxygen_saturation',
            value: null,
          },
          {
            is_flagged: false,
            measurement_name: 'blood_glucose',
            value: null,
          },
          {
            is_flagged: false,
            measurement_name: 'pulse',
            value: null,
          },
          {
            is_flagged: false,
            measurement_name: 'respiratory_rate',
            value: null,
          },
        ],
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
      // body.append('measurements.height', '123')
      body.append('measurements.0.measurement_name', 'height')
      body.append('measurements.0.value', '123')

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
      assertEquals(vitals, [
        {
          'measurement_name': 'height',
          'value': 123,
          'is_flagged': false,
          'units': 'cm',
          'snomed_code': '---',
        },
      ])

      {
        const response = await fetch(
          `${route}/app/patients/${encounter.patient_id}/encounters/open/vitals`,
        )

        if (!response.ok) throw new Error(await response.text())
        const pageContents = await response.text()

        const $ = cheerio.load(pageContents)

        const formValues = getFormValues($)
        assertEquals(formValues, {
          measurements: [
            {
              is_flagged: false,
              measurement_name: 'height',
              value: 123,
            },
            {
              is_flagged: false,
              measurement_name: 'weight',
              value: null,
            },
            {
              is_flagged: false,
              measurement_name: 'temperature',
              value: null,
            },
            {
              is_flagged: false,
              measurement_name: 'blood_oxygen_saturation',
              value: null,
            },
            {
              is_flagged: false,
              measurement_name: 'blood_glucose',
              value: null,
            },
            {
              is_flagged: false,
              measurement_name: 'pulse',
              value: null,
            },
            {
              is_flagged: false,
              measurement_name: 'respiratory_rate',
              value: null,
            },
          ],
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
        input_measurements: [
          {
            measurement_name: 'height',
            value: 100,
            is_flagged: false,
          },
          {
            measurement_name: 'weight',
            value: 100,
            is_flagged: false,
          },
        ],
      })

      const body = new FormData()
      body.append('measurements.0.measurement_name', 'height')
      body.append('measurements.0.value', '123')
      body.append('measurements.1.measurement_name', 'weight')
      body.append('measurements.1.value', '456')

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
      assertEquals(vitals, [
        {
          measurement_name: 'height',
          value: 123,
          is_flagged: false,
          units: 'cm',
          snomed_code: '---',
        },
        {
          measurement_name: 'weight',
          value: 456,
          is_flagged: false,
          units: 'kg',
          snomed_code: '---',
        },
      ])

      {
        const response = await fetch(
          `${route}/app/patients/${encounter.patient_id}/encounters/open/vitals`,
        )

        if (!response.ok) throw new Error(await response.text())
        const pageContents = await response.text()

        const $ = cheerio.load(pageContents)

        const formValues = getFormValues($)
        assertEquals(formValues, {
          measurements: [
            {
              is_flagged: false,
              measurement_name: 'height',
              value: 123,
            },
            {
              is_flagged: false,
              measurement_name: 'weight',
              value: 456,
            },
            {
              is_flagged: false,
              measurement_name: 'temperature',
              value: null,
            },
            {
              is_flagged: false,
              measurement_name: 'blood_oxygen_saturation',
              value: null,
            },
            {
              is_flagged: false,
              measurement_name: 'blood_glucose',
              value: null,
            },
            {
              is_flagged: false,
              measurement_name: 'pulse',
              value: null,
            },
            {
              is_flagged: false,
              measurement_name: 'respiratory_rate',
              value: null,
            },
          ],
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
        input_measurements: [
          {
            measurement_name: 'height',
            value: 170.3,
            is_flagged: false,
          },
          {
            measurement_name: 'weight',
            value: 70.3,
            is_flagged: false,
          },
          {
            measurement_name: 'temperature',
            value: 50,
            is_flagged: false,
          },
        ],
      })

      const body = new FormData()
      body.append('measurements.0.measurement_name', 'height')
      body.append('measurements.0.value', '100')
      body.append('measurements.1.measurement_name', 'weight')
      body.append('measurements.1.value', '456')

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

      assertEquals(vitals, [
        {
          measurement_name: 'height',
          value: 100,
          is_flagged: false,
          units: 'cm',
          snomed_code: '---',
        },
        {
          measurement_name: 'weight',
          value: 456,
          is_flagged: false,
          units: 'kg',
          snomed_code: '---',
        },
      ])
    })
  },
)
