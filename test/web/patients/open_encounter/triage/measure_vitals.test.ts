import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { afterAll, before } from 'std/testing/bdd.ts'
import db from '../../../../../db/db.ts'
import waitUntilTestServerUp from '../../../../_helpers/waitUntilTestServerUp.ts'
import { getFormLabels, getFormOptions, getFormValues } from '../../../../_helpers/form.ts'
import { assertMatches } from '../../../../../util/assertMatches.ts'
import {
  asVitalAssessmentFormValues,
  asVitalMeasurementFormValues,
  asWarningSignsAdult,
  dateOfBirth,
  DEFAULT_ASSESSMENTS,
  DEFAULT_MEASUREMENTS,
  heightOf,
  setupTriageNewPatient,
  weightOf,
} from './_setup.ts'
import {
  assessmentOptionSExpression,
  VITAL_MEASUREMENTS_SNOMED_CONCEPTS,
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
import { events } from '../../../../../db/models/events.ts'
import { additional_tasks } from '../../../../../db/models/additional_tasks.ts'
import { MEASUREMENT_FINDING } from '../../../../../shared/snomed_concepts.ts'

describeParallel('triage/measure_vitals', () => {
  before(waitUntilTestServerUp)
  before(async () => {
    await events.initializeAllProcessedPubSub()
  })
  afterAll(() => db.destroy())
  afterAll(() => events.closeAllProcessedPubSub({ graceful: false }))

  describeParallel('GET', () => {
    itParallel(
      'loads a page for the first visit for an adult non-diabetic patient ',
      async () => {
        const { $ } = await setupTriageNewPatient({
          patient_demographics: { date_of_birth: '1990-01-01' },
          warning_signs: asWarningSignsAdult([], { pregnant: false }),
          brief_history: {
            common_conditions: {
              diabetes: { existence: 'No' },
              pregnancy: { existence: 'No' },
            },
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
                  'value': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Mentally alert" "finding"))',
                  'selected': false,
                },
                {
                  'label': 'Reacts to voice',
                  'value': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Impairment of mental alertness" "finding"))',
                  'selected': false,
                },
                {
                  'label': 'Confused',
                  'value': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Clouded consciousness" "finding"))',
                  'selected': false,
                },
                {
                  'label': 'Reacts to pain',
                  'value': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Responds to pain" "finding"))',
                  'selected': false,
                },
                {
                  'label': 'Unresponsive',
                  'value': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Unresponsive" "finding"))',
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
                  'value': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Able to walk" "finding"))',
                  'selected': false,
                },
                {
                  'label': 'Difficulty walking',
                  'value': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Difficulty walking" "finding"))',
                  'selected': false,
                },
                {
                  'label': 'Stretcher/Immobile',
                  'value': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Unable to walk" "finding"))',
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
                  'value': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "No traumatic injury" "situation"))',
                  'selected': false,
                },
                {
                  'label': 'Yes',
                  'value': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Traumatic injury" "disorder"))',
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
          warning_signs: asWarningSignsAdult([], { pregnant: false }),
          brief_history: {
            common_conditions: {
              diabetes: { existence: 'Yes' },
              pregnancy: { existence: 'No' },
            },
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
          warning_signs: asWarningSignsAdult([], { pregnant: false }),
          brief_history: {
            common_conditions: {
              diabetes: { existence: 'No' },
              pregnancy: { existence: 'No' },
            },
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
          warning_signs: asWarningSignsAdult([], { pregnant: false }),
          brief_history: {
            common_conditions: {
              diabetes: { existence: 'Yes' },
              pregnancy: { existence: 'No' },
            },
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
            warning_signs: asWarningSignsAdult([], { pregnant: false }),
            brief_history: {
              common_conditions: {
                diabetes: { existence: 'Yes' },
                pregnancy: { existence: 'No' },
              },
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
          warning_signs: asWarningSignsAdult([], { pregnant: false }),
          brief_history: {
            common_conditions: {
              diabetes: { existence: 'Yes' },
              pregnancy: { existence: 'No' },
            },
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
          s_expression: `(measurement ${VITAL_MEASUREMENTS_SNOMED_CONCEPTS.blood_glucose.s_expression} mmol/L)`,
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
          warning_signs: asWarningSignsAdult([], { pregnant: false }),
          brief_history: {
            common_conditions: {
              diabetes: { existence: 'No' },
              pregnancy: { existence: 'No' },
            },
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

        const measurements = await patient_findings.findAll(
          db,
          {
            patient_id: encounter.patient.id,
            s_expression: `
              (and (finding ${MEASUREMENT_FINDING.s_expression})
                   (not (measurement ${VITAL_MEASUREMENTS_SNOMED_CONCEPTS.height.s_expression} ${VITAL_MEASUREMENTS_UNITS.height}))
                   (not (measurement ${VITAL_MEASUREMENTS_SNOMED_CONCEPTS.weight.s_expression} ${VITAL_MEASUREMENTS_UNITS.weight})))
            `,
          },
        )

        const respiratory_rate_measurement = measurements.find((m) =>
          m.specific_snomed_concept_id ===
            VITAL_MEASUREMENTS_SNOMED_CONCEPTS.respiratory_rate.id
        )!

        assertMatches(respiratory_rate_measurement, {
          'type': 'finding',
          'id': z.string().uuid(),
          'created_at': z.date(),
          'patient_id': z.string().uuid(),
          'patient_encounter_id': z.string().uuid(),
          'patient_encounter_employee_id': z.string().uuid(),
          'root_snomed_concept_id': '118245000',
          'root_snomed_concept_name': 'Measurement finding',
          'root_snomed_concept_category': 'finding',
          'specific_snomed_concept_id': '86290005',
          'specific_snomed_concept_name': 'Respiratory rate',
          'specific_snomed_concept_category': 'observable entity',
          'displays': {
            'finding': 'Respiratory rate',
            'value': `12\u00A0bpm`,
            'full': `Respiratory rate: 12\u00A0bpm`,
          },
          'destination_relations': [],
          // 'source_relations': [],
          'as_part_of_procedure': {
            'id': z.string().uuid(),
            'root_snomed_concept_id': '71388002',
            'root_snomed_concept_name': 'Procedure',
            'root_snomed_concept_category': 'procedure',
            'specific_snomed_concept_id': '410188000',
            'specific_snomed_concept_name': 'Taking patient vital signs assessment',
            'specific_snomed_concept_category': 'procedure',
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
            'id': z.string().uuid(),
            'created_at': z.iso.datetime({ offset: true }),
            'patient_encounter_id': z.string().uuid(),
            'root_snomed_concept_id': '129265001',
            'root_snomed_concept_name': 'Evaluation - action',
            'root_snomed_concept_category': 'qualifier value',
            'specific_snomed_concept_id': '278305009',
            'specific_snomed_concept_name': 'Severity score',
            'specific_snomed_concept_category': 'qualifier value',
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
          async ({ score, evaluates_record_id, specific_snomed_concept_name }) => {
            assert(evaluates_record_id)
            if (specific_snomed_concept_name !== 'Severity score') {
              return {
                finding_name: specific_snomed_concept_name,
                score,
              }
            }
            const finding = await patient_findings.getById(
              db,
              evaluates_record_id,
            )
            return { finding_name: finding.specific_snomed_concept_name, score }
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
      expected_task_groups?: unknown[],
      opts: { only?: boolean; skip?: boolean } = {},
    ) {
      itParallel(description, async () => {
        const { nurse, encounter, patient_encounter_id } = await setupTriageNewPatient({
          patient_demographics: {
            date_of_birth: dateOfBirth(age_determination),
          },
          warning_signs: asWarningSignsAdult([], { pregnant: false }),
          brief_history: {
            common_conditions: {
              diabetes: { existence: 'No' },
              pregnancy: { existence: 'No' },
            },
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

        await events.allProcessedForEncounter(db, { patient_encounter_id, timeout_ms: 33101 })

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
          async ({ score, evaluates_record_id, specific_snomed_concept_name }) => {
            assert(evaluates_record_id)
            if (specific_snomed_concept_name !== 'Severity score') {
              return {
                finding_name: specific_snomed_concept_name,
                score,
              }
            }
            const finding = await patient_findings.getById(
              db,
              evaluates_record_id,
            )
            return {
              finding_name: finding.specific_snomed_concept_name,
              score,
            }
          },
        )

        const sorted_finding_scores = sortBy(finding_scores, 'finding_name')

        assertEquals(sorted_finding_scores, expected_scores)
        assertEquals(total_score.score, sumBy(expected_scores, 'score'))

        if (expected_task_groups) {
          const { task_groups } = await additional_tasks.getTasksGroups(db, { encounter, health_worker_id: nurse.health_worker.id })
          assertMatches(task_groups, expected_task_groups)
        }
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

    // =========================================
    // MOBILITY ASSESSMENT
    // =========================================

    testCase(
      'adult, mobility: Walking -> score: 0',
      'adult',
      DEFAULT_MEASUREMENTS['adult'],
      { ...DEFAULT_ASSESSMENTS['adult'], mobility_assessment: 'Walking' },
      baseScores({ 'Assessment of mobility': 0 }),
    )

    testCase(
      'adult, mobility: Difficulty walking -> score: 1',
      'adult',
      DEFAULT_MEASUREMENTS['adult'],
      {
        ...DEFAULT_ASSESSMENTS['adult'],
        mobility_assessment: 'Difficulty walking',
      },
      baseScores({ 'Assessment of mobility': 1 }),
    )

    testCase(
      'adult, mobility: Stretcher/Immobile -> score: 2',
      'adult',
      DEFAULT_MEASUREMENTS['adult'],
      {
        ...DEFAULT_ASSESSMENTS['adult'],
        mobility_assessment: 'Stretcher/Immobile',
      },
      baseScores({ 'Assessment of mobility': 2 }),
    )

    // =========================================
    // RESPIRATORY RATE (RR)
    // Ranges: <9 -> 2, 9-14 -> 0, 15-20 -> 1, 21-29 -> 2, >=30 -> 3
    // =========================================

    testCase(
      'adult, respiratory_rate: 8 (less than 9) -> score: 2',
      'adult',
      { ...DEFAULT_MEASUREMENTS['adult'], respiratory_rate: 8 },
      DEFAULT_ASSESSMENTS['adult'],
      baseScores({ 'Respiratory rate': 2 }),
      [
        {
          'due_to': [
            {
              'root_snomed_concept_name': 'Measurement finding',
              'specific_snomed_concept_name': 'Respiratory rate',
              'value': { 'type': 'measurement', 'value': '8', 'units': 'bpm' },
              'evaluations': [
                {
                  'root_snomed_concept_id': '129265001',
                  'root_snomed_concept_name': 'Evaluation - action',
                  'root_snomed_concept_category': 'qualifier value',
                  'specific_snomed_concept_id': '278305009',
                  'specific_snomed_concept_name': 'Severity score',
                  'specific_snomed_concept_category': 'qualifier value',
                  'value': { 'type': 'score', 'score': '2' },
                  'displays': { 'finding': 'Severity score', 'value': '2', 'full': 'Severity score: 2' },
                },
              ],
            },
          ],
          'tasks': [
            {
              atom: 'measurement',
              snomed_concept: {
                atom: 'snomed_concept',
                name: 'Hemoglobin saturation with oxygen',
                category: 'observable entity',
              },
              units: '%',
              s_expression: '(measurement (snomed_concept "Hemoglobin saturation with oxygen" "observable entity") %)',
              displays: {
                value: null,
                finding: 'Hemoglobin saturation with oxygen',
                full: 'Hemoglobin saturation with oxygen',
              },
              existing_measurement: null,
            },
          ],
        },
      ],
    )

    testCase(
      'adult, respiratory_rate: 9 (boundary, 9-14 range) -> score: 0',
      'adult',
      { ...DEFAULT_MEASUREMENTS['adult'], respiratory_rate: 9 },
      DEFAULT_ASSESSMENTS['adult'],
      baseScores({ 'Respiratory rate': 0 }),
      [],
    )

    testCase(
      'adult, respiratory_rate: 14 (9-14 range) -> score: 0',
      'adult',
      { ...DEFAULT_MEASUREMENTS['adult'], respiratory_rate: 14 },
      DEFAULT_ASSESSMENTS['adult'],
      baseScores({ 'Respiratory rate': 0 }),
    )

    testCase(
      'adult, respiratory_rate: 15 (boundary, 15-20 range) -> score: 1',
      'adult',
      { ...DEFAULT_MEASUREMENTS['adult'], respiratory_rate: 15 },
      DEFAULT_ASSESSMENTS['adult'],
      baseScores({ 'Respiratory rate': 1 }),
    )

    testCase(
      'adult, respiratory_rate: 20 (15-20 range) -> score: 1',
      'adult',
      { ...DEFAULT_MEASUREMENTS['adult'], respiratory_rate: 20 },
      DEFAULT_ASSESSMENTS['adult'],
      baseScores({ 'Respiratory rate': 1 }),
    )

    testCase(
      'adult, respiratory_rate: 21 (boundary, 21-29 range) -> score: 2',
      'adult',
      { ...DEFAULT_MEASUREMENTS['adult'], respiratory_rate: 21 },
      DEFAULT_ASSESSMENTS['adult'],
      baseScores({ 'Respiratory rate': 2 }),
    )

    testCase(
      'adult, respiratory_rate: 29 (21-29 range) -> score: 2',
      'adult',
      { ...DEFAULT_MEASUREMENTS['adult'], respiratory_rate: 29 },
      DEFAULT_ASSESSMENTS['adult'],
      baseScores({ 'Respiratory rate': 2 }),
    )

    testCase(
      'adult, respiratory_rate: 30 (boundary, >=30) -> score: 3',
      'adult',
      { ...DEFAULT_MEASUREMENTS['adult'], respiratory_rate: 30 },
      DEFAULT_ASSESSMENTS['adult'],
      baseScores({ 'Respiratory rate': 3 }),
    )

    testCase(
      'adult, respiratory_rate: 35 (>=30) -> score: 3',
      'adult',
      { ...DEFAULT_MEASUREMENTS['adult'], respiratory_rate: 35 },
      DEFAULT_ASSESSMENTS['adult'],
      baseScores({ 'Respiratory rate': 3 }),
    )

    // =========================================
    // HEART RATE (HR)
    // Ranges: <41 -> 3, 41-50 -> 1, 51-100 -> 0, 101-110 -> 1, 111-129 -> 2, >=130 -> 3
    // =========================================

    testCase(
      'adult, heart_rate: 40 (less than 41) -> score: 2',
      'adult',
      { ...DEFAULT_MEASUREMENTS['adult'], heart_rate: 40 },
      DEFAULT_ASSESSMENTS['adult'],
      baseScores({ 'Pulse, function': 2 }),
    )

    testCase(
      'adult, heart_rate: 41 (boundary, 41-50 range) -> score: 1',
      'adult',
      { ...DEFAULT_MEASUREMENTS['adult'], heart_rate: 41 },
      DEFAULT_ASSESSMENTS['adult'],
      baseScores({ 'Pulse, function': 1 }),
    )

    testCase(
      'adult, heart_rate: 50 (41-50 range) -> score: 1',
      'adult',
      { ...DEFAULT_MEASUREMENTS['adult'], heart_rate: 50 },
      DEFAULT_ASSESSMENTS['adult'],
      baseScores({ 'Pulse, function': 1 }),
    )

    testCase(
      'adult, heart_rate: 51 (boundary, 51-100 range) -> score: 0',
      'adult',
      { ...DEFAULT_MEASUREMENTS['adult'], heart_rate: 51 },
      DEFAULT_ASSESSMENTS['adult'],
      baseScores({ 'Pulse, function': 0 }),
    )

    testCase(
      'adult, heart_rate: 100 (51-100 range) -> score: 0',
      'adult',
      { ...DEFAULT_MEASUREMENTS['adult'], heart_rate: 100 },
      DEFAULT_ASSESSMENTS['adult'],
      baseScores({ 'Pulse, function': 0 }),
    )

    testCase(
      'adult, heart_rate: 101 (boundary, 101-110 range) -> score: 1',
      'adult',
      { ...DEFAULT_MEASUREMENTS['adult'], heart_rate: 101 },
      DEFAULT_ASSESSMENTS['adult'],
      baseScores({ 'Pulse, function': 1 }),
    )

    testCase(
      'adult, heart_rate: 110 (101-110 range) -> score: 1',
      'adult',
      { ...DEFAULT_MEASUREMENTS['adult'], heart_rate: 110 },
      DEFAULT_ASSESSMENTS['adult'],
      baseScores({ 'Pulse, function': 1 }),
    )

    testCase(
      'adult, heart_rate: 111 (boundary, 111-129 range) -> score: 2',
      'adult',
      { ...DEFAULT_MEASUREMENTS['adult'], heart_rate: 111 },
      DEFAULT_ASSESSMENTS['adult'],
      baseScores({ 'Pulse, function': 2 }),
    )

    testCase(
      'adult, heart_rate: 129 (111-129 range) -> score: 2',
      'adult',
      { ...DEFAULT_MEASUREMENTS['adult'], heart_rate: 129 },
      DEFAULT_ASSESSMENTS['adult'],
      baseScores({ 'Pulse, function': 2 }),
    )

    testCase(
      'adult, heart_rate: 130 (boundary, >=130) -> score: 3',
      'adult',
      { ...DEFAULT_MEASUREMENTS['adult'], heart_rate: 130 },
      DEFAULT_ASSESSMENTS['adult'],
      baseScores({ 'Pulse, function': 3 }),
    )

    testCase(
      'adult, heart_rate: 150 (>=130) -> score: 3',
      'adult',
      { ...DEFAULT_MEASUREMENTS['adult'], heart_rate: 150 },
      DEFAULT_ASSESSMENTS['adult'],
      baseScores({ 'Pulse, function': 3 }),
    )

    // =========================================
    // SYSTOLIC BLOOD PRESSURE (SBP)
    // Ranges: <71 -> 3, 71-80 -> 2, 81-100 -> 1, 101-199 -> 0, >=200 -> 2
    // =========================================

    testCase(
      'adult, blood_pressure_systolic: 70 (less than 71) -> score: 3',
      'adult',
      { ...DEFAULT_MEASUREMENTS['adult'], blood_pressure_systolic: 70 },
      DEFAULT_ASSESSMENTS['adult'],
      baseScores({ 'Systolic blood pressure': 3 }),
    )

    testCase(
      'adult, blood_pressure_systolic: 71 (boundary, 71-80 range) -> score: 2',
      'adult',
      { ...DEFAULT_MEASUREMENTS['adult'], blood_pressure_systolic: 71 },
      DEFAULT_ASSESSMENTS['adult'],
      baseScores({ 'Systolic blood pressure': 2 }),
    )

    testCase(
      'adult, blood_pressure_systolic: 80 (71-80 range) -> score: 2',
      'adult',
      { ...DEFAULT_MEASUREMENTS['adult'], blood_pressure_systolic: 80 },
      DEFAULT_ASSESSMENTS['adult'],
      baseScores({ 'Systolic blood pressure': 2 }),
    )

    testCase(
      'adult, blood_pressure_systolic: 81 (boundary, 81-100 range) -> score: 1',
      'adult',
      { ...DEFAULT_MEASUREMENTS['adult'], blood_pressure_systolic: 81 },
      DEFAULT_ASSESSMENTS['adult'],
      baseScores({ 'Systolic blood pressure': 1 }),
    )

    testCase(
      'adult, blood_pressure_systolic: 100 (81-100 range) -> score: 1',
      'adult',
      { ...DEFAULT_MEASUREMENTS['adult'], blood_pressure_systolic: 100 },
      DEFAULT_ASSESSMENTS['adult'],
      baseScores({ 'Systolic blood pressure': 1 }),
    )

    testCase(
      'adult, blood_pressure_systolic: 101 (boundary, 101-199 range) -> score: 0',
      'adult',
      { ...DEFAULT_MEASUREMENTS['adult'], blood_pressure_systolic: 101 },
      DEFAULT_ASSESSMENTS['adult'],
      baseScores({ 'Systolic blood pressure': 0 }),
    )

    testCase(
      'adult, blood_pressure_systolic: 199 (101-199 range) -> score: 0',
      'adult',
      { ...DEFAULT_MEASUREMENTS['adult'], blood_pressure_systolic: 199 },
      DEFAULT_ASSESSMENTS['adult'],
      baseScores({ 'Systolic blood pressure': 0 }),
    )

    testCase(
      'adult, blood_pressure_systolic: 200 (boundary, >=200) -> score: 2',
      'adult',
      { ...DEFAULT_MEASUREMENTS['adult'], blood_pressure_systolic: 200 },
      DEFAULT_ASSESSMENTS['adult'],
      baseScores({ 'Systolic blood pressure': 2 }),
    )

    testCase(
      'adult, blood_pressure_systolic: 220 (>=200) -> score: 2',
      'adult',
      { ...DEFAULT_MEASUREMENTS['adult'], blood_pressure_systolic: 220 },
      DEFAULT_ASSESSMENTS['adult'],
      baseScores({ 'Systolic blood pressure': 2 }),
    )

    // =========================================
    // TEMPERATURE
    // Ranges: <35 -> 2, 35-38.4 -> 0, >38.4 -> 2
    // =========================================

    testCase(
      'adult, temperature: 34 (Cold/Under 35) -> score: 2',
      'adult',
      { ...DEFAULT_MEASUREMENTS['adult'], temperature: 34 },
      DEFAULT_ASSESSMENTS['adult'],
      baseScores({ 'Body temperature': 2 }),
    )

    testCase(
      'adult, temperature: 35 (boundary, normal range) -> score: 0',
      'adult',
      { ...DEFAULT_MEASUREMENTS['adult'], temperature: 35 },
      DEFAULT_ASSESSMENTS['adult'],
      baseScores({ 'Body temperature': 0 }),
    )

    testCase(
      'adult, temperature: 37 (normal range) -> score: 0',
      'adult',
      { ...DEFAULT_MEASUREMENTS['adult'], temperature: 37 },
      DEFAULT_ASSESSMENTS['adult'],
      baseScores({ 'Body temperature': 0 }),
    )

    testCase(
      'adult, temperature: 38.4 (normal range upper) -> score: 0',
      'adult',
      { ...DEFAULT_MEASUREMENTS['adult'], temperature: 38.4 },
      DEFAULT_ASSESSMENTS['adult'],
      baseScores({ 'Body temperature': 0 }),
    )

    testCase(
      'adult, temperature: 38.5 (boundary, Hot/Over 38.4) -> score: 2',
      'adult',
      { ...DEFAULT_MEASUREMENTS['adult'], temperature: 38.5 },
      DEFAULT_ASSESSMENTS['adult'],
      baseScores({ 'Body temperature': 2 }),
    )

    testCase(
      'adult, temperature: 40 (Hot/Over 38.4) -> score: 2',
      'adult',
      { ...DEFAULT_MEASUREMENTS['adult'], temperature: 40 },
      DEFAULT_ASSESSMENTS['adult'],
      baseScores({ 'Body temperature': 2 }),
    )

    // =========================================
    // CONSCIOUSNESS (AVPU)
    // Alert -> 0, Reacts to voice -> 1, Confused -> 2, Reacts to pain -> 2, Unresponsive -> 3
    // =========================================

    testCase(
      'adult, consciousness: Alert -> score: 0',
      'adult',
      DEFAULT_MEASUREMENTS['adult'],
      { ...DEFAULT_ASSESSMENTS['adult'], consciousness: 'Alert' },
      baseScores({ 'Alert Confusion Voice Pain Unresponsive scale score': 0 }),
    )

    testCase(
      'adult, consciousness: Reacts to voice -> score: 1',
      'adult',
      DEFAULT_MEASUREMENTS['adult'],
      { ...DEFAULT_ASSESSMENTS['adult'], consciousness: 'Reacts to voice' },
      baseScores({ 'Alert Confusion Voice Pain Unresponsive scale score': 1 }),
    )

    testCase(
      'adult, consciousness: Confused -> score: 2',
      'adult',
      DEFAULT_MEASUREMENTS['adult'],
      { ...DEFAULT_ASSESSMENTS['adult'], consciousness: 'Confused' },
      baseScores({ 'Alert Confusion Voice Pain Unresponsive scale score': 2 }),
    )

    testCase(
      'adult, consciousness: Reacts to pain -> score: 2',
      'adult',
      DEFAULT_MEASUREMENTS['adult'],
      { ...DEFAULT_ASSESSMENTS['adult'], consciousness: 'Reacts to pain' },
      baseScores({ 'Alert Confusion Voice Pain Unresponsive scale score': 2 }),
    )

    testCase(
      'adult, consciousness: Unresponsive -> score: 3',
      'adult',
      DEFAULT_MEASUREMENTS['adult'],
      { ...DEFAULT_ASSESSMENTS['adult'], consciousness: 'Unresponsive' },
      baseScores({ 'Alert Confusion Voice Pain Unresponsive scale score': 3 }),
    )

    // =========================================
    // TRAUMA PRESENCE
    // No -> 0, Yes -> 1
    // =========================================

    testCase(
      'adult, trauma: No -> score: 0',
      'adult',
      DEFAULT_MEASUREMENTS['adult'],
      { ...DEFAULT_ASSESSMENTS['adult'], trauma_presence: 'No' },
      baseScores({ 'Trauma score': 0 }),
    )

    testCase(
      'adult, trauma: Yes -> score: 1',
      'adult',
      DEFAULT_MEASUREMENTS['adult'],
      { ...DEFAULT_ASSESSMENTS['adult'], trauma_presence: 'Yes' },
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

    // =========================================
    // OLDER CHILD - MOBILITY ASSESSMENT
    // Normal for age -> 0, Unable to walk as normal -> 2
    // =========================================

    testCase(
      'older child, mobility: Unable to walk as normal -> score: 2',
      'older child',
      DEFAULT_MEASUREMENTS['older child'],
      {
        ...DEFAULT_ASSESSMENTS['older child'],
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
      { ...DEFAULT_MEASUREMENTS['older child'], respiratory_rate: 14 },
      DEFAULT_ASSESSMENTS['older child'],
      baseScoresOlderChild({ 'Respiratory rate': 3 }),
    )

    testCase(
      'older child, respiratory_rate: 15 (boundary, 15-16 range) -> score: 2',
      'older child',
      { ...DEFAULT_MEASUREMENTS['older child'], respiratory_rate: 15 },
      DEFAULT_ASSESSMENTS['older child'],
      baseScoresOlderChild({ 'Respiratory rate': 2 }),
    )

    testCase(
      'older child, respiratory_rate: 16 (15-16 range) -> score: 2',
      'older child',
      { ...DEFAULT_MEASUREMENTS['older child'], respiratory_rate: 16 },
      DEFAULT_ASSESSMENTS['older child'],
      baseScoresOlderChild({ 'Respiratory rate': 2 }),
    )

    testCase(
      'older child, respiratory_rate: 17 (boundary, 17-21 range) -> score: 0',
      'older child',
      { ...DEFAULT_MEASUREMENTS['older child'], respiratory_rate: 17 },
      DEFAULT_ASSESSMENTS['older child'],
      baseScoresOlderChild({ 'Respiratory rate': 0 }),
    )

    testCase(
      'older child, respiratory_rate: 21 (17-21 range) -> score: 0',
      'older child',
      { ...DEFAULT_MEASUREMENTS['older child'], respiratory_rate: 21 },
      DEFAULT_ASSESSMENTS['older child'],
      baseScoresOlderChild({ 'Respiratory rate': 0 }),
    )

    testCase(
      'older child, respiratory_rate: 22 (boundary, 22-26 range) -> score: 1',
      'older child',
      { ...DEFAULT_MEASUREMENTS['older child'], respiratory_rate: 22 },
      DEFAULT_ASSESSMENTS['older child'],
      baseScoresOlderChild({ 'Respiratory rate': 1 }),
    )

    testCase(
      'older child, respiratory_rate: 26 (22-26 range) -> score: 1',
      'older child',
      { ...DEFAULT_MEASUREMENTS['older child'], respiratory_rate: 26 },
      DEFAULT_ASSESSMENTS['older child'],
      baseScoresOlderChild({ 'Respiratory rate': 1 }),
    )

    testCase(
      'older child, respiratory_rate: 27 (boundary, >=27) -> score: 2',
      'older child',
      { ...DEFAULT_MEASUREMENTS['older child'], respiratory_rate: 27 },
      DEFAULT_ASSESSMENTS['older child'],
      baseScoresOlderChild({ 'Respiratory rate': 2 }),
    )

    testCase(
      'older child, respiratory_rate: 35 (>=27) -> score: 2',
      'older child',
      { ...DEFAULT_MEASUREMENTS['older child'], respiratory_rate: 35 },
      DEFAULT_ASSESSMENTS['older child'],
      baseScoresOlderChild({ 'Respiratory rate': 2 }),
    )

    // =========================================
    // OLDER CHILD - HEART RATE (HR)
    // Ranges: <60 -> 3, 60-79 -> 2, 80-99 -> 0, 100-129 -> 1, >=130 -> 2
    // =========================================

    testCase(
      'older child, heart_rate: 59 (less than 60) -> score: 3',
      'older child',
      { ...DEFAULT_MEASUREMENTS['older child'], heart_rate: 59 },
      DEFAULT_ASSESSMENTS['older child'],
      baseScoresOlderChild({ 'Pulse, function': 3 }),
    )

    testCase(
      'older child, heart_rate: 60 (boundary, 60-79 range) -> score: 2',
      'older child',
      { ...DEFAULT_MEASUREMENTS['older child'], heart_rate: 60 },
      DEFAULT_ASSESSMENTS['older child'],
      baseScoresOlderChild({ 'Pulse, function': 2 }),
    )

    testCase(
      'older child, heart_rate: 79 (60-79 range) -> score: 2',
      'older child',
      { ...DEFAULT_MEASUREMENTS['older child'], heart_rate: 79 },
      DEFAULT_ASSESSMENTS['older child'],
      baseScoresOlderChild({ 'Pulse, function': 2 }),
    )

    testCase(
      'older child, heart_rate: 80 (boundary, 80-99 range) -> score: 0',
      'older child',
      { ...DEFAULT_MEASUREMENTS['older child'], heart_rate: 80 },
      DEFAULT_ASSESSMENTS['older child'],
      baseScoresOlderChild({ 'Pulse, function': 0 }),
    )

    testCase(
      'older child, heart_rate: 99 (80-99 range) -> score: 0',
      'older child',
      { ...DEFAULT_MEASUREMENTS['older child'], heart_rate: 99 },
      DEFAULT_ASSESSMENTS['older child'],
      baseScoresOlderChild({ 'Pulse, function': 0 }),
    )

    testCase(
      'older child, heart_rate: 100 (boundary, 100-129 range) -> score: 1',
      'older child',
      { ...DEFAULT_MEASUREMENTS['older child'], heart_rate: 100 },
      DEFAULT_ASSESSMENTS['older child'],
      baseScoresOlderChild({ 'Pulse, function': 1 }),
    )

    testCase(
      'older child, heart_rate: 129 (100-129 range) -> score: 1',
      'older child',
      { ...DEFAULT_MEASUREMENTS['older child'], heart_rate: 129 },
      DEFAULT_ASSESSMENTS['older child'],
      baseScoresOlderChild({ 'Pulse, function': 1 }),
    )

    testCase(
      'older child, heart_rate: 130 (boundary, >=130) -> score: 2',
      'older child',
      { ...DEFAULT_MEASUREMENTS['older child'], heart_rate: 130 },
      DEFAULT_ASSESSMENTS['older child'],
      baseScoresOlderChild({ 'Pulse, function': 2 }),
    )

    testCase(
      'older child, heart_rate: 150 (>=130) -> score: 2',
      'older child',
      { ...DEFAULT_MEASUREMENTS['older child'], heart_rate: 150 },
      DEFAULT_ASSESSMENTS['older child'],
      baseScoresOlderChild({ 'Pulse, function': 2 }),
    )

    // =========================================
    // OLDER CHILD - TEMPERATURE
    // Ranges: <35 -> 2, 35-38.4 -> 0, >38.4 -> 2
    // =========================================

    testCase(
      'older child, temperature: 34 (Cold/Under 35) -> score: 2',
      'older child',
      { ...DEFAULT_MEASUREMENTS['older child'], temperature: 34 },
      DEFAULT_ASSESSMENTS['older child'],
      baseScoresOlderChild({ 'Body temperature': 2 }),
    )

    testCase(
      'older child, temperature: 35 (boundary, normal range) -> score: 0',
      'older child',
      { ...DEFAULT_MEASUREMENTS['older child'], temperature: 35 },
      DEFAULT_ASSESSMENTS['older child'],
      baseScoresOlderChild({ 'Body temperature': 0 }),
    )

    testCase(
      'older child, temperature: 37 (normal range) -> score: 0',
      'older child',
      { ...DEFAULT_MEASUREMENTS['older child'], temperature: 37 },
      DEFAULT_ASSESSMENTS['older child'],
      baseScoresOlderChild({ 'Body temperature': 0 }),
    )

    testCase(
      'older child, temperature: 38.4 (normal range upper) -> score: 0',
      'older child',
      { ...DEFAULT_MEASUREMENTS['older child'], temperature: 38.4 },
      DEFAULT_ASSESSMENTS['older child'],
      baseScoresOlderChild({ 'Body temperature': 0 }),
    )

    testCase(
      'older child, temperature: 38.5 (boundary, Hot/Over 38.4) -> score: 2',
      'older child',
      { ...DEFAULT_MEASUREMENTS['older child'], temperature: 38.5 },
      DEFAULT_ASSESSMENTS['older child'],
      baseScoresOlderChild({ 'Body temperature': 2 }),
    )

    testCase(
      'older child, temperature: 40 (Hot/Over 38.4) -> score: 2',
      'older child',
      { ...DEFAULT_MEASUREMENTS['older child'], temperature: 40 },
      DEFAULT_ASSESSMENTS['older child'],
      baseScoresOlderChild({ 'Body temperature': 2 }),
    )

    // =========================================
    // OLDER CHILD - CONSCIOUSNESS (AVPU)
    // Alert -> 0, Reacts to voice -> 1, Confused -> 2, Reacts to pain -> 2, Unresponsive -> 3
    // =========================================

    testCase(
      'older child, consciousness: Alert -> score: 0',
      'older child',
      DEFAULT_MEASUREMENTS['older child'],
      { ...DEFAULT_ASSESSMENTS['older child'], consciousness: 'Alert' },
      baseScoresOlderChild({
        'Alert Confusion Voice Pain Unresponsive scale score': 0,
      }),
    )

    testCase(
      'older child, consciousness: Reacts to voice -> score: 1',
      'older child',
      DEFAULT_MEASUREMENTS['older child'],
      { ...DEFAULT_ASSESSMENTS['older child'], consciousness: 'Reacts to voice' },
      baseScoresOlderChild({
        'Alert Confusion Voice Pain Unresponsive scale score': 1,
      }),
    )

    testCase(
      'older child, consciousness: Confused -> score: 2',
      'older child',
      DEFAULT_MEASUREMENTS['older child'],
      { ...DEFAULT_ASSESSMENTS['older child'], consciousness: 'Confused' },
      baseScoresOlderChild({
        'Alert Confusion Voice Pain Unresponsive scale score': 2,
      }),
    )

    testCase(
      'older child, consciousness: Reacts to pain -> score: 2',
      'older child',
      DEFAULT_MEASUREMENTS['older child'],
      { ...DEFAULT_ASSESSMENTS['older child'], consciousness: 'Reacts to pain' },
      baseScoresOlderChild({
        'Alert Confusion Voice Pain Unresponsive scale score': 2,
      }),
    )

    testCase(
      'older child, consciousness: Unresponsive -> score: 3',
      'older child',
      DEFAULT_MEASUREMENTS['older child'],
      { ...DEFAULT_ASSESSMENTS['older child'], consciousness: 'Unresponsive' },
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
      DEFAULT_MEASUREMENTS['older child'],
      { ...DEFAULT_ASSESSMENTS['older child'], trauma_presence: 'No' },
      baseScoresOlderChild({ 'Trauma score': 0 }),
    )

    testCase(
      'older child, trauma: Yes -> score: 1',
      'older child',
      DEFAULT_MEASUREMENTS['older child'],
      { ...DEFAULT_ASSESSMENTS['older child'], trauma_presence: 'Yes' },
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

    // =========================================
    // YOUNGER CHILD - MOBILITY ASSESSMENT
    // Normal for age -> 0, Unable to move as normal -> 2
    // =========================================

    testCase(
      'younger child, mobility: Normal for age -> score: 0',
      'younger child',
      DEFAULT_MEASUREMENTS['younger child'],
      {
        ...DEFAULT_ASSESSMENTS['younger child'],
        mobility_assessment: 'Normal for age',
      },
      baseScoresYoungerChild({ 'Assessment of mobility': 0 }),
    )

    testCase(
      'younger child, mobility: Unable to move as normal -> score: 2',
      'younger child',
      DEFAULT_MEASUREMENTS['younger child'],
      {
        ...DEFAULT_ASSESSMENTS['younger child'],
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
      { ...DEFAULT_MEASUREMENTS['younger child'], respiratory_rate: 19 },
      DEFAULT_ASSESSMENTS['younger child'],
      baseScoresYoungerChild({ 'Respiratory rate': 3 }),
    )

    testCase(
      'younger child, respiratory_rate: 20 (boundary, 20-25 range) -> score: 2',
      'younger child',
      { ...DEFAULT_MEASUREMENTS['younger child'], respiratory_rate: 20 },
      DEFAULT_ASSESSMENTS['younger child'],
      baseScoresYoungerChild({ 'Respiratory rate': 2 }),
    )

    testCase(
      'younger child, respiratory_rate: 25 (20-25 range) -> score: 2',
      'younger child',
      { ...DEFAULT_MEASUREMENTS['younger child'], respiratory_rate: 25 },
      DEFAULT_ASSESSMENTS['younger child'],
      baseScoresYoungerChild({ 'Respiratory rate': 2 }),
    )

    testCase(
      'younger child, respiratory_rate: 26 (boundary, 26-39 range) -> score: 0',
      'younger child',
      { ...DEFAULT_MEASUREMENTS['younger child'], respiratory_rate: 26 },
      DEFAULT_ASSESSMENTS['younger child'],
      baseScoresYoungerChild({ 'Respiratory rate': 0 }),
    )

    testCase(
      'younger child, respiratory_rate: 39 (26-39 range) -> score: 0',
      'younger child',
      { ...DEFAULT_MEASUREMENTS['younger child'], respiratory_rate: 39 },
      DEFAULT_ASSESSMENTS['younger child'],
      baseScoresYoungerChild({ 'Respiratory rate': 0 }),
    )

    testCase(
      'younger child, respiratory_rate: 40 (boundary, 40-49 range) -> score: 2',
      'younger child',
      { ...DEFAULT_MEASUREMENTS['younger child'], respiratory_rate: 40 },
      DEFAULT_ASSESSMENTS['younger child'],
      baseScoresYoungerChild({ 'Respiratory rate': 2 }),
    )

    testCase(
      'younger child, respiratory_rate: 49 (40-49 range) -> score: 2',
      'younger child',
      { ...DEFAULT_MEASUREMENTS['younger child'], respiratory_rate: 49 },
      DEFAULT_ASSESSMENTS['younger child'],
      baseScoresYoungerChild({ 'Respiratory rate': 2 }),
    )

    testCase(
      'younger child, respiratory_rate: 50 (boundary, >=50) -> score: 3',
      'younger child',
      { ...DEFAULT_MEASUREMENTS['younger child'], respiratory_rate: 50 },
      DEFAULT_ASSESSMENTS['younger child'],
      baseScoresYoungerChild({ 'Respiratory rate': 3 }),
    )

    testCase(
      'younger child, respiratory_rate: 60 (>=50) -> score: 3',
      'younger child',
      { ...DEFAULT_MEASUREMENTS['younger child'], respiratory_rate: 60 },
      DEFAULT_ASSESSMENTS['younger child'],
      baseScoresYoungerChild({ 'Respiratory rate': 3 }),
    )

    // =========================================
    // YOUNGER CHILD - HEART RATE (HR)
    // Ranges: <70 -> 3, 70-79 -> 2, 80-130 -> 0, 131-159 -> 2, >=160 -> 3
    // =========================================

    testCase(
      'younger child, heart_rate: 69 (less than 70) -> score: 3',
      'younger child',
      { ...DEFAULT_MEASUREMENTS['younger child'], heart_rate: 69 },
      DEFAULT_ASSESSMENTS['younger child'],
      baseScoresYoungerChild({ 'Pulse, function': 3 }),
    )

    testCase(
      'younger child, heart_rate: 70 (boundary, 70-79 range) -> score: 2',
      'younger child',
      { ...DEFAULT_MEASUREMENTS['younger child'], heart_rate: 70 },
      DEFAULT_ASSESSMENTS['younger child'],
      baseScoresYoungerChild({ 'Pulse, function': 2 }),
    )

    testCase(
      'younger child, heart_rate: 79 (70-79 range) -> score: 2',
      'younger child',
      { ...DEFAULT_MEASUREMENTS['younger child'], heart_rate: 79 },
      DEFAULT_ASSESSMENTS['younger child'],
      baseScoresYoungerChild({ 'Pulse, function': 2 }),
    )

    testCase(
      'younger child, heart_rate: 80 (boundary, 80-130 range) -> score: 0',
      'younger child',
      { ...DEFAULT_MEASUREMENTS['younger child'], heart_rate: 80 },
      DEFAULT_ASSESSMENTS['younger child'],
      baseScoresYoungerChild({ 'Pulse, function': 0 }),
    )

    testCase(
      'younger child, heart_rate: 130 (80-130 range) -> score: 0',
      'younger child',
      { ...DEFAULT_MEASUREMENTS['younger child'], heart_rate: 130 },
      DEFAULT_ASSESSMENTS['younger child'],
      baseScoresYoungerChild({ 'Pulse, function': 0 }),
    )

    testCase(
      'younger child, heart_rate: 131 (boundary, 131-159 range) -> score: 2',
      'younger child',
      { ...DEFAULT_MEASUREMENTS['younger child'], heart_rate: 131 },
      DEFAULT_ASSESSMENTS['younger child'],
      baseScoresYoungerChild({ 'Pulse, function': 2 }),
    )

    testCase(
      'younger child, heart_rate: 159 (131-159 range) -> score: 2',
      'younger child',
      { ...DEFAULT_MEASUREMENTS['younger child'], heart_rate: 159 },
      DEFAULT_ASSESSMENTS['younger child'],
      baseScoresYoungerChild({ 'Pulse, function': 2 }),
    )

    testCase(
      'younger child, heart_rate: 160 (boundary, >=160) -> score: 3',
      'younger child',
      { ...DEFAULT_MEASUREMENTS['younger child'], heart_rate: 160 },
      DEFAULT_ASSESSMENTS['younger child'],
      baseScoresYoungerChild({ 'Pulse, function': 3 }),
    )

    testCase(
      'younger child, heart_rate: 180 (>=160) -> score: 3',
      'younger child',
      { ...DEFAULT_MEASUREMENTS['younger child'], heart_rate: 180 },
      DEFAULT_ASSESSMENTS['younger child'],
      baseScoresYoungerChild({ 'Pulse, function': 3 }),
    )

    // =========================================
    // YOUNGER CHILD - TEMPERATURE
    // Ranges: <35 -> 2, 35-38.4 -> 0, >38.4 -> 2
    // =========================================

    testCase(
      'younger child, temperature: 34 (Cold/Under 35) -> score: 2',
      'younger child',
      { ...DEFAULT_MEASUREMENTS['younger child'], temperature: 34 },
      DEFAULT_ASSESSMENTS['younger child'],
      baseScoresYoungerChild({ 'Body temperature': 2 }),
    )

    testCase(
      'younger child, temperature: 35 (boundary, normal range) -> score: 0',
      'younger child',
      { ...DEFAULT_MEASUREMENTS['younger child'], temperature: 35 },
      DEFAULT_ASSESSMENTS['younger child'],
      baseScoresYoungerChild({ 'Body temperature': 0 }),
    )

    testCase(
      'younger child, temperature: 37 (normal range) -> score: 0',
      'younger child',
      { ...DEFAULT_MEASUREMENTS['younger child'], temperature: 37 },
      DEFAULT_ASSESSMENTS['younger child'],
      baseScoresYoungerChild({ 'Body temperature': 0 }),
    )

    testCase(
      'younger child, temperature: 38.4 (normal range upper) -> score: 0',
      'younger child',
      { ...DEFAULT_MEASUREMENTS['younger child'], temperature: 38.4 },
      DEFAULT_ASSESSMENTS['younger child'],
      baseScoresYoungerChild({ 'Body temperature': 0 }),
    )

    testCase(
      'younger child, temperature: 38.5 (boundary, Hot/Over 38.4) -> score: 2',
      'younger child',
      { ...DEFAULT_MEASUREMENTS['younger child'], temperature: 38.5 },
      DEFAULT_ASSESSMENTS['younger child'],
      baseScoresYoungerChild({ 'Body temperature': 2 }),
    )

    testCase(
      'younger child, temperature: 40 (Hot/Over 38.4) -> score: 2',
      'younger child',
      { ...DEFAULT_MEASUREMENTS['younger child'], temperature: 40 },
      DEFAULT_ASSESSMENTS['younger child'],
      baseScoresYoungerChild({ 'Body temperature': 2 }),
    )

    // =========================================
    // YOUNGER CHILD - CONSCIOUSNESS (AVPU)
    // Alert -> 0, Reacts to voice -> 1, Reacts to pain -> 2, Unresponsive -> 3
    // =========================================

    testCase(
      'younger child, consciousness: Alert -> score: 0',
      'younger child',
      DEFAULT_MEASUREMENTS['younger child'],
      { ...DEFAULT_ASSESSMENTS['younger child'], consciousness: 'Alert' },
      baseScoresYoungerChild({
        'Alert Confusion Voice Pain Unresponsive scale score': 0,
      }),
    )

    testCase(
      'younger child, consciousness: Reacts to voice -> score: 1',
      'younger child',
      DEFAULT_MEASUREMENTS['younger child'],
      {
        ...DEFAULT_ASSESSMENTS['younger child'],
        consciousness: 'Reacts to voice',
      },
      baseScoresYoungerChild({
        'Alert Confusion Voice Pain Unresponsive scale score': 1,
      }),
    )

    testCase(
      'younger child, consciousness: Reacts to pain -> score: 2',
      'younger child',
      DEFAULT_MEASUREMENTS['younger child'],
      { ...DEFAULT_ASSESSMENTS['younger child'], consciousness: 'Reacts to pain' },
      baseScoresYoungerChild({
        'Alert Confusion Voice Pain Unresponsive scale score': 2,
      }),
    )

    testCase(
      'younger child, consciousness: Unresponsive -> score: 3',
      'younger child',
      DEFAULT_MEASUREMENTS['younger child'],
      { ...DEFAULT_ASSESSMENTS['younger child'], consciousness: 'Unresponsive' },
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
      DEFAULT_MEASUREMENTS['younger child'],
      { ...DEFAULT_ASSESSMENTS['younger child'], trauma_presence: 'No' },
      baseScoresYoungerChild({ 'Trauma score': 0 }),
      [],
    )

    testCase(
      'younger child, trauma: Yes -> score: 1',
      'younger child',
      DEFAULT_MEASUREMENTS['younger child'],
      { ...DEFAULT_ASSESSMENTS['younger child'], trauma_presence: 'Yes' },
      baseScoresYoungerChild({ 'Trauma score': 1 }),
    )
  })
})
