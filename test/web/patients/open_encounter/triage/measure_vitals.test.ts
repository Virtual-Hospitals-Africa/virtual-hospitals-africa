import { assertEquals } from 'std/assert/assert_equals.ts'
import { afterAll, before, describe, it } from 'std/testing/bdd.ts'
import db from '../../../../../db/db.ts'
import { addTestEmployeeWithSession } from '../../../../_helpers/employees.ts'
import {
  insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest,
  PartialPatientDemographics,
} from '../../../../_helpers/workflows.ts'

import { createTestOrganization } from '../../../../_helpers/organizations.ts'
import asFormData from '../../../../../util/asFormData.ts'
import waitUntilTestServerUp from '../../../../_helpers/waitUntilTestServerUp.ts'
import { getFormLabels, getFormValues } from '../../../../_helpers/form.ts'
import { route } from '../../../../route.ts'
import { CommonConditionKey, Existence } from '../../../../../types.ts'
import { patient_evaluations } from '../../../../../db/models/patient_evaluations.ts'
import { patient_measurements } from '../../../../../db/models/patient_measurements.ts'
import { delay } from '../../../../../util/delay.ts'
import { assertMatches } from '../../../../../util/assertMatches.ts'
import z from 'zod'
import { patient_procedures } from '../../../../../db/models/patient_procedures.ts'

describe('triage/measure_vitals', () => {
  before(waitUntilTestServerUp)
  afterAll(() => db.destroy())

  async function setupMeasureVitals(
    patient_demographics: PartialPatientDemographics,
    conditions: {
      [c in CommonConditionKey]?: {
        existence: Existence
      }
    },
  ) {
    const clinic = await createTestOrganization(db)
    const nurse = await addTestEmployeeWithSession(db, {
      profession: 'nurse',
      registration_status: 'approved',
      organization_id: clinic.id,
    })

    const encounter =
      await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
        db,
        nurse.health_worker.organization_id,
        {
          patient_demographics,
          employment_id: nurse.health_worker.employee_id,
        },
      )

    await nurse.fetchOk(
      `/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/triage/warning_signs`,
      {
        method: 'POST',
      },
      {
        cancel_response_body: true,
      },
    )

    const $ = await nurse.fetchCheerio(
      `/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/triage/brief_history`,
      {
        method: 'POST',
        body: asFormData(conditions),
      },
    )

    assertEquals(
      $.url,
      `${route}/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/triage/measure_vitals`,
    )

    return { $, clinic, nurse, encounter }
  }

  // TODO: unskip, the required measurements aren't correct yet
  describe.skip('GET', () => {
    it('loads a page for the first visit for an adult non-diabetic patient ', async () => {
      const { $ } = await setupMeasureVitals(
        { date_of_birth: '1990-01-01' },
        {
          diabetes: {
            existence: 'No',
          },
          pregnancy: {
            existence: 'No',
          },
        },
      )

      const form_values = getFormValues($)
      const form_labels = getFormLabels($)

      assertEquals(form_values, {
        measurements: {
          height: { value: null, units: 'cm' },
          weight: { value: null, units: 'kg' },
          temperature: { value: null, units: '°C' },
          blood_pressure_systolic: { value: null, units: 'mmHg' },
          blood_pressure_diastolic: { value: null, units: 'mmHg' },
          blood_oxygen_saturation: { value: null, units: '%' },
          blood_glucose: { value: null, units: 'mg/dL' },
          heart_rate: { value: null, units: 'bpm' },
          respiratory_rate: { value: null, units: 'bpm' },
        },
        assessments: {
          consciousness: { value_snomed_concept_id: null },
          mobility_assessment: { value_snomed_concept_id: null },
          trauma_presence: { value_snomed_concept_id: null },
        },
      })

      assertEquals(form_labels, {
        assessments: {
          consciousness: { value_snomed_concept_id: 'Consciousness*' },
          mobility_assessment: {
            value_snomed_concept_id: 'Mobility Assessment*',
          },
          trauma_presence: { value_snomed_concept_id: 'Trauma Presence*' },
        },
        measurements: {
          height: { value: 'Height*' },
          weight: { value: 'Weight*' },
          temperature: { value: 'Temperature*' },
          blood_pressure_systolic: { value: 'Blood Pressure Systolic*' },
          blood_pressure_diastolic: { value: 'Blood Pressure Diastolic*' },
          heart_rate: { value: 'Heart Rate*' },
          respiratory_rate: { value: 'Respiratory Rate*' },
          blood_glucose: { value: 'Blood Glucose' },
          blood_oxygen_saturation: { value: 'Blood Oxygen Saturation' },
        },
      })
    })

    it('loads a page for the first visit for an adult diabetic patient ', async () => {
      const { $ } = await setupMeasureVitals(
        { date_of_birth: '1990-01-01' },
        {
          diabetes: {
            existence: 'Yes',
          },
          pregnancy: {
            existence: 'No',
          },
        },
      )

      assertEquals(getFormLabels($), {
        assessments: {
          consciousness: { value_snomed_concept_id: 'Consciousness*' },
          mobility_assessment: {
            value_snomed_concept_id: 'Mobility Assessment*',
          },
          trauma_presence: { value_snomed_concept_id: 'Trauma Presence*' },
        },
        measurements: {
          height: { value: 'Height*' },
          weight: { value: 'Weight*' },
          temperature: { value: 'Temperature*' },
          blood_pressure_systolic: { value: 'Blood Pressure Systolic*' },
          blood_pressure_diastolic: { value: 'Blood Pressure Diastolic*' },
          heart_rate: { value: 'Heart Rate*' },
          respiratory_rate: { value: 'Respiratory Rate*' },
          blood_glucose: { value: 'Blood Glucose*' },
          blood_oxygen_saturation: { value: 'Blood Oxygen Saturation' },
        },
      })
    })
  })

  describe('POST', () => {
    it('creates an additional task if oxygen saturation is below 92%', async () => {
      const { $, nurse, encounter } = await setupMeasureVitals(
        { date_of_birth: '2023-01-01' },
        {
          diabetes: {
            existence: 'No',
          },
          pregnancy: {
            existence: 'No',
          },
        },
      )

      await nurse.fetchOk($.url, {
        method: 'POST',
        body: asFormData({
          measurements: {
            blood_oxygen_saturation: {
              value: 91,
              units: '%',
            },
          },
          assessments: {},
        }),
      }, {
        cancel_response_body: true,
      })

      const measurements = await patient_measurements.findAll(
        db,
        {
          patient_id: encounter.patient.id,
        },
      )
      assertMatches(measurements, [
        {
          'type': 'finding',
          'record_id': z.string().uuid(),
          'created_at': z.date(),
          'snomed_concept_id': '118245000',
          'patient_encounter_id': z.string().uuid(),
          'patient_encounter_employee_id': z.string().uuid(),
          'name': 'Measurement finding',
          'category': 'finding',
          'as_part_of_procedure': {
            'record_id': z.string().uuid(),
            'snomed_concept_id': '410188000',
            'name': 'Taking patient vital signs assessment',
          },
          'priority': null,
          'qualifiers': [
            {
              'record_id': z.string().uuid(),
              'snomed_concept_id': '103228002',
              'category': 'observable entity',
              'name': 'Hemoglobin saturation with oxygen',
              'value_name': null,
              'qualifiers': [],
            },
          ],
          'value': '91',
          'units': '%',
          'value_display':
            'Hemoglobin saturation with oxygen Measurement finding: 91%',
        },
      ], { strict: true })

      // TODO have a function that confirms that all events are fully processed for a given entity
      await delay(150)
      const evaluations = await patient_evaluations.findAll(
        db,
        {
          patient_id: encounter.patient.id,
        },
      )

      assertMatches(evaluations, [
        {
          'type': 'evaluation',
          'record_id': z.string().uuid(),
          'created_at': z.date(),
          'snomed_concept_id': '260870009',
          'patient_encounter_id': z.string().uuid(),
          'evaluates_record_id': z.string().uuid(),
          'employment_id': z.string().uuid(),
          'by_system': false,
          'name': 'Priority',
          'category': 'attribute',
          'value_snomed_concept_id': '1357728000',
          'value_name': 'Non-urgent',
          'qualifiers': [],
        },
        {
          'type': 'evaluation',
          'record_id': z.string().uuid(),
          'created_at': z.date(),
          'snomed_concept_id': '385641008',
          'patient_encounter_id': z.string().uuid(),
          'evaluates_record_id': z.string().uuid(),
          'employment_id': null,
          'by_system': true,
          'name': 'Action status',
          'category': 'attribute',
          'value_snomed_concept_id': '385643006',
          'value_name': 'To be done',
          'qualifiers': [],
        },
      ], { strict: true })

      const planned_procedure = await patient_procedures.getById(
        db,
        evaluations[1].evaluates_record_id,
      )

      assertMatches(planned_procedure, {
        'record_id': z.string().uuid(),
        'created_at': z.date(),
        'snomed_concept_id': '57485005',
        'patient_encounter_id': z.string().uuid(),
        'name': 'Oxygen therapy',
        'value_snomed_concept_id': null,
        'value_name': null,
        'qualifiers': [],
        'value_display': 'Oxygen therapy',
      }, { strict: true })
    })
  })
})
