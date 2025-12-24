import { afterAll, before, describe, it } from 'std/testing/bdd.ts'
import db from '../../../../../db/db.ts'
import { addTestEmployeeWithSession } from '../../../../_helpers/employees.ts'
import {
  insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest,
  PartialPatientDemographics,
} from '../../../../_helpers/workflows.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { createTestOrganization } from '../../../../_helpers/organizations.ts'
import asFormData from '../../../../../util/asFormData.ts'
import waitUntilTestServerUp from '../../../../_helpers/waitUntilTestServerUp.ts'
import { getFormLabels, getFormValues } from '../../../../_helpers/form.ts'
import { route } from '../../../../route.ts'
import { CommonConditionKey, Existence } from '../../../../../types.ts'

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
    const { health_worker: nurse, fetchOk, fetchCheerio } =
      await addTestEmployeeWithSession(db, {
        profession: 'nurse',
        registration_status: 'approved',
        organization_id: clinic.id,
      })

    const encounter =
      await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
        db,
        nurse.organization_id,
        {
          patient_demographics,
          employment_id: nurse.employee_id,
        },
      )

    await fetchOk(
      `/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/triage/warning_signs`,
      {
        method: 'POST',
      },
      {
        cancel_response_body: true,
      },
    )

    const $ = await fetchCheerio(
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
})
