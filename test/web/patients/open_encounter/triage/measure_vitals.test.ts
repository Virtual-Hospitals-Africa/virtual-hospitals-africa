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
import {
  assessmentOptionSnomedConceptId,
  VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS,
  VITAL_MEASUREMENTS_UNITS,
  VitalAssessment,
  VitalMeasurement,
} from '../../../../../shared/vitals.ts'
import { patient_evaluation_scores } from '../../../../../db/models/patient_evaluation_scores.ts'
import { asResultAsync } from '../../../../../util/asResult.ts'
import { assert } from 'std/assert/assert.ts'
import { pMap } from '../../../../../util/inParallel.ts'
import sortBy from '../../../../../util/sortBy.ts'
import mapEntries from '../../../../../util/mapEntries.ts'
import { patient_findings } from '../../../../../db/models/patient_findings.ts'
import { TEWSScore } from '../../../../../db/models/sats_triage_scoring.ts'


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
    it('400s if missing blood_glucose measurement for a diabetic patient', async () => {
      const result = await asResultAsync(() =>
        setupTriage({
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
              respiratory_rate: {
                value: 12,
                units: VITAL_MEASUREMENTS_UNITS.respiratory_rate,
              },
              heart_rate: {
                value: 60,
                units: VITAL_MEASUREMENTS_UNITS.heart_rate,
              },
              blood_pressure_systolic: {
                value: 120,
                units: VITAL_MEASUREMENTS_UNITS.blood_pressure_systolic,
              },
              blood_pressure_diastolic: {
                value: 80,
                units: VITAL_MEASUREMENTS_UNITS.blood_pressure_diastolic,
              },
              temperature: {
                value: 36.6,
                units: VITAL_MEASUREMENTS_UNITS.temperature,
              },
            },
            assessments: {
              mobility_assessment: {
                value_snomed_concept_id: assessmentOptionSnomedConceptId(
                  'mobility_assessment',
                  'Walking',
                ),
              },
              consciousness: {
                value_snomed_concept_id: assessmentOptionSnomedConceptId(
                  'consciousness',
                  'Alert',
                ),
              },
              trauma_presence: {
                value_snomed_concept_id: assessmentOptionSnomedConceptId(
                  'trauma_presence',
                  'No',
                ),
              },
            },
          },
        })
      )

      assert(result.success === false)
      assertEquals(
        result.error.message,
        '[400]: Missing required measurement: blood_glucose',
      )
    })

    it('inserts all zero TEWS scores for an an adult patient fully in the normal range', async () => {
      const { encounter } = await setupTriage({
        patient_demographics: { date_of_birth: '2023-01-01' },
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
        vitals: {
          measurements: {
            respiratory_rate: {
              value: 12,
              units: VITAL_MEASUREMENTS_UNITS.respiratory_rate,
            },
            heart_rate: {
              value: 60,
              units: VITAL_MEASUREMENTS_UNITS.heart_rate,
            },
            blood_pressure_systolic: {
              value: 120,
              units: VITAL_MEASUREMENTS_UNITS.blood_pressure_systolic,
            },
            blood_pressure_diastolic: {
              value: 80,
              units: VITAL_MEASUREMENTS_UNITS.blood_pressure_diastolic,
            },
            temperature: {
              value: 36.6,
              units: VITAL_MEASUREMENTS_UNITS.temperature,
            },
          },
          assessments: {
            mobility_assessment: {
              value_snomed_concept_id: assessmentOptionSnomedConceptId(
                'mobility_assessment',
                'Walking',
              ),
            },
            consciousness: {
              value_snomed_concept_id: assessmentOptionSnomedConceptId(
                'consciousness',
                'Alert',
              ),
            },
            trauma_presence: {
              value_snomed_concept_id: assessmentOptionSnomedConceptId(
                'trauma_presence',
                'No',
              ),
            },
          },
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

      const respiratory_rate_measurement = findMatching(measurements, {
        finding_snomed_concept_id:
          VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS.respiratory_rate,
      })

      assertMatches(respiratory_rate_measurement, {
        'type': 'finding',
        'record_id': z.string().uuid(),
        'created_at': z.date(),
        'snomed_concept_id': '118245000',
        'patient_encounter_id': z.string().uuid(),
        'patient_encounter_employee_id': z.string().uuid(),
        'name': 'Measurement finding',
        'category': 'finding',
        'value_snomed_concept_id': null,
        'value_name': null,
        'finding_snomed_concept_id': '86290005',
        'finding_name': 'Respiratory rate',
        'value_display': '12 bpm',
        'destination_relations': [],
        'source_relations': [],
        'as_part_of_procedure': {
          'record_id': z.string().uuid(),
          'snomed_concept_id': '410188000',
          'name': 'Taking patient vital signs assessment',
        },
        'priority': null,
        'qualifiers': [],
        'value': '12',
        'units': 'bpm',
        'full_display': 'Respiratory rate: 12 bpm',
      }, { strict: true })

      const scores = await patient_evaluation_scores.findAll(
        db,
        {
          patient_id: encounter.patient.id,
        },
      )

      const finding_scores = await pMap(
        scores,
        async ({ score, evaluates_record_id }) => {
          const { finding_name } = await patient_findings.getById(
            db,
            evaluates_record_id,
          )
          return { finding_name, score }
        },
      )

      const sorted_finding_scores = sortBy(finding_scores, 'finding_name')

      // deno-fmt-ignore
      assertEquals(sorted_finding_scores, [
        { "finding_name": "Ability to mobilize", "score": 0 },
        { "finding_name": "Alert Confusion Voice Pain Unresponsive scale score", "score": 0 },
        { "finding_name": "Body temperature", "score": 0 },
        { "finding_name": "Pulse, function", "score": 0 },
        { "finding_name": "Respiratory rate", "score": 0 },
        { "finding_name": "Systolic blood pressure", "score": 0 },
        { "finding_name": "Traumatic injury", "score": 0 },
      ])
      // deno-fmt-ignore-end
    })

    function testAdultCase(
      description: string,
      measurement_values: {
        [v in VitalMeasurement]?: number
      },
      assessment_values: {
        [v in VitalAssessment]: string
      },
      expected_scores: {
        finding_name: string
        score: number
      }[]
    ) {
      it(description, async () => {
        const { encounter } = await setupTriage({
          patient_demographics: { date_of_birth: '2023-01-01' },
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
          vitals: {
            measurements: mapEntries(measurement_values, (value, vital) => ({
              value, 
              units: VITAL_MEASUREMENTS_UNITS[vital],
            })),
            assessments: mapEntries(assessment_values, (value, vital) => ({
              value_snomed_concept_id: assessmentOptionSnomedConceptId(
                vital,
                value
              ),
            }))
          },
        })

        const scores = await patient_evaluation_scores.findAll(
          db,
          {
            patient_id: encounter.patient.id,
          },
        )

        const finding_scores = await pMap(
          scores,
          async ({ score, evaluates_record_id }) => {
            const { finding_name } = await patient_findings.getById(
              db,
              evaluates_record_id,
            )
            return { finding_name, score }
          },
        )

        const sorted_finding_scores = sortBy(finding_scores, 'finding_name')

        assertEquals(sorted_finding_scores, expected_scores)
      })
    }

    testAdultCase(
      'respiratory_rate: 15 -> 1',
      {
        respiratory_rate: 15,
        heart_rate:  60,
        blood_pressure_systolic:  120,
        blood_pressure_diastolic:  80,
        temperature:  36.6,
      },
      {
        'mobility_assessment': 'Walking',
        'consciousness': 'Alert',
        'trauma_presence': 'No',
      },
      [
        { "finding_name": "Ability to mobilize", "score": 0 },
        { "finding_name": "Alert Confusion Voice Pain Unresponsive scale score", "score": 0 },
        { "finding_name": "Body temperature", "score": 0 },
        { "finding_name": "Pulse, function", "score": 0 },
        { "finding_name": "Respiratory rate", "score": 1 },
        { "finding_name": "Systolic blood pressure", "score": 0 },
        { "finding_name": "Traumatic injury", "score": 0 },
      ]
    )
  })
})
