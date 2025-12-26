import { assertEquals } from 'std/assert/assert_equals.ts'
import { afterAll, before, describe, it } from 'std/testing/bdd.ts'
import db from '../../../../../db/db.ts'
import waitUntilTestServerUp from '../../../../_helpers/waitUntilTestServerUp.ts'
import { getFormLabels, getFormValues } from '../../../../_helpers/form.ts'
import { patient_evaluations } from '../../../../../db/models/patient_evaluations.ts'
import { patient_measurements } from '../../../../../db/models/patient_measurements.ts'
import { assertMatches } from '../../../../../util/assertMatches.ts'
import z from 'zod'
import { patient_procedures } from '../../../../../db/models/patient_procedures.ts'
import { setupTriage } from './_setup.ts'
import findMatching from '../../../../../util/findMatching.ts'

describe('triage/measure_vitals', () => {
  before(waitUntilTestServerUp)
  afterAll(() => db.destroy())

  // TODO: unskip, the required measurements aren't correct yet
  describe.skip('GET', () => {
    it('loads a page for the first visit for an adult non-diabetic patient ', async () => {
      const { $ } = await setupTriage({
        patient_demographics: { date_of_birth: '1990-01-01' },
        conditions: [],
        warning_signs: [],
      })

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
      const { $ } = await setupTriage({
        patient_demographics: { date_of_birth: '1990-01-01' },
        conditions: ['diabetes'],
        warning_signs: [],
      })

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
      const { encounter } = await setupTriage({
        patient_demographics: { date_of_birth: '2023-01-01' },
        conditions: ['diabetes'],
        warning_signs: [],
        vitals: {
          measurements: {
            blood_oxygen_saturation: {
              value: 91,
              units: '%',
            },
          },
          assessments: {},
        },
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
          'destination_relations': [],
          'source_relations': [
            {
              'source_id': z.string().uuid(),
              'snomed_concept_id': '42752001',
            },
          ],
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
          'full_display':
            'Hemoglobin saturation with oxygen Measurement finding: 91%',
        },
      ], { strict: true })

      const evaluations = await patient_evaluations.findAll(
        db,
        {
          patient_id: encounter.patient.id,
        },
      )

      const action_status = findMatching(evaluations, {
        name: 'Action status',
      })

      assertMatches(action_status, {
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
        'source_relations': [],
        'destination_relations': [{
          'destination_id': z.string().uuid(),
          'snomed_concept_id': '42752001',
        }],
      }, { strict: true })

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
        'source_relations': [],
        'destination_relations': [],
        'full_display': 'Oxygen therapy',
        'category': 'procedure',
        'type': 'procedure',
        'by_system': true,
        'employment_id': null,
      }, { strict: true })
    })
  })
})
