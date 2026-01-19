import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { afterAll, before } from 'std/testing/bdd.ts'
import db from '../../../../../db/db.ts'
import waitUntilTestServerUp from '../../../../_helpers/waitUntilTestServerUp.ts'
import { getFormLabels, getFormOptions, getFormValues } from '../../../../_helpers/form.ts'
import { patient_measurements } from '../../../../../db/models/patient_measurements.ts'
import { assertMatches } from '../../../../../util/assertMatches.ts'
import { asWarningSigns, setupTriageNewPatient } from './_setup.ts'
import {
  assessmentOptionSExpression,
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
import { patient_findings } from '../../../../../db/models/patient_findings.ts'
import { AgeDetermination } from '../../../../../types.ts'
import z from 'zod'
import sumBy from '../../../../../util/sumBy.ts'
import { asVitalAssessmentFormValues, asVitalMeasurementFormValues } from '../../../../../shared/vitals.ts'
import { events } from '../../../../../db/models/events.ts'

describeParallel('triage/measure_vitals', () => {
  before(waitUntilTestServerUp)
  afterAll(() => db.destroy())
  afterAll(() => events.closeAllProcessedPubSub({ graceful: false }))

  describeParallel('GET', () => {
    itParallel(
      'loads a page for the first visit for an adult non-diabetic patient ',
      async () => {
        const { $ } = await setupTriageNewPatient({
          patient_demographics: { date_of_birth: '1990-01-01' },
          warning_signs: asWarningSigns([], { pregnant: false }),
          brief_history: {
            diabetes: { existence: 'No' },
            pregnancy: { existence: 'No' },
          },
          height_and_weight: {
            measurements: {
              height: {
                value: 160,
                units: 'cm',
              },
              weight: {
                value: 80,
                units: 'kg',
              },
            },
          },
        })

        const form_values = getFormValues($)
        const form_labels = getFormLabels($)
        const form_options = getFormOptions($)

        assertEquals(form_values, {
          assessments: {
            consciousness: { s_expression: null },
            mobility_assessment: { s_expression: null },
            trauma_presence: { s_expression: null },
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
            consciousness: { s_expression: 'Consciousness*' },
            mobility_assessment: {
              s_expression: 'Mobility Assessment*',
            },
            trauma_presence: { s_expression: 'Trauma Presence*' },
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
              's_expression': [
                {
                  'label': 'Select...',
                  'value': '',
                  'selected': false,
                },
                {
                  'label': 'Alert',
                  'value': '(finding (snomed_concept "Clinical finding" "finding") 248234008)',
                  'selected': false,
                },
                {
                  'label': 'Reacts to voice',
                  'value': '(finding (snomed_concept "Clinical finding" "finding") 422768004)',
                  'selected': false,
                },
                {
                  'label': 'Confused',
                  'value': '(finding (snomed_concept "Clinical finding" "finding") 40917007)',
                  'selected': false,
                },
                {
                  'label': 'Reacts to pain',
                  'value': '(finding (snomed_concept "Clinical finding" "finding") 450847001)',
                  'selected': false,
                },
                {
                  'label': 'Unresponsive',
                  'value': '(finding (snomed_concept "Clinical finding" "finding") 422107003)',
                  'selected': false,
                },
              ],
            },
            'mobility_assessment': {
              's_expression': [
                {
                  'label': 'Select...',
                  'value': '',
                  'selected': false,
                },
                {
                  'label': 'Walking',
                  'value': '(finding (snomed_concept "Clinical finding" "finding") 282144007)',
                  'selected': false,
                },
                {
                  'label': 'Difficulty walking',
                  'value': '(finding (snomed_concept "Clinical finding" "finding") 719232003)',
                  'selected': false,
                },
                {
                  'label': 'Stretcher/Immobile',
                  'value': '(finding (snomed_concept "Clinical finding" "finding") 282145008)',
                  'selected': false,
                },
              ],
            },
            'trauma_presence': {
              's_expression': [
                {
                  'label': 'Select...',
                  'value': '',
                  'selected': false,
                },
                {
                  'label': 'No',
                  'value': '(finding (snomed_concept "Clinical finding" "finding") 1149217004)',
                  'selected': false,
                },
                {
                  'label': 'Yes',
                  'value': '(finding (snomed_concept "Clinical finding" "finding") 417746004)',
                  'selected': false,
                },
              ],
            },
          },
        })
      },
    )

    itParallel(
      'loads a page for the first visit for an adult diabetic patient ',
      async () => {
        const { $ } = await setupTriageNewPatient({
          patient_demographics: { date_of_birth: '1990-01-01' },
          warning_signs: asWarningSigns([], { pregnant: false }),
          brief_history: {
            diabetes: { existence: 'Yes' },
            pregnancy: { existence: 'No' },
          },
          height_and_weight: {
            measurements: {
              height: {
                value: 160,
                units: 'cm',
              },
              weight: {
                value: 80,
                units: 'kg',
              },
            },
          },
        })

        assertEquals(getFormLabels($), {
          assessments: {
            consciousness: { s_expression: 'Consciousness*' },
            mobility_assessment: {
              s_expression: 'Mobility Assessment*',
            },
            trauma_presence: { s_expression: 'Trauma Presence*' },
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
      },
    )

    itParallel(
      'loads a page for the first visit for a non-diabetic older child ',
      async () => {
        const { $ } = await setupTriageNewPatient({
          patient_demographics: { date_of_birth: '2020-01-01' },
          warning_signs: asWarningSigns([], { pregnant: false }),
          brief_history: {
            diabetes: { existence: 'No' },
            pregnancy: { existence: 'No' },
          },
          height_and_weight: {
            measurements: {
              height: {
                value: 100,
                units: 'cm',
              },
              weight: {
                value: 40,
                units: 'kg',
              },
            },
          },
        })

        assertEquals(getFormLabels($), {
          assessments: {
            consciousness: { s_expression: 'Consciousness*' },
            mobility_assessment: {
              s_expression: 'Mobility Assessment*',
            },
            trauma_presence: { s_expression: 'Trauma Presence*' },
          },
          measurements: {
            temperature: { value: 'Temperature*' },
            heart_rate: { value: 'Heart Rate*' },
            respiratory_rate: { value: 'Respiratory Rate*' },
          },
        })
      },
    )

    itParallel(
      'loads a page for the first visit for a non-diabetic older child ',
      async () => {
        const { $ } = await setupTriageNewPatient({
          patient_demographics: { date_of_birth: '2020-01-01' },
          warning_signs: asWarningSigns([], { pregnant: false }),
          brief_history: {
            diabetes: { existence: 'Yes' },
            pregnancy: { existence: 'No' },
          },
          height_and_weight: {
            measurements: {
              height: {
                value: 100,
                units: 'cm',
              },
              weight: {
                value: 40,
                units: 'kg',
              },
            },
          },
        })

        assertEquals(getFormLabels($), {
          assessments: {
            consciousness: { s_expression: 'Consciousness*' },
            mobility_assessment: {
              s_expression: 'Mobility Assessment*',
            },
            trauma_presence: { s_expression: 'Trauma Presence*' },
          },
          measurements: {
            temperature: { value: 'Temperature*' },
            heart_rate: { value: 'Heart Rate*' },
            respiratory_rate: { value: 'Respiratory Rate*' },
            blood_glucose: { value: 'Blood Glucose*' },
          },
        })
      },
    )
  })

  describeParallel('POST', () => {
    itParallel(
      '400s if missing blood_glucose measurement for a diabetic patient',
      async () => {
        const result = await asResultAsync(() =>
          setupTriageNewPatient({
            patient_demographics: { date_of_birth: '2023-01-01' },
            warning_signs: asWarningSigns([], { pregnant: false }),
            brief_history: {
              diabetes: { existence: 'Yes' },
              pregnancy: { existence: 'No' },
            },
            height_and_weight: {
              measurements: {
                height: {
                  value: 160,
                  units: 'cm',
                },
                weight: {
                  value: 80,
                  units: 'kg',
                },
              },
            },
            measure_vitals: {
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
                  s_expression: assessmentOptionSExpression(
                    'mobility_assessment',
                    'Walking',
                  ),
                },
                consciousness: {
                  s_expression: assessmentOptionSExpression(
                    'consciousness',
                    'Alert',
                  ),
                },
                trauma_presence: {
                  s_expression: assessmentOptionSExpression(
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
          result.error.message.split('\n')[0],
          '[400]: Missing required measurement: blood_glucose',
        )
      },
    )

    itParallel(
      'marks hypoglycaemia (glucose < 3) as an emergency',
      async () => {
        const { patient_id, patient_encounter_id } = await setupTriageNewPatient({
          patient_demographics: { date_of_birth: '1990-01-01' },
          warning_signs: asWarningSigns([], { pregnant: false }),
          brief_history: {
            diabetes: { existence: 'Yes' },
            pregnancy: { existence: 'No' },
          },
          height_and_weight: {
            measurements: {
              height: {
                value: 160,
                units: 'cm',
              },
              weight: {
                value: 80,
                units: 'kg',
              },
            },
          },
          measure_vitals: {
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
              blood_glucose: {
                value: 2.9,
                units: VITAL_MEASUREMENTS_UNITS.blood_glucose,
              },
            },
            assessments: {
              mobility_assessment: {
                s_expression: assessmentOptionSExpression(
                  'mobility_assessment',
                  'Walking',
                ),
              },
              consciousness: {
                s_expression: assessmentOptionSExpression(
                  'consciousness',
                  'Alert',
                ),
              },
              trauma_presence: {
                s_expression: assessmentOptionSExpression(
                  'trauma_presence',
                  'No',
                ),
              },
            },
          },
        })

        await events.allProcessedForEncounter(db, { patient_encounter_id })

        const measurement = await patient_findings.findOne(db, {
          patient_id,
          s_expression: `(measurement ${VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS.blood_glucose})`,
        })

        assertMatches(measurement, {
          'displays': { 'full': 'Blood glucose status: 2.9 mmol/L' },
          'priority': 'Emergency',
        })
      },
    )

    itParallel(
      'marks hypoglycaemia (glucose < 3) as an emergency',
      async () => {
        const { patient_id, patient_encounter_id } = await setupTriageNewPatient({
          patient_demographics: { date_of_birth: '1990-01-01' },
          warning_signs: asWarningSigns([], { pregnant: false }),
          brief_history: {
            diabetes: { existence: 'Yes' },
            pregnancy: { existence: 'No' },
          },
          height_and_weight: {
            measurements: {
              height: {
                value: 160,
                units: 'cm',
              },
              weight: {
                value: 80,
                units: 'kg',
              },
            },
          },
          measure_vitals: {
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
              blood_glucose: {
                value: 2.9,
                units: VITAL_MEASUREMENTS_UNITS.blood_glucose,
              },
            },
            assessments: {
              mobility_assessment: {
                s_expression: assessmentOptionSExpression(
                  'mobility_assessment',
                  'Walking',
                ),
              },
              consciousness: {
                s_expression: assessmentOptionSExpression(
                  'consciousness',
                  'Alert',
                ),
              },
              trauma_presence: {
                s_expression: assessmentOptionSExpression(
                  'trauma_presence',
                  'No',
                ),
              },
            },
          },
        })

        await events.allProcessedForEncounter(db, { patient_encounter_id })

        const measurement = await patient_findings.findOne(db, {
          patient_id,
          s_expression: `(measurement ${VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS.blood_glucose})`,
        })

        assertMatches(measurement, {
          'displays': { 'full': 'Blood glucose status: 2.9 mmol/L' },
          'priority': 'Emergency',
        })
      },
    )

    itParallel(
      'inserts all zero TEWS scores for an an adult patient fully in the normal range',
      async () => {
        const { encounter } = await setupTriageNewPatient({
          patient_demographics: { date_of_birth: '2023-01-01' },
          warning_signs: asWarningSigns([], { pregnant: false }),
          brief_history: {
            diabetes: { existence: 'No' },
            pregnancy: { existence: 'No' },
          },
          height_and_weight: {
            measurements: {
              height: {
                value: 160,
                units: 'cm',
              },
              weight: {
                value: 80,
                units: 'kg',
              },
            },
          },
          measure_vitals: {
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
                s_expression: assessmentOptionSExpression(
                  'mobility_assessment',
                  'Walking',
                ),
              },
              consciousness: {
                s_expression: assessmentOptionSExpression(
                  'consciousness',
                  'Alert',
                ),
              },
              trauma_presence: {
                s_expression: assessmentOptionSExpression(
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

        const respiratory_rate_measurement = measurements.find((m) =>
          m.specific_snomed_concept.snomed_concept_id ===
            VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS.respiratory_rate
        )!

        assertMatches(respiratory_rate_measurement, {
          'type': 'finding',
          'record_id': z.string().uuid(),
          'created_at': z.date(),
          'patient_encounter_id': z.string().uuid(),
          'patient_encounter_employee_id': z.string().uuid(),
          'root_snomed_concept': {
            'snomed_concept_id': '118245000',
            'name': 'Measurement finding',
            'category': 'finding',
          },
          'specific_snomed_concept': {
            'snomed_concept_id': '86290005',
            'name': 'Respiratory rate',
            'category': 'observable entity',
          },
          'displays': {
            'finding': 'Respiratory rate',
            'value': `12\u00A0bpm`,
            'full': `Respiratory rate: 12\u00A0bpm`,
          },
          'destination_relations': [],
          'source_relations': [],
          'as_part_of_procedure': {
            'record_id': z.string().uuid(),
            'root_snomed_concept': {
              'snomed_concept_id': '71388002',
              'name': 'Procedure',
              'category': 'procedure',
            },
            'specific_snomed_concept': {
              'snomed_concept_id': '410188000',
              'name': 'Taking patient vital signs assessment',
              'category': 'procedure',
            },
          },
          'priority': null,
          'score': 0,
          'value': {
            'type': 'measurement',
            'value': '12',
            'units': 'bpm',
          },
          'modifiers': [],
          'attributes': [],
          'evaluations': [{
            'record_id': z.string().uuid(),
            'created_at': z.iso.datetime({ offset: true }),
            'patient_encounter_id': z.string().uuid(),
            'root_snomed_concept': {
              'snomed_concept_id': '129265001',
              'name': 'Evaluation - action',
              'category': 'qualifier value',
            },
            'specific_snomed_concept': {
              'snomed_concept_id': '278305009',
              'name': 'Severity score',
              'category': 'qualifier value',
            },
            'value': { 'type': 'score', 'score': '0' },
            'displays': {
              'finding': 'Severity score',
              'value': '0',
              'full': 'Severity score: 0',
            },
          }],
          'existence': 'Yes',
        }, { strict: true })

        const component_scores = await patient_evaluation_scores.findAll(
          db,
          {
            patient_id: encounter.patient.id,
            s_expression: '(evaluation (evaluates (finding)))',
          },
        )

        const total_score = await patient_evaluation_scores.findOne(
          db,
          {
            patient_id: encounter.patient.id,
            s_expression: '(evaluation (evaluates (procedure)))',
          },
        )

        const finding_scores = await pMap(
          component_scores,
          async ({ score, evaluates_record_id, specific_snomed_concept }) => {
            if (specific_snomed_concept.name !== 'Severity score') {
              return {
                finding_name: specific_snomed_concept.name,
                score,
              }
            }
            const finding = await patient_findings.getById(
              db,
              evaluates_record_id,
            )
            return { finding_name: finding.specific_snomed_concept.name, score }
          },
        )

        const sorted_finding_scores = sortBy(finding_scores, 'finding_name')

        // deno-fmt-ignore
        assertEquals(sorted_finding_scores, [
        { "finding_name": "Alert Confusion Voice Pain Unresponsive scale score", "score": 0 },
        { "finding_name": "Assessment of mobility", "score": 0 },
        { "finding_name": "Body temperature", "score": 0 },
        { "finding_name": "Pulse, function", "score": 0 },
        { "finding_name": "Respiratory rate", "score": 0 },
        { "finding_name": "Systolic blood pressure", "score": 0 },
        { "finding_name": "Trauma score", "score": 0 },
      ])
        // deno-fmt-ignore-end

        assertEquals(total_score.score, 0)
      },
    )

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
      opts: { only?: boolean; skip?: boolean } = {},
    ) {
      itParallel(description, async () => {
        const { encounter } = await setupTriageNewPatient({
          patient_demographics: {
            date_of_birth: dateOfBirth(age_determination),
          },
          warning_signs: asWarningSigns([], { pregnant: false }),
          brief_history: {
            diabetes: { existence: 'No' },
            pregnancy: { existence: 'No' },
          },
          height_and_weight: {
            measurements: {
              height: {
                value: heightOf(age_determination),
                units: 'cm',
              },
              weight: {
                value: weightOf(age_determination),
                units: 'kg',
              },
            },
          },
          measure_vitals: {
            measurements: asVitalMeasurementFormValues(measurement_values),
            assessments: asVitalAssessmentFormValues(assessment_values),
          },
        })

        const component_scores = await patient_evaluation_scores.findAll(
          db,
          {
            patient_id: encounter.patient.id,
            s_expression: '(evaluation (evaluates (finding)))',
          },
        )

        const total_score = await patient_evaluation_scores.findOne(
          db,
          {
            patient_id: encounter.patient.id,
            s_expression: '(evaluation (evaluates (procedure)))',
          },
        )

        const finding_scores = await pMap(
          component_scores,
          async ({ score, evaluates_record_id, specific_snomed_concept }) => {
            if (specific_snomed_concept.name !== 'Severity score') {
              return {
                finding_name: specific_snomed_concept.name,
                score,
              }
            }
            const finding = await patient_findings.getById(
              db,
              evaluates_record_id,
            )
            return {
              finding_name: finding.specific_snomed_concept.name,
              score,
            }
          },
        )

        const sorted_finding_scores = sortBy(finding_scores, 'finding_name')

        assertEquals(sorted_finding_scores, expected_scores)
        assertEquals(total_score.score, sumBy(expected_scores, 'score'))
      }, opts)
    }

    // Helper to create expected scores with one component changed
    const baseScores = (overrides: Record<string, number> = {}) => {
      const defaults: Record<string, number> = {
        'Assessment of mobility': 0,
        'Alert Confusion Voice Pain Unresponsive scale score': 0,
        'Body temperature': 0,
        'Pulse, function': 0,
        'Respiratory rate': 0,
        'Systolic blood pressure': 0,
        'Trauma score': 0,
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
      baseScores({ 'Assessment of mobility': 0 }),
    )

    testCase(
      'adult, mobility: Difficulty walking -> score: 1',
      'adult',
      default_measurements_adult,
      {
        ...default_assessments_adult,
        mobility_assessment: 'Difficulty walking',
      },
      baseScores({ 'Assessment of mobility': 1 }),
    )

    testCase(
      'adult, mobility: Stretcher/Immobile -> score: 2',
      'adult',
      default_measurements_adult,
      {
        ...default_assessments_adult,
        mobility_assessment: 'Stretcher/Immobile',
      },
      baseScores({ 'Assessment of mobility': 2 }),
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
      baseScores({ 'Trauma score': 0 }),
    )

    testCase(
      'adult, trauma: Yes -> score: 1',
      'adult',
      default_measurements_adult,
      { ...default_assessments_adult, trauma_presence: 'Yes' },
      baseScores({ 'Trauma score': 1 }),
    )

    // =========================================
    // OLDER CHILD TEWS (3-12 years / 95-150cm)
    // =========================================

    // Helper for older child expected scores (no blood pressure)
    const baseScoresOlderChild = (overrides: Record<string, number> = {}) => {
      const defaults: Record<string, number> = {
        'Assessment of mobility': 0,
        'Alert Confusion Voice Pain Unresponsive scale score': 0,
        'Body temperature': 0,
        'Pulse, function': 0,
        'Respiratory rate': 0,
        'Trauma score': 0,
      }
      return Object.entries({ ...defaults, ...overrides })
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([finding_name, score]) => ({ finding_name, score }))
    }

    // Default values that score 0 for older child
    const default_measurements_older_child = {
      respiratory_rate: 19, // 17-21 -> score 0
      heart_rate: 90, // 80-99 -> score 0
      temperature: 36.6, // 35-38.4 -> score 0
    }

    const default_assessments_older_child = {
      mobility_assessment: 'Normal for age', // Normal for age -> score 0
      consciousness: 'Alert', // score 0
      trauma_presence: 'No', // score 0
    } as const

    // =========================================
    // OLDER CHILD - MOBILITY ASSESSMENT
    // Normal for age -> 0, Unable to walk as normal -> 2
    // =========================================

    testCase(
      'older child, mobility: Unable to walk as normal -> score: 2',
      'older child',
      default_measurements_older_child,
      {
        ...default_assessments_older_child,
        mobility_assessment: 'Unable to walk as normal',
      },
      baseScoresOlderChild({ 'Assessment of mobility': 2 }),
    )

    // =========================================
    // OLDER CHILD - RESPIRATORY RATE (RR)
    // Ranges: <15 -> 3, 15-16 -> 2, 17-21 -> 0, 22-26 -> 1, >=27 -> 2
    // =========================================

    testCase(
      'older child, respiratory_rate: 14 (less than 15) -> score: 3',
      'older child',
      { ...default_measurements_older_child, respiratory_rate: 14 },
      default_assessments_older_child,
      baseScoresOlderChild({ 'Respiratory rate': 3 }),
    )

    testCase(
      'older child, respiratory_rate: 15 (boundary, 15-16 range) -> score: 2',
      'older child',
      { ...default_measurements_older_child, respiratory_rate: 15 },
      default_assessments_older_child,
      baseScoresOlderChild({ 'Respiratory rate': 2 }),
    )

    testCase(
      'older child, respiratory_rate: 16 (15-16 range) -> score: 2',
      'older child',
      { ...default_measurements_older_child, respiratory_rate: 16 },
      default_assessments_older_child,
      baseScoresOlderChild({ 'Respiratory rate': 2 }),
    )

    testCase(
      'older child, respiratory_rate: 17 (boundary, 17-21 range) -> score: 0',
      'older child',
      { ...default_measurements_older_child, respiratory_rate: 17 },
      default_assessments_older_child,
      baseScoresOlderChild({ 'Respiratory rate': 0 }),
    )

    testCase(
      'older child, respiratory_rate: 21 (17-21 range) -> score: 0',
      'older child',
      { ...default_measurements_older_child, respiratory_rate: 21 },
      default_assessments_older_child,
      baseScoresOlderChild({ 'Respiratory rate': 0 }),
    )

    testCase(
      'older child, respiratory_rate: 22 (boundary, 22-26 range) -> score: 1',
      'older child',
      { ...default_measurements_older_child, respiratory_rate: 22 },
      default_assessments_older_child,
      baseScoresOlderChild({ 'Respiratory rate': 1 }),
    )

    testCase(
      'older child, respiratory_rate: 26 (22-26 range) -> score: 1',
      'older child',
      { ...default_measurements_older_child, respiratory_rate: 26 },
      default_assessments_older_child,
      baseScoresOlderChild({ 'Respiratory rate': 1 }),
    )

    testCase(
      'older child, respiratory_rate: 27 (boundary, >=27) -> score: 2',
      'older child',
      { ...default_measurements_older_child, respiratory_rate: 27 },
      default_assessments_older_child,
      baseScoresOlderChild({ 'Respiratory rate': 2 }),
    )

    testCase(
      'older child, respiratory_rate: 35 (>=27) -> score: 2',
      'older child',
      { ...default_measurements_older_child, respiratory_rate: 35 },
      default_assessments_older_child,
      baseScoresOlderChild({ 'Respiratory rate': 2 }),
    )

    // =========================================
    // OLDER CHILD - HEART RATE (HR)
    // Ranges: <60 -> 3, 60-79 -> 2, 80-99 -> 0, 100-129 -> 1, >=130 -> 2
    // =========================================

    testCase(
      'older child, heart_rate: 59 (less than 60) -> score: 3',
      'older child',
      { ...default_measurements_older_child, heart_rate: 59 },
      default_assessments_older_child,
      baseScoresOlderChild({ 'Pulse, function': 3 }),
    )

    testCase(
      'older child, heart_rate: 60 (boundary, 60-79 range) -> score: 2',
      'older child',
      { ...default_measurements_older_child, heart_rate: 60 },
      default_assessments_older_child,
      baseScoresOlderChild({ 'Pulse, function': 2 }),
    )

    testCase(
      'older child, heart_rate: 79 (60-79 range) -> score: 2',
      'older child',
      { ...default_measurements_older_child, heart_rate: 79 },
      default_assessments_older_child,
      baseScoresOlderChild({ 'Pulse, function': 2 }),
    )

    testCase(
      'older child, heart_rate: 80 (boundary, 80-99 range) -> score: 0',
      'older child',
      { ...default_measurements_older_child, heart_rate: 80 },
      default_assessments_older_child,
      baseScoresOlderChild({ 'Pulse, function': 0 }),
    )

    testCase(
      'older child, heart_rate: 99 (80-99 range) -> score: 0',
      'older child',
      { ...default_measurements_older_child, heart_rate: 99 },
      default_assessments_older_child,
      baseScoresOlderChild({ 'Pulse, function': 0 }),
    )

    testCase(
      'older child, heart_rate: 100 (boundary, 100-129 range) -> score: 1',
      'older child',
      { ...default_measurements_older_child, heart_rate: 100 },
      default_assessments_older_child,
      baseScoresOlderChild({ 'Pulse, function': 1 }),
    )

    testCase(
      'older child, heart_rate: 129 (100-129 range) -> score: 1',
      'older child',
      { ...default_measurements_older_child, heart_rate: 129 },
      default_assessments_older_child,
      baseScoresOlderChild({ 'Pulse, function': 1 }),
    )

    testCase(
      'older child, heart_rate: 130 (boundary, >=130) -> score: 2',
      'older child',
      { ...default_measurements_older_child, heart_rate: 130 },
      default_assessments_older_child,
      baseScoresOlderChild({ 'Pulse, function': 2 }),
    )

    testCase(
      'older child, heart_rate: 150 (>=130) -> score: 2',
      'older child',
      { ...default_measurements_older_child, heart_rate: 150 },
      default_assessments_older_child,
      baseScoresOlderChild({ 'Pulse, function': 2 }),
    )

    // =========================================
    // OLDER CHILD - TEMPERATURE
    // Ranges: <35 -> 2, 35-38.4 -> 0, >38.4 -> 2
    // =========================================

    testCase(
      'older child, temperature: 34 (Cold/Under 35) -> score: 2',
      'older child',
      { ...default_measurements_older_child, temperature: 34 },
      default_assessments_older_child,
      baseScoresOlderChild({ 'Body temperature': 2 }),
    )

    testCase(
      'older child, temperature: 35 (boundary, normal range) -> score: 0',
      'older child',
      { ...default_measurements_older_child, temperature: 35 },
      default_assessments_older_child,
      baseScoresOlderChild({ 'Body temperature': 0 }),
    )

    testCase(
      'older child, temperature: 37 (normal range) -> score: 0',
      'older child',
      { ...default_measurements_older_child, temperature: 37 },
      default_assessments_older_child,
      baseScoresOlderChild({ 'Body temperature': 0 }),
    )

    testCase(
      'older child, temperature: 38.4 (normal range upper) -> score: 0',
      'older child',
      { ...default_measurements_older_child, temperature: 38.4 },
      default_assessments_older_child,
      baseScoresOlderChild({ 'Body temperature': 0 }),
    )

    testCase(
      'older child, temperature: 38.5 (boundary, Hot/Over 38.4) -> score: 2',
      'older child',
      { ...default_measurements_older_child, temperature: 38.5 },
      default_assessments_older_child,
      baseScoresOlderChild({ 'Body temperature': 2 }),
    )

    testCase(
      'older child, temperature: 40 (Hot/Over 38.4) -> score: 2',
      'older child',
      { ...default_measurements_older_child, temperature: 40 },
      default_assessments_older_child,
      baseScoresOlderChild({ 'Body temperature': 2 }),
    )

    // =========================================
    // OLDER CHILD - CONSCIOUSNESS (AVPU)
    // Alert -> 0, Reacts to voice -> 1, Confused -> 2, Reacts to pain -> 2, Unresponsive -> 3
    // =========================================

    testCase(
      'older child, consciousness: Alert -> score: 0',
      'older child',
      default_measurements_older_child,
      { ...default_assessments_older_child, consciousness: 'Alert' },
      baseScoresOlderChild({
        'Alert Confusion Voice Pain Unresponsive scale score': 0,
      }),
    )

    testCase(
      'older child, consciousness: Reacts to voice -> score: 1',
      'older child',
      default_measurements_older_child,
      { ...default_assessments_older_child, consciousness: 'Reacts to voice' },
      baseScoresOlderChild({
        'Alert Confusion Voice Pain Unresponsive scale score': 1,
      }),
    )

    testCase(
      'older child, consciousness: Confused -> score: 2',
      'older child',
      default_measurements_older_child,
      { ...default_assessments_older_child, consciousness: 'Confused' },
      baseScoresOlderChild({
        'Alert Confusion Voice Pain Unresponsive scale score': 2,
      }),
    )

    testCase(
      'older child, consciousness: Reacts to pain -> score: 2',
      'older child',
      default_measurements_older_child,
      { ...default_assessments_older_child, consciousness: 'Reacts to pain' },
      baseScoresOlderChild({
        'Alert Confusion Voice Pain Unresponsive scale score': 2,
      }),
    )

    testCase(
      'older child, consciousness: Unresponsive -> score: 3',
      'older child',
      default_measurements_older_child,
      { ...default_assessments_older_child, consciousness: 'Unresponsive' },
      baseScoresOlderChild({
        'Alert Confusion Voice Pain Unresponsive scale score': 3,
      }),
    )

    // =========================================
    // OLDER CHILD - TRAUMA PRESENCE
    // No -> 0, Yes -> 1
    // =========================================

    testCase(
      'older child, trauma: No -> score: 0',
      'older child',
      default_measurements_older_child,
      { ...default_assessments_older_child, trauma_presence: 'No' },
      baseScoresOlderChild({ 'Trauma score': 0 }),
    )

    testCase(
      'older child, trauma: Yes -> score: 1',
      'older child',
      default_measurements_older_child,
      { ...default_assessments_older_child, trauma_presence: 'Yes' },
      baseScoresOlderChild({ 'Trauma score': 1 }),
    )

    // =========================================
    // YOUNGER CHILD TEWS (<3 years / <95cm)
    // =========================================

    // Helper for younger child expected scores (no blood pressure)
    const baseScoresYoungerChild = (overrides: Record<string, number> = {}) => {
      const defaults: Record<string, number> = {
        'Assessment of mobility': 0,
        'Alert Confusion Voice Pain Unresponsive scale score': 0,
        'Body temperature': 0,
        'Pulse, function': 0,
        'Respiratory rate': 0,
        'Trauma score': 0,
      }
      return Object.entries({ ...defaults, ...overrides })
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([finding_name, score]) => ({ finding_name, score }))
    }

    // Default values that score 0 for younger child
    const default_measurements_younger_child = {
      respiratory_rate: 30, // 26-39 -> score 0
      heart_rate: 100, // 80-130 -> score 0
      temperature: 36.6, // 35-38.4 -> score 0
    }

    const default_assessments_younger_child = {
      mobility_assessment: 'Normal for age', // Normal for age -> score 0
      consciousness: 'Alert', // score 0
      trauma_presence: 'No', // score 0
    } as const

    // =========================================
    // YOUNGER CHILD - MOBILITY ASSESSMENT
    // Normal for age -> 0, Unable to move as normal -> 2
    // =========================================

    testCase(
      'younger child, mobility: Normal for age -> score: 0',
      'younger child',
      default_measurements_younger_child,
      {
        ...default_assessments_younger_child,
        mobility_assessment: 'Normal for age',
      },
      baseScoresYoungerChild({ 'Assessment of mobility': 0 }),
    )

    testCase(
      'younger child, mobility: Unable to move as normal -> score: 2',
      'younger child',
      default_measurements_younger_child,
      {
        ...default_assessments_younger_child,
        mobility_assessment: 'Unable to move as normal',
      },
      baseScoresYoungerChild({ 'Assessment of mobility': 2 }),
    )

    // =========================================
    // YOUNGER CHILD - RESPIRATORY RATE (RR)
    // Ranges: <20 -> 3, 20-25 -> 2, 26-39 -> 0, 40-49 -> 2, >=50 -> 3
    // =========================================

    testCase(
      'younger child, respiratory_rate: 19 (less than 20) -> score: 3',
      'younger child',
      { ...default_measurements_younger_child, respiratory_rate: 19 },
      default_assessments_younger_child,
      baseScoresYoungerChild({ 'Respiratory rate': 3 }),
    )

    testCase(
      'younger child, respiratory_rate: 20 (boundary, 20-25 range) -> score: 2',
      'younger child',
      { ...default_measurements_younger_child, respiratory_rate: 20 },
      default_assessments_younger_child,
      baseScoresYoungerChild({ 'Respiratory rate': 2 }),
    )

    testCase(
      'younger child, respiratory_rate: 25 (20-25 range) -> score: 2',
      'younger child',
      { ...default_measurements_younger_child, respiratory_rate: 25 },
      default_assessments_younger_child,
      baseScoresYoungerChild({ 'Respiratory rate': 2 }),
    )

    testCase(
      'younger child, respiratory_rate: 26 (boundary, 26-39 range) -> score: 0',
      'younger child',
      { ...default_measurements_younger_child, respiratory_rate: 26 },
      default_assessments_younger_child,
      baseScoresYoungerChild({ 'Respiratory rate': 0 }),
    )

    testCase(
      'younger child, respiratory_rate: 39 (26-39 range) -> score: 0',
      'younger child',
      { ...default_measurements_younger_child, respiratory_rate: 39 },
      default_assessments_younger_child,
      baseScoresYoungerChild({ 'Respiratory rate': 0 }),
    )

    testCase(
      'younger child, respiratory_rate: 40 (boundary, 40-49 range) -> score: 2',
      'younger child',
      { ...default_measurements_younger_child, respiratory_rate: 40 },
      default_assessments_younger_child,
      baseScoresYoungerChild({ 'Respiratory rate': 2 }),
    )

    testCase(
      'younger child, respiratory_rate: 49 (40-49 range) -> score: 2',
      'younger child',
      { ...default_measurements_younger_child, respiratory_rate: 49 },
      default_assessments_younger_child,
      baseScoresYoungerChild({ 'Respiratory rate': 2 }),
    )

    testCase(
      'younger child, respiratory_rate: 50 (boundary, >=50) -> score: 3',
      'younger child',
      { ...default_measurements_younger_child, respiratory_rate: 50 },
      default_assessments_younger_child,
      baseScoresYoungerChild({ 'Respiratory rate': 3 }),
    )

    testCase(
      'younger child, respiratory_rate: 60 (>=50) -> score: 3',
      'younger child',
      { ...default_measurements_younger_child, respiratory_rate: 60 },
      default_assessments_younger_child,
      baseScoresYoungerChild({ 'Respiratory rate': 3 }),
    )

    // =========================================
    // YOUNGER CHILD - HEART RATE (HR)
    // Ranges: <70 -> 3, 70-79 -> 2, 80-130 -> 0, 131-159 -> 2, >=160 -> 3
    // =========================================

    testCase(
      'younger child, heart_rate: 69 (less than 70) -> score: 3',
      'younger child',
      { ...default_measurements_younger_child, heart_rate: 69 },
      default_assessments_younger_child,
      baseScoresYoungerChild({ 'Pulse, function': 3 }),
    )

    testCase(
      'younger child, heart_rate: 70 (boundary, 70-79 range) -> score: 2',
      'younger child',
      { ...default_measurements_younger_child, heart_rate: 70 },
      default_assessments_younger_child,
      baseScoresYoungerChild({ 'Pulse, function': 2 }),
    )

    testCase(
      'younger child, heart_rate: 79 (70-79 range) -> score: 2',
      'younger child',
      { ...default_measurements_younger_child, heart_rate: 79 },
      default_assessments_younger_child,
      baseScoresYoungerChild({ 'Pulse, function': 2 }),
    )

    testCase(
      'younger child, heart_rate: 80 (boundary, 80-130 range) -> score: 0',
      'younger child',
      { ...default_measurements_younger_child, heart_rate: 80 },
      default_assessments_younger_child,
      baseScoresYoungerChild({ 'Pulse, function': 0 }),
    )

    testCase(
      'younger child, heart_rate: 130 (80-130 range) -> score: 0',
      'younger child',
      { ...default_measurements_younger_child, heart_rate: 130 },
      default_assessments_younger_child,
      baseScoresYoungerChild({ 'Pulse, function': 0 }),
    )

    testCase(
      'younger child, heart_rate: 131 (boundary, 131-159 range) -> score: 2',
      'younger child',
      { ...default_measurements_younger_child, heart_rate: 131 },
      default_assessments_younger_child,
      baseScoresYoungerChild({ 'Pulse, function': 2 }),
    )

    testCase(
      'younger child, heart_rate: 159 (131-159 range) -> score: 2',
      'younger child',
      { ...default_measurements_younger_child, heart_rate: 159 },
      default_assessments_younger_child,
      baseScoresYoungerChild({ 'Pulse, function': 2 }),
    )

    testCase(
      'younger child, heart_rate: 160 (boundary, >=160) -> score: 3',
      'younger child',
      { ...default_measurements_younger_child, heart_rate: 160 },
      default_assessments_younger_child,
      baseScoresYoungerChild({ 'Pulse, function': 3 }),
    )

    testCase(
      'younger child, heart_rate: 180 (>=160) -> score: 3',
      'younger child',
      { ...default_measurements_younger_child, heart_rate: 180 },
      default_assessments_younger_child,
      baseScoresYoungerChild({ 'Pulse, function': 3 }),
    )

    // =========================================
    // YOUNGER CHILD - TEMPERATURE
    // Ranges: <35 -> 2, 35-38.4 -> 0, >38.4 -> 2
    // =========================================

    testCase(
      'younger child, temperature: 34 (Cold/Under 35) -> score: 2',
      'younger child',
      { ...default_measurements_younger_child, temperature: 34 },
      default_assessments_younger_child,
      baseScoresYoungerChild({ 'Body temperature': 2 }),
    )

    testCase(
      'younger child, temperature: 35 (boundary, normal range) -> score: 0',
      'younger child',
      { ...default_measurements_younger_child, temperature: 35 },
      default_assessments_younger_child,
      baseScoresYoungerChild({ 'Body temperature': 0 }),
    )

    testCase(
      'younger child, temperature: 37 (normal range) -> score: 0',
      'younger child',
      { ...default_measurements_younger_child, temperature: 37 },
      default_assessments_younger_child,
      baseScoresYoungerChild({ 'Body temperature': 0 }),
    )

    testCase(
      'younger child, temperature: 38.4 (normal range upper) -> score: 0',
      'younger child',
      { ...default_measurements_younger_child, temperature: 38.4 },
      default_assessments_younger_child,
      baseScoresYoungerChild({ 'Body temperature': 0 }),
    )

    testCase(
      'younger child, temperature: 38.5 (boundary, Hot/Over 38.4) -> score: 2',
      'younger child',
      { ...default_measurements_younger_child, temperature: 38.5 },
      default_assessments_younger_child,
      baseScoresYoungerChild({ 'Body temperature': 2 }),
    )

    testCase(
      'younger child, temperature: 40 (Hot/Over 38.4) -> score: 2',
      'younger child',
      { ...default_measurements_younger_child, temperature: 40 },
      default_assessments_younger_child,
      baseScoresYoungerChild({ 'Body temperature': 2 }),
    )

    // =========================================
    // YOUNGER CHILD - CONSCIOUSNESS (AVPU)
    // Alert -> 0, Reacts to voice -> 1, Reacts to pain -> 2, Unresponsive -> 3
    // =========================================

    testCase(
      'younger child, consciousness: Alert -> score: 0',
      'younger child',
      default_measurements_younger_child,
      { ...default_assessments_younger_child, consciousness: 'Alert' },
      baseScoresYoungerChild({
        'Alert Confusion Voice Pain Unresponsive scale score': 0,
      }),
    )

    testCase(
      'younger child, consciousness: Reacts to voice -> score: 1',
      'younger child',
      default_measurements_younger_child,
      {
        ...default_assessments_younger_child,
        consciousness: 'Reacts to voice',
      },
      baseScoresYoungerChild({
        'Alert Confusion Voice Pain Unresponsive scale score': 1,
      }),
    )

    testCase(
      'younger child, consciousness: Reacts to pain -> score: 2',
      'younger child',
      default_measurements_younger_child,
      { ...default_assessments_younger_child, consciousness: 'Reacts to pain' },
      baseScoresYoungerChild({
        'Alert Confusion Voice Pain Unresponsive scale score': 2,
      }),
    )

    testCase(
      'younger child, consciousness: Unresponsive -> score: 3',
      'younger child',
      default_measurements_younger_child,
      { ...default_assessments_younger_child, consciousness: 'Unresponsive' },
      baseScoresYoungerChild({
        'Alert Confusion Voice Pain Unresponsive scale score': 3,
      }),
    )

    // =========================================
    // YOUNGER CHILD - TRAUMA PRESENCE
    // No -> 0, Yes -> 1
    // =========================================

    testCase(
      'younger child, trauma: No -> score: 0',
      'younger child',
      default_measurements_younger_child,
      { ...default_assessments_younger_child, trauma_presence: 'No' },
      baseScoresYoungerChild({ 'Trauma score': 0 }),
    )

    testCase(
      'younger child, trauma: Yes -> score: 1',
      'younger child',
      default_measurements_younger_child,
      { ...default_assessments_younger_child, trauma_presence: 'Yes' },
      baseScoresYoungerChild({ 'Trauma score': 1 }),
    )
  })
})
