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
import * as patient_findings from '../../../db/models/patient_findings.ts'
import db from '../../../db/db.ts'
import { VITALS_SNOMED_CODE, VITALS_UNITS } from '../../../shared/vitals.ts'
import generateUUID from '../../../util/uuid.ts'
import { assert } from 'std/assert/assert.ts'
import isObjectLike from '../../../util/isObjectLike.ts'
import { assertArrayIncludes } from 'std/assert/assert_array_includes.ts'

describe(
  '/app/patients/[patient_id]/encounters/[encounter_id]/vitals',
  { sanitizeResources: false, sanitizeOps: false },
  () => {
    it('renders a page on GET for an open encounter', async () => {
      const patient = await patients.insert(db, { name: 'Test Patient' })
      const { healthWorker, fetch } = await addTestHealthWorkerWithSession(db, {
        scenario: 'approved-nurse',
      })
      const encounter = await patient_encounters.insert(
        db,
        '00000000-0000-0000-0000-000000000001',
        {
          patient_id: patient.id,
          reason: 'seeking treatment',
          provider_ids: [healthWorker.employee_id!],
        },
      )

      const response = await fetch(
        `${route}/app/patients/${patient.id}/encounters/${encounter.id}/vitals`,
      )

      if (!response.ok) throw new Error(await response.text())
      const pageContents = await response.text()

      const $ = cheerio.load(pageContents)

      const formValues = getFormValues($)
      assert(isObjectLike(formValues))
      const findings = Object.values(formValues.findings || {})

      assertArrayIncludes(findings, [{
        snomed_concept_id: 103228002,
        units: '%',
        value: null,
      }])
      assertArrayIncludes(findings, [{
        snomed_concept_id: 271649006,
        units: 'mmHg',
        value: null,
      }])
      assertArrayIncludes(findings, [{
        snomed_concept_id: 1153637007,
        units: 'cm',
        value: null,
      }])
      assertArrayIncludes(findings, [{
        snomed_concept_id: 86290005,
        units: 'bpm',
        value: null,
      }])
      assertArrayIncludes(findings, [{
        snomed_concept_id: 405176005,
        units: 'mg/dL',
        value: null,
      }])
      assertArrayIncludes(findings, [{
        snomed_concept_id: 8499008,
        units: 'bpm',
        value: null,
      }])
      assertArrayIncludes(findings, [{
        snomed_concept_id: 271650006,
        units: 'mmHg',
        value: null,
      }])
      assertArrayIncludes(findings, [{
        snomed_concept_id: 722490005,
        units: '°C',
        value: null,
      }])
      assertArrayIncludes(findings, [{
        snomed_concept_id: 726527001,
        units: 'kg',
        value: null,
      }])
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
      const encounter = await patient_encounters.insert(
        db,
        '00000000-0000-0000-0000-000000000001',
        {
          patient_name: 'Test Patient',
          reason: 'seeking treatment',
          provider_ids: [healthWorker.employee_id!],
        },
      )

      const body = new FormData()
      const finding_id = generateUUID()
      body.append(
        `findings.${finding_id}.snomed_concept_id`,
        VITALS_SNOMED_CODE.height,
      )
      body.append(`findings.${finding_id}.units`, VITALS_UNITS.height)
      body.append(`findings.${finding_id}.value`, '123')

      const response = await fetch(
        `${route}/app/patients/${encounter.patient_id}/encounters/${encounter.id}/vitals`,
        {
          method: 'POST',
          body,
        },
      )
      if (!response.ok) throw new Error(await response.text())

      const all_vitals_snomed_codes = Object.values(VITALS_SNOMED_CODE).filter(
        (code) => code !== '---',
      )

      const vitals = await patient_findings.getMostRecentMeasurements(db, {
        patient_id: encounter.patient_id,
        snomed_concept_ids: all_vitals_snomed_codes,
      })
      assertEquals(vitals, [
        {
          snomed_concept_id: VITALS_SNOMED_CODE.height,
          value_display: '123 cm',
          encounter_id: encounter.id,
          finding_id,
          created_at: vitals[0].created_at,
          provider: {
            patient_encounter_provider_id:
              encounter.providers[0].encounter_provider_id,
            employee_id: healthWorker.employee_id!,
            organization: {
              id: '00000000-0000-0000-0000-000000000001',
              name: 'VHA Test Clinic',
            },
            health_worker_id: healthWorker.id,
            avatar_url: healthWorker.avatar_url,
            name: healthWorker.name,
            profession: 'nurse',
          },
        },
      ])

      {
        const response = await fetch(
          `${route}/app/patients/${encounter.patient_id}/encounters/${encounter.id}/vitals`,
        )

        if (!response.ok) throw new Error(await response.text())
        const pageContents = await response.text()

        const $ = cheerio.load(pageContents)

        const formValues = getFormValues($)
        assert(isObjectLike(formValues))
        const findings = Object.values(formValues.findings || {})

        assertArrayIncludes(findings, [{
          snomed_concept_id: 103228002,
          units: '%',
          value: null,
        }])
        assertArrayIncludes(findings, [{
          snomed_concept_id: 271649006,
          units: 'mmHg',
          value: null,
        }])
        assertArrayIncludes(findings, [{
          snomed_concept_id: 1153637007,
          units: 'cm',
          value: null,
        }])
        assertArrayIncludes(findings, [{
          snomed_concept_id: 86290005,
          units: 'bpm',
          value: null,
        }])
        assertArrayIncludes(findings, [{
          snomed_concept_id: 405176005,
          units: 'mg/dL',
          value: null,
        }])
        assertArrayIncludes(findings, [{
          snomed_concept_id: 8499008,
          units: 'bpm',
          value: null,
        }])
        assertArrayIncludes(findings, [{
          snomed_concept_id: 271650006,
          units: 'mmHg',
          value: null,
        }])
        assertArrayIncludes(findings, [{
          snomed_concept_id: 722490005,
          units: '°C',
          value: null,
        }])
        assertArrayIncludes(findings, [{
          snomed_concept_id: 726527001,
          units: 'kg',
          value: null,
        }])
      }
    })
  },
)
