import z from 'zod'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { afterAll, before, describe, it } from 'std/testing/bdd.ts'
import db from '../../../../../db/db.ts'
import waitUntilTestServerUp from '../../../../_helpers/waitUntilTestServerUp.ts'
import {
  getFormLabels,
  getFormOptions,
  getFormValues,
} from '../../../../_helpers/form.ts'
import { patient_evaluations } from '../../../../../db/models/patient_evaluations.ts'
import { patient_measurements } from '../../../../../db/models/patient_measurements.ts'
import { assertMatches } from '../../../../../util/assertMatches.ts'
import { patient_procedures } from '../../../../../db/models/patient_procedures.ts'
import { setupTriage } from './_setup.ts'
import findMatching from '../../../../../util/findMatching.ts'
import { VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS } from '../../../../../shared/vitals.ts'

describe('triage/measure_vitals', () => {
  before(waitUntilTestServerUp)
  afterAll(() => db.destroy())

  describe('GET', () => {
    it('loads a page for the first visit for an adult non-diabetic patient ', async () => {
      const { $ } = await setupTriage({
        patient_demographics: { date_of_birth: '1990-01-01' },
        warning_signs: [],
        conditions: [],
        height_and_weight: {
          height: {
            value: 160,
            units: 'cm',
          },
          weight: {
            value: 80,
            units: 'kg',
          },
        },
      })

      const form_values = getFormValues($)
      const form_labels = getFormLabels($)
      const form_options = getFormOptions($)

      assertEquals(form_values, {
        assessments: {
          consciousness: { value_snomed_concept_id: null },
          mobility_assessment: { value_snomed_concept_id: null },
          trauma_presence: { value_snomed_concept_id: null },
        },
        measurements: {
          temperature: { value: null, units: '°C' },
          blood_pressure_systolic: { value: null, units: 'mmHg' },
          blood_pressure_diastolic: { value: null, units: 'mmHg' },
          heart_rate: { value: null, units: 'bpm' },
          respiratory_rate: { value: null, units: 'bpm' },
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
          temperature: { value: 'Temperature*' },
          blood_pressure_systolic: { value: 'Blood Pressure Systolic*' },
          blood_pressure_diastolic: { value: 'Blood Pressure Diastolic*' },
          heart_rate: { value: 'Heart Rate*' },
          respiratory_rate: { value: 'Respiratory Rate*' },
        },
      })

      assertEquals(form_options, {
        'assessments': {
          'consciousness': {
            'value_snomed_concept_id': [
              {
                'label': 'Select...',
                'value': '',
                'selected': false,
              },
              {
                'label': 'Alert',
                'value': '248234008',
                'selected': false,
              },
              {
                'label': 'Reacts to voice',
                'value': '422768004',
                'selected': false,
              },
              {
                'label': 'Confused',
                'value': '40917007',
                'selected': false,
              },
              {
                'label': 'Reacts to pain',
                'value': '450847001',
                'selected': false,
              },
              {
                'label': 'Unresponsive',
                'value': '422107003',
                'selected': false,
              },
            ],
          },
          'mobility_assessment': {
            'value_snomed_concept_id': [
              {
                'label': 'Select...',
                'value': '',
                'selected': false,
              },
              {
                'label': 'Walking',
                'value': '282144007',
                'selected': false,
              },
              {
                'label': 'Difficulty walking',
                'value': '719232003',
                'selected': false,
              },
              {
                'label': 'Stretcher/Immobile',
                'value': '282145008',
                'selected': false,
              },
            ],
          },
          'trauma_presence': {
            'value_snomed_concept_id': [
              {
                'label': 'Select...',
                'value': '',
                'selected': false,
              },
              {
                'label': 'No',
                'value': '1149217004',
                'selected': false,
              },
              {
                'label': 'Yes',
                'value': '417746004',
                'selected': false,
              },
            ],
          },
        },
      })
    })

    it('loads a page for the first visit for an adult diabetic patient ', async () => {
      const { $ } = await setupTriage({
        patient_demographics: { date_of_birth: '1990-01-01' },
        warning_signs: [],
        conditions: ['diabetes'],
        height_and_weight: {
          height: {
            value: 160,
            units: 'cm',
          },
          weight: {
            value: 80,
            units: 'kg',
          },
        },
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
          temperature: { value: 'Temperature*' },
          blood_pressure_systolic: { value: 'Blood Pressure Systolic*' },
          blood_pressure_diastolic: { value: 'Blood Pressure Diastolic*' },
          heart_rate: { value: 'Heart Rate*' },
          respiratory_rate: { value: 'Respiratory Rate*' },
          blood_glucose: { value: 'Blood Glucose*' },
        },
      })
    })

    it('loads a page for the first visit for a non-diabetic older child ', async () => {
      const { $ } = await setupTriage({
        patient_demographics: { date_of_birth: '2020-01-01' },
        warning_signs: [],
        conditions: [],
        height_and_weight: {
          height: {
            value: 100,
            units: 'cm',
          },
          weight: {
            value: 40,
            units: 'kg',
          },
        },
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
          temperature: { value: 'Temperature*' },
          heart_rate: { value: 'Heart Rate*' },
          respiratory_rate: { value: 'Respiratory Rate*' },
        },
      })
    })

    it('loads a page for the first visit for a non-diabetic older child ', async () => {
      const { $ } = await setupTriage({
        patient_demographics: { date_of_birth: '2020-01-01' },
        warning_signs: [],
        conditions: ['diabetes'],
        height_and_weight: {
          height: {
            value: 100,
            units: 'cm',
          },
          weight: {
            value: 40,
            units: 'kg',
          },
        },
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
          temperature: { value: 'Temperature*' },
          heart_rate: { value: 'Heart Rate*' },
          respiratory_rate: { value: 'Respiratory Rate*' },
          blood_glucose: { value: 'Blood Glucose*' },
        },
      })
    })
  })

  describe('POST', () => {
    it('creates an additional task if oxygen saturation is below 92%', async () => {
      const { encounter } = await setupTriage({
        patient_demographics: { date_of_birth: '2023-01-01' },
        warning_signs: [],
        conditions: ['diabetes'],
        height_and_weight: {
          height: {
            value: 160,
            units: 'cm',
          },
          weight: {
            value: 80,
            units: 'kg',
          },
        },
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
          s_expression: `
            (and (not (measurement ${VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS.height}))
                 (not (measurement ${VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS.weight})))
          `,
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
          'value_snomed_concept_id': null,
          'value_name': null,
          'finding_snomed_concept_id': '103228002',
          'finding_name': 'Hemoglobin saturation with oxygen',
          'value_display': '91%',
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
          'qualifiers': [],
          'value': '91',
          'units': '%',
          'full_display': 'Hemoglobin saturation with oxygen: 91%',
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
        action_status.evaluates_record_id,
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
        'value_display': 'Oxygen therapy',
        'category': 'procedure',
        'type': 'procedure',
        'by_system': true,
        'employment_id': null,
      }, { strict: true })
    })
  })
})
