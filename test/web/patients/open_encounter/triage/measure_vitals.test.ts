import { assertEquals } from 'std/assert/assert_equals.ts'
import { afterAll, before, describe, it } from 'std/testing/bdd.ts'
import db from '../../../../../db/db.ts'
import waitUntilTestServerUp from '../../../../_helpers/waitUntilTestServerUp.ts'
import {
  getFormLabels,
  getFormOptions,
  getFormValues,
} from '../../../../_helpers/form.ts'
import { patient_measurements } from '../../../../../db/models/patient_measurements.ts'
import { assertMatches } from '../../../../../util/assertMatches.ts'
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
import { AgeDetermination } from '../../../../../types.ts'
import z from 'zod'

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

    function dateOfBirth(age_determination: AgeDetermination): string {
      switch (age_determination) {
        case 'adult':
          return '1990-01-01'
        case 'older child':
          return '2020-01-01'
        case 'younger child':
          return '2025-01-01'
      }
    }

    function heightOf(age_determination: AgeDetermination): number {
      switch (age_determination) {
        case 'adult':
          return 160
        case 'older child':
          return 100
        case 'younger child':
          return 70
      }
    }

    function weightOf(age_determination: AgeDetermination): number {
      switch (age_determination) {
        case 'adult':
          return 70
        case 'older child':
          return 38
        case 'younger child':
          return 15
      }
    }

    function testCase(
      description: string,
      age_determination: AgeDetermination,
      measurement_values: {
        [v in VitalMeasurement]?: number
      },
      assessment_values: {
        [v in VitalAssessment]: string
      },
      expected_scores: {
        finding_name: string
        score: number
      }[],
    ) {
      it(description, async () => {
        const { encounter } = await setupTriage({
          patient_demographics: {
            date_of_birth: dateOfBirth(age_determination),
          },
          warning_signs: [],
          conditions: [],
          height_and_weight: {
            height: {
              value: heightOf(age_determination),
              units: 'cm',
            },
            weight: {
              value: weightOf(age_determination),
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
                value,
              ),
            })),
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

    // Helper to create expected scores with one component changed
    const baseScores = (overrides: Record<string, number> = {}) => {
      const defaults: Record<string, number> = {
        'Ability to mobilize': 0,
        'Alert Confusion Voice Pain Unresponsive scale score': 0,
        'Body temperature': 0,
        'Pulse, function': 0,
        'Respiratory rate': 0,
        'Systolic blood pressure': 0,
        'Traumatic injury': 0,
      }
      return Object.entries({ ...defaults, ...overrides })
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([finding_name, score]) => ({ finding_name, score }))
    }

    // Default values that score 0 for all vitals
    const default_measurements_adult = {
      respiratory_rate: 12, // 9-14 -> score 0
      heart_rate: 60, // 51-100 -> score 0
      blood_pressure_systolic: 120, // 101-199 -> score 0
      blood_pressure_diastolic: 80,
      temperature: 36.6, // 35-38.4 -> score 0
    }

    const default_assessments_adult = {
      mobility_assessment: 'Walking', // score 0
      consciousness: 'Alert', // score 0
      trauma_presence: 'No', // score 0
    } as const

    // =========================================
    // MOBILITY ASSESSMENT
    // =========================================

    testCase(
      'adult, mobility: Walking -> score: 0',
      'adult',
      default_measurements_adult,
      { ...default_assessments_adult, mobility_assessment: 'Walking' },
      baseScores({ 'Ability to mobilize': 0 }),
    )

    testCase(
      'adult, mobility: Difficulty walking -> score: 1',
      'adult',
      default_measurements_adult,
      {
        ...default_assessments_adult,
        mobility_assessment: 'Difficulty walking',
      },
      baseScores({ 'Ability to mobilize': 1 }),
    )

    testCase(
      'adult, mobility: Stretcher/Immobile -> score: 2',
      'adult',
      default_measurements_adult,
      {
        ...default_assessments_adult,
        mobility_assessment: 'Stretcher/Immobile',
      },
      baseScores({ 'Ability to mobilize': 2 }),
    )

    // =========================================
    // RESPIRATORY RATE (RR)
    // Ranges: <9 -> 3, 9-14 -> 0, 15-20 -> 1, 21-29 -> 2, >=30 -> 3
    // =========================================

    testCase(
      'adult, respiratory_rate: 8 (less than 9) -> score: 3',
      'adult',
      { ...default_measurements_adult, respiratory_rate: 8 },
      default_assessments_adult,
      baseScores({ 'Respiratory rate': 3 }),
    )

    testCase(
      'adult, respiratory_rate: 9 (boundary, 9-14 range) -> score: 0',
      'adult',
      { ...default_measurements_adult, respiratory_rate: 9 },
      default_assessments_adult,
      baseScores({ 'Respiratory rate': 0 }),
    )

    testCase(
      'adult, respiratory_rate: 14 (9-14 range) -> score: 0',
      'adult',
      { ...default_measurements_adult, respiratory_rate: 14 },
      default_assessments_adult,
      baseScores({ 'Respiratory rate': 0 }),
    )

    testCase(
      'adult, respiratory_rate: 15 (boundary, 15-20 range) -> score: 1',
      'adult',
      { ...default_measurements_adult, respiratory_rate: 15 },
      default_assessments_adult,
      baseScores({ 'Respiratory rate': 1 }),
    )

    testCase(
      'adult, respiratory_rate: 20 (15-20 range) -> score: 1',
      'adult',
      { ...default_measurements_adult, respiratory_rate: 20 },
      default_assessments_adult,
      baseScores({ 'Respiratory rate': 1 }),
    )

    testCase(
      'adult, respiratory_rate: 21 (boundary, 21-29 range) -> score: 2',
      'adult',
      { ...default_measurements_adult, respiratory_rate: 21 },
      default_assessments_adult,
      baseScores({ 'Respiratory rate': 2 }),
    )

    testCase(
      'adult, respiratory_rate: 29 (21-29 range) -> score: 2',
      'adult',
      { ...default_measurements_adult, respiratory_rate: 29 },
      default_assessments_adult,
      baseScores({ 'Respiratory rate': 2 }),
    )

    testCase(
      'adult, respiratory_rate: 30 (boundary, >=30) -> score: 3',
      'adult',
      { ...default_measurements_adult, respiratory_rate: 30 },
      default_assessments_adult,
      baseScores({ 'Respiratory rate': 3 }),
    )

    testCase(
      'adult, respiratory_rate: 35 (>=30) -> score: 3',
      'adult',
      { ...default_measurements_adult, respiratory_rate: 35 },
      default_assessments_adult,
      baseScores({ 'Respiratory rate': 3 }),
    )

    // =========================================
    // HEART RATE (HR)
    // Ranges: <41 -> 3, 41-50 -> 1, 51-100 -> 0, 101-110 -> 1, 111-129 -> 2, >=130 -> 3
    // =========================================

    testCase(
      'adult, heart_rate: 40 (less than 41) -> score: 3',
      'adult',
      { ...default_measurements_adult, heart_rate: 40 },
      default_assessments_adult,
      baseScores({ 'Pulse, function': 3 }),
    )

    testCase(
      'adult, heart_rate: 41 (boundary, 41-50 range) -> score: 1',
      'adult',
      { ...default_measurements_adult, heart_rate: 41 },
      default_assessments_adult,
      baseScores({ 'Pulse, function': 1 }),
    )

    testCase(
      'adult, heart_rate: 50 (41-50 range) -> score: 1',
      'adult',
      { ...default_measurements_adult, heart_rate: 50 },
      default_assessments_adult,
      baseScores({ 'Pulse, function': 1 }),
    )

    testCase(
      'adult, heart_rate: 51 (boundary, 51-100 range) -> score: 0',
      'adult',
      { ...default_measurements_adult, heart_rate: 51 },
      default_assessments_adult,
      baseScores({ 'Pulse, function': 0 }),
    )

    testCase(
      'adult, heart_rate: 100 (51-100 range) -> score: 0',
      'adult',
      { ...default_measurements_adult, heart_rate: 100 },
      default_assessments_adult,
      baseScores({ 'Pulse, function': 0 }),
    )

    testCase(
      'adult, heart_rate: 101 (boundary, 101-110 range) -> score: 1',
      'adult',
      { ...default_measurements_adult, heart_rate: 101 },
      default_assessments_adult,
      baseScores({ 'Pulse, function': 1 }),
    )

    testCase(
      'adult, heart_rate: 110 (101-110 range) -> score: 1',
      'adult',
      { ...default_measurements_adult, heart_rate: 110 },
      default_assessments_adult,
      baseScores({ 'Pulse, function': 1 }),
    )

    testCase(
      'adult, heart_rate: 111 (boundary, 111-129 range) -> score: 2',
      'adult',
      { ...default_measurements_adult, heart_rate: 111 },
      default_assessments_adult,
      baseScores({ 'Pulse, function': 2 }),
    )

    testCase(
      'adult, heart_rate: 129 (111-129 range) -> score: 2',
      'adult',
      { ...default_measurements_adult, heart_rate: 129 },
      default_assessments_adult,
      baseScores({ 'Pulse, function': 2 }),
    )

    testCase(
      'adult, heart_rate: 130 (boundary, >=130) -> score: 3',
      'adult',
      { ...default_measurements_adult, heart_rate: 130 },
      default_assessments_adult,
      baseScores({ 'Pulse, function': 3 }),
    )

    testCase(
      'adult, heart_rate: 150 (>=130) -> score: 3',
      'adult',
      { ...default_measurements_adult, heart_rate: 150 },
      default_assessments_adult,
      baseScores({ 'Pulse, function': 3 }),
    )

    // =========================================
    // SYSTOLIC BLOOD PRESSURE (SBP)
    // Ranges: <71 -> 3, 71-80 -> 2, 81-100 -> 1, 101-199 -> 0, >=200 -> 2
    // =========================================

    testCase(
      'adult, blood_pressure_systolic: 70 (less than 71) -> score: 3',
      'adult',
      { ...default_measurements_adult, blood_pressure_systolic: 70 },
      default_assessments_adult,
      baseScores({ 'Systolic blood pressure': 3 }),
    )

    testCase(
      'adult, blood_pressure_systolic: 71 (boundary, 71-80 range) -> score: 2',
      'adult',
      { ...default_measurements_adult, blood_pressure_systolic: 71 },
      default_assessments_adult,
      baseScores({ 'Systolic blood pressure': 2 }),
    )

    testCase(
      'adult, blood_pressure_systolic: 80 (71-80 range) -> score: 2',
      'adult',
      { ...default_measurements_adult, blood_pressure_systolic: 80 },
      default_assessments_adult,
      baseScores({ 'Systolic blood pressure': 2 }),
    )

    testCase(
      'adult, blood_pressure_systolic: 81 (boundary, 81-100 range) -> score: 1',
      'adult',
      { ...default_measurements_adult, blood_pressure_systolic: 81 },
      default_assessments_adult,
      baseScores({ 'Systolic blood pressure': 1 }),
    )

    testCase(
      'adult, blood_pressure_systolic: 100 (81-100 range) -> score: 1',
      'adult',
      { ...default_measurements_adult, blood_pressure_systolic: 100 },
      default_assessments_adult,
      baseScores({ 'Systolic blood pressure': 1 }),
    )

    testCase(
      'adult, blood_pressure_systolic: 101 (boundary, 101-199 range) -> score: 0',
      'adult',
      { ...default_measurements_adult, blood_pressure_systolic: 101 },
      default_assessments_adult,
      baseScores({ 'Systolic blood pressure': 0 }),
    )

    testCase(
      'adult, blood_pressure_systolic: 199 (101-199 range) -> score: 0',
      'adult',
      { ...default_measurements_adult, blood_pressure_systolic: 199 },
      default_assessments_adult,
      baseScores({ 'Systolic blood pressure': 0 }),
    )

    testCase(
      'adult, blood_pressure_systolic: 200 (boundary, >=200) -> score: 2',
      'adult',
      { ...default_measurements_adult, blood_pressure_systolic: 200 },
      default_assessments_adult,
      baseScores({ 'Systolic blood pressure': 2 }),
    )

    testCase(
      'adult, blood_pressure_systolic: 220 (>=200) -> score: 2',
      'adult',
      { ...default_measurements_adult, blood_pressure_systolic: 220 },
      default_assessments_adult,
      baseScores({ 'Systolic blood pressure': 2 }),
    )

    // =========================================
    // TEMPERATURE
    // Ranges: <35 -> 2, 35-38.4 -> 0, >38.4 -> 2
    // =========================================

    testCase(
      'adult, temperature: 34 (Cold/Under 35) -> score: 2',
      'adult',
      { ...default_measurements_adult, temperature: 34 },
      default_assessments_adult,
      baseScores({ 'Body temperature': 2 }),
    )

    testCase(
      'adult, temperature: 35 (boundary, normal range) -> score: 0',
      'adult',
      { ...default_measurements_adult, temperature: 35 },
      default_assessments_adult,
      baseScores({ 'Body temperature': 0 }),
    )

    testCase(
      'adult, temperature: 37 (normal range) -> score: 0',
      'adult',
      { ...default_measurements_adult, temperature: 37 },
      default_assessments_adult,
      baseScores({ 'Body temperature': 0 }),
    )

    testCase(
      'adult, temperature: 38.4 (normal range upper) -> score: 0',
      'adult',
      { ...default_measurements_adult, temperature: 38.4 },
      default_assessments_adult,
      baseScores({ 'Body temperature': 0 }),
    )

    testCase(
      'adult, temperature: 38.5 (boundary, Hot/Over 38.4) -> score: 2',
      'adult',
      { ...default_measurements_adult, temperature: 38.5 },
      default_assessments_adult,
      baseScores({ 'Body temperature': 2 }),
    )

    testCase(
      'adult, temperature: 40 (Hot/Over 38.4) -> score: 2',
      'adult',
      { ...default_measurements_adult, temperature: 40 },
      default_assessments_adult,
      baseScores({ 'Body temperature': 2 }),
    )

    // =========================================
    // CONSCIOUSNESS (AVPU)
    // Alert -> 0, Reacts to voice -> 1, Confused -> 2, Reacts to pain -> 2, Unresponsive -> 3
    // =========================================

    testCase(
      'adult, consciousness: Alert -> score: 0',
      'adult',
      default_measurements_adult,
      { ...default_assessments_adult, consciousness: 'Alert' },
      baseScores({ 'Alert Confusion Voice Pain Unresponsive scale score': 0 }),
    )

    testCase(
      'adult, consciousness: Reacts to voice -> score: 1',
      'adult',
      default_measurements_adult,
      { ...default_assessments_adult, consciousness: 'Reacts to voice' },
      baseScores({ 'Alert Confusion Voice Pain Unresponsive scale score': 1 }),
    )

    testCase(
      'adult, consciousness: Confused -> score: 2',
      'adult',
      default_measurements_adult,
      { ...default_assessments_adult, consciousness: 'Confused' },
      baseScores({ 'Alert Confusion Voice Pain Unresponsive scale score': 2 }),
    )

    testCase(
      'adult, consciousness: Reacts to pain -> score: 2',
      'adult',
      default_measurements_adult,
      { ...default_assessments_adult, consciousness: 'Reacts to pain' },
      baseScores({ 'Alert Confusion Voice Pain Unresponsive scale score': 2 }),
    )

    testCase(
      'adult, consciousness: Unresponsive -> score: 3',
      'adult',
      default_measurements_adult,
      { ...default_assessments_adult, consciousness: 'Unresponsive' },
      baseScores({ 'Alert Confusion Voice Pain Unresponsive scale score': 3 }),
    )

    // =========================================
    // TRAUMA PRESENCE
    // No -> 0, Yes -> 1
    // =========================================

    testCase(
      'adult, trauma: No -> score: 0',
      'adult',
      default_measurements_adult,
      { ...default_assessments_adult, trauma_presence: 'No' },
      baseScores({ 'Traumatic injury': 0 }),
    )

    testCase(
      'adult, trauma: Yes -> score: 1',
      'adult',
      default_measurements_adult,
      { ...default_assessments_adult, trauma_presence: 'Yes' },
      baseScores({ 'Traumatic injury': 1 }),
    )
  })
})
