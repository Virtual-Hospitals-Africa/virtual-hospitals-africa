import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { afterAll, before } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../../../../db/db.ts'
import waitUntilTestServerUp from '../../../../_helpers/waitUntilTestServerUp.ts'
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
import { route } from '../../../../_route.ts'
import { additional_tasks } from '../../../../../db/models/additional_tasks.ts'
import { assertMatches } from '../../../../../util/assertMatches.ts'
import { z } from 'zod'
import randomDemographics from '../../../../../mocks/randomDemographics.ts'
import { assert } from 'std/assert/assert.ts'
import { patient_evaluations } from '../../../../../db/models/patient_evaluations.ts'
import { DIAGNOSIS } from '../../../../../shared/snomed_concepts.ts'
import { events } from '../../../../../db/models/events.ts'
import { getFormLabels, getFormValues } from 'test/_helpers/form.ts'
import { getTableDisplay } from 'test/_helpers/table.ts'
import { deepMerge } from '../../../../../util/deepMerge.ts'
import keys from '../../../../../util/keys.ts'

describeParallel('triage/additional_tasks_and_investigations', () => {
  before(waitUntilTestServerUp)
  before(async () => {
    await events.initializeAllProcessedPubSub()
  })
  afterAll(() => db.destroy())
  afterAll(() => events.closeAllProcessedPubSub({ graceful: false }))

  itParallel('prompts for Nausea Vomiting Pallor Sweating in case of chest pain', async () => {
    const { $, clinic, encounter, nurse } = await setupTriageNewPatient({
      patient_demographics: { date_of_birth: '2001-01-01' },
      brief_history: {
        common_conditions: {
          diabetes: { existence: 'No' },
          pregnancy: { existence: 'No' },
        },
      },
      warning_signs: asWarningSignsAdult(['Chest pain'], { pregnant: false }),
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
        measurements: asVitalMeasurementFormValues({
          respiratory_rate: 12, // 9-14 -> score 0
          heart_rate: 60, // 51-100 -> score 0
          blood_pressure_systolic: 120, // 101-199 -> score 0
          blood_pressure_diastolic: 80,
          temperature: 36.6, // 35-38.4 -> score 0
        }),
        assessments: asVitalAssessmentFormValues({
          mobility_assessment: 'Walking', // score 0
          consciousness: 'Alert', // score 0
          trauma_presence: 'No', // score 0
        }),
      },
    })

    assertEquals(
      $.url,
      `${route}/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/triage/additional_tasks_and_investigations`,
    )

    const { task_groups } = await additional_tasks.getTasksGroups(db, {
      encounter,
      health_worker_id: nurse.health_worker.id,
    })

    assertEquals(task_groups.length, 1)
    const [task_group] = task_groups
    assertMatches(task_group.due_to, [{ 'displays': { 'full': 'Chest pain' } }])

    assertMatches(task_group.tasks, [
      {
        'atom': 'link',
        'title': 'APC 2023 — Chest pain',
        'href': '/medical-resources/primary-care/adult.pdf#page=37',
        'thumbnail_href': '/medical-resources/za/primary-care/adult/thumbnails/400/37.png',
      },
      {
        'atom': 'finding',
        'root_snomed_concept': { 'atom': 'snomed_concept', 'name': 'Clinical finding', 'category': 'finding' },
        'specific_snomed_concept': { 'atom': 'snomed_concept', 'name': 'Pulse irregular', 'category': 'finding' },
        'value_snomed_concept': null,
        'qualifiers': [],
        'attributes': [],
        'exact': false,
        'history': false,
        'existence': 'Any',
        's_expression': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Pulse irregular" "finding"))',
        'displays': { 'value': null, 'finding': 'Pulse irregular', 'full': 'Pulse irregular' },
        'existing_finding': null,
      },
      {
        'atom': 'finding',
        'root_snomed_concept': { 'atom': 'snomed_concept', 'name': 'Clinical finding', 'category': 'finding' },
        'specific_snomed_concept': { 'atom': 'snomed_concept', 'name': 'Severe pain', 'category': 'finding' },
        'value_snomed_concept': null,
        'qualifiers': [],
        'attributes': [],
        'exact': false,
        'history': false,
        'existence': 'Any',
        's_expression': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Severe pain" "finding"))',
        'displays': { 'value': null, 'finding': 'Severe pain', 'full': 'Severe pain' },
        'existing_finding': {
          'finding_s_expression': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Severe pain" "finding"))',
          'specific_snomed_concept_name': 'Severe pain',
          'specific_snomed_concept_category': 'finding',
          'existence': 'No',
          'value': {
            'name': 'No',
            'type': 'snomed_concept',
            'category': 'qualifier value',
            'snomed_concept_id': '373067005',
          },
          'evaluations': [],
          'priority': null,
          'destination_relations': [],
          'type': 'finding',
          'as_part_of_procedure': {
            'root_snomed_concept_id': '71388002',
            'root_snomed_concept_name': 'Procedure',
            'root_snomed_concept_category': 'procedure',
            'specific_snomed_concept_id': '245581009',
            'specific_snomed_concept_name': 'Emergency examination for triage',
            'specific_snomed_concept_category': 'procedure',
            'workflow_step_name': 'warning_signs',
          },
          'score': null,
          'attributes': [],
          'displays': { 'finding': 'Severe pain', 'value': 'No', 'full': 'Severe pain: No' },
          'modifiers': [],
          'provider': {
            'organizations': [
              {
                'category': 'Clinic',
              },
            ],
            'role': 'nurse',
            'is_me': true,
          },
        },
      },
      {
        'atom': 'finding',
        'root_snomed_concept': { 'atom': 'snomed_concept', 'name': 'Clinical finding', 'category': 'finding' },
        'specific_snomed_concept': { 'atom': 'snomed_concept', 'name': 'Chest pain', 'category': 'finding' },
        'value_snomed_concept': null,
        'qualifiers': [
          {
            'atom': 'qualifier',
            'specific_snomed_concept': { 'atom': 'snomed_concept', 'name': 'New', 'category': 'qualifier value' },
            'qualifiers': [],
          },
        ],
        'attributes': [],
        'exact': false,
        'history': false,
        'existence': 'Any',
        's_expression':
          '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Chest pain" "finding") (qualifier (snomed_concept "New" "qualifier value")))',
        'displays': { 'value': null, 'finding': 'New Chest pain', 'full': 'New Chest pain' },
        'existing_finding': null,
      },
      {
        'atom': 'finding',
        'root_snomed_concept': { 'atom': 'snomed_concept', 'name': 'Clinical finding', 'category': 'finding' },
        'specific_snomed_concept': { 'atom': 'snomed_concept', 'name': 'Chest discomfort', 'category': 'finding' },
        'value_snomed_concept': null,
        'qualifiers': [
          {
            'atom': 'qualifier',
            'specific_snomed_concept': { 'atom': 'snomed_concept', 'name': 'New', 'category': 'qualifier value' },
            'qualifiers': [],
          },
        ],
        'attributes': [],
        'exact': false,
        'history': false,
        'existence': 'Any',
        's_expression':
          '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Chest discomfort" "finding") (qualifier (snomed_concept "New" "qualifier value")))',
        'displays': { 'value': null, 'finding': 'New Chest discomfort', 'full': 'New Chest discomfort' },
        'existing_finding': null,
      },
      {
        'atom': 'finding',
        'root_snomed_concept': { 'atom': 'snomed_concept', 'name': 'Clinical finding', 'category': 'finding' },
        'specific_snomed_concept': { 'atom': 'snomed_concept', 'name': 'Nausea', 'category': 'finding' },
        'value_snomed_concept': null,
        'qualifiers': [],
        'attributes': [],
        'exact': false,
        'history': false,
        'existence': 'Any',
        's_expression': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Nausea" "finding"))',
        'displays': { 'value': null, 'finding': 'Nausea', 'full': 'Nausea' },
        'existing_finding': null,
      },
      {
        'atom': 'finding',
        'root_snomed_concept': { 'atom': 'snomed_concept', 'name': 'Clinical finding', 'category': 'finding' },
        'specific_snomed_concept': { 'atom': 'snomed_concept', 'name': 'Finding of vomiting', 'category': 'finding' },
        'value_snomed_concept': null,
        'qualifiers': [],
        'attributes': [],
        'exact': false,
        'history': false,
        'existence': 'Any',
        's_expression': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Finding of vomiting" "finding"))',
        'displays': { 'value': null, 'finding': 'Vomiting', 'full': 'Vomiting' },
        'existing_finding': null,
      },
      {
        'atom': 'finding',
        'root_snomed_concept': { 'atom': 'snomed_concept', 'name': 'Clinical finding', 'category': 'finding' },
        'specific_snomed_concept': { 'atom': 'snomed_concept', 'name': 'Pallor of skin of face', 'category': 'finding' },
        'value_snomed_concept': null,
        'qualifiers': [],
        'attributes': [],
        'exact': false,
        'history': false,
        'existence': 'Any',
        's_expression': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Pallor of skin of face" "finding"))',
        'displays': { 'value': null, 'finding': 'Pallor of skin of face', 'full': 'Pallor of skin of face' },
        'existing_finding': null,
      },
      {
        'atom': 'finding',
        'root_snomed_concept': { 'atom': 'snomed_concept', 'name': 'Clinical finding', 'category': 'finding' },
        'specific_snomed_concept': { 'atom': 'snomed_concept', 'name': 'Sweating', 'category': 'finding' },
        'value_snomed_concept': null,
        'qualifiers': [],
        'attributes': [],
        'exact': false,
        'history': false,
        'existence': 'Any',
        's_expression': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Sweating" "finding"))',
        'displays': { 'value': null, 'finding': 'Sweating', 'full': 'Sweating' },
        'existing_finding': null,
      },
      {
        'atom': 'finding',
        'root_snomed_concept': { 'atom': 'snomed_concept', 'name': 'Clinical finding', 'category': 'finding' },
        'specific_snomed_concept': { 'atom': 'snomed_concept', 'name': 'Radiating chest pain', 'category': 'finding' },
        'value_snomed_concept': null,
        'qualifiers': [],
        'attributes': [],
        'exact': false,
        'history': false,
        'existence': 'Any',
        's_expression': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Radiating chest pain" "finding"))',
        'displays': { 'value': null, 'finding': 'Radiating chest pain', 'full': 'Radiating chest pain' },
        'existing_finding': null,
      },
      {
        'atom': 'finding',
        'root_snomed_concept': { 'atom': 'snomed_concept', 'name': 'Clinical finding', 'category': 'finding' },
        'specific_snomed_concept': { 'atom': 'snomed_concept', 'name': 'Pain radiating to jaw', 'category': 'finding' },
        'value_snomed_concept': null,
        'qualifiers': [],
        'attributes': [],
        'exact': false,
        'history': false,
        'existence': 'Any',
        's_expression': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Pain radiating to jaw" "finding"))',
        'displays': { 'value': null, 'finding': 'Pain radiating to jaw', 'full': 'Pain radiating to jaw' },
        'existing_finding': null,
      },
      {
        'atom': 'finding',
        'root_snomed_concept': { 'atom': 'snomed_concept', 'name': 'Clinical finding', 'category': 'finding' },
        'specific_snomed_concept': { 'atom': 'snomed_concept', 'name': 'Pain radiating to neck', 'category': 'finding' },
        'value_snomed_concept': null,
        'qualifiers': [],
        'attributes': [],
        'exact': false,
        'history': false,
        'existence': 'Any',
        's_expression': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Pain radiating to neck" "finding"))',
        'displays': { 'value': null, 'finding': 'Pain radiating to neck', 'full': 'Pain radiating to neck' },
        'existing_finding': null,
      },
      {
        'atom': 'finding',
        'root_snomed_concept': { 'atom': 'snomed_concept', 'name': 'Clinical finding', 'category': 'finding' },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Pain radiating to left arm',
          'category': 'finding',
        },
        'value_snomed_concept': null,
        'qualifiers': [],
        'attributes': [],
        'exact': false,
        'history': false,
        'existence': 'Any',
        's_expression': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Pain radiating to left arm" "finding"))',
        'displays': { 'value': null, 'finding': 'Pain radiating to left arm', 'full': 'Pain radiating to left arm' },
        'existing_finding': null,
      },
      {
        'atom': 'finding',
        'root_snomed_concept': { 'atom': 'snomed_concept', 'name': 'Clinical finding', 'category': 'finding' },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Pain radiating to right arm',
          'category': 'finding',
        },
        'value_snomed_concept': null,
        'qualifiers': [],
        'attributes': [],
        'exact': false,
        'history': false,
        'existence': 'Any',
        's_expression': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Pain radiating to right arm" "finding"))',
        'displays': { 'value': null, 'finding': 'Pain radiating to right arm', 'full': 'Pain radiating to right arm' },
        'existing_finding': null,
      },
      {
        'atom': 'finding',
        'root_snomed_concept': { 'atom': 'snomed_concept', 'name': 'Clinical finding', 'category': 'finding' },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Pain radiating to left shoulder',
          'category': 'finding',
        },
        'value_snomed_concept': null,
        'qualifiers': [],
        'attributes': [],
        'exact': false,
        'history': false,
        'existence': 'Any',
        's_expression': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Pain radiating to left shoulder" "finding"))',
        'displays': {
          'value': null,
          'finding': 'Pain radiating to left shoulder',
          'full': 'Pain radiating to left shoulder',
        },
        'existing_finding': null,
      },
      {
        'atom': 'finding',
        'root_snomed_concept': { 'atom': 'snomed_concept', 'name': 'Clinical finding', 'category': 'finding' },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Pain radiating to right shoulder',
          'category': 'finding',
        },
        'value_snomed_concept': null,
        'qualifiers': [],
        'attributes': [],
        'exact': false,
        'history': false,
        'existence': 'Any',
        's_expression': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Pain radiating to right shoulder" "finding"))',
        'displays': {
          'value': null,
          'finding': 'Pain radiating to right shoulder',
          'full': 'Pain radiating to right shoulder',
        },
        'existing_finding': null,
      },
      {
        'atom': 'finding',
        'root_snomed_concept': { 'atom': 'snomed_concept', 'name': 'Clinical finding', 'category': 'finding' },
        'specific_snomed_concept': { 'atom': 'snomed_concept', 'name': 'Difficulty breathing', 'category': 'finding' },
        'value_snomed_concept': null,
        'qualifiers': [],
        'attributes': [],
        'exact': false,
        'history': false,
        'existence': 'Any',
        's_expression': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Difficulty breathing" "finding"))',
        'displays': { 'value': null, 'finding': 'Difficulty breathing', 'full': 'Difficulty breathing' },
        'existing_finding': null,
      },
      {
        'atom': 'finding',
        'root_snomed_concept': { 'atom': 'snomed_concept', 'name': 'Clinical finding', 'category': 'finding' },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'History of treatment for ischemic heart disease',
          'category': 'situation',
        },
        'value_snomed_concept': null,
        'qualifiers': [],
        'attributes': [],
        'exact': false,
        'history': false,
        'existence': 'Any',
        's_expression':
          '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "History of treatment for ischemic heart disease" "situation"))',
        'displays': {
          'value': null,
          'finding': 'History of treatment for ischemic heart disease',
          'full': 'History of treatment for ischemic heart disease',
        },
        'existing_finding': null,
      },
      {
        'atom': 'finding',
        'root_snomed_concept': { 'atom': 'snomed_concept', 'name': 'Clinical finding', 'category': 'finding' },
        'specific_snomed_concept': { 'atom': 'snomed_concept', 'name': 'Diabetes mellitus', 'category': 'disorder' },
        'value_snomed_concept': null,
        'qualifiers': [
          {
            'atom': 'qualifier',
            'specific_snomed_concept': {
              'atom': 'snomed_concept',
              'name': 'Known present',
              'category': 'qualifier value',
            },
            'qualifiers': [],
          },
        ],
        'attributes': [],
        'exact': false,
        'history': false,
        'existence': 'Any',
        's_expression':
          '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))',
        'displays': {
          'value': null,
          'finding': 'Known present Diabetes mellitus',
          'full': 'Known present Diabetes mellitus',
        },
        'existing_finding': null,
      },
      {
        'atom': 'finding',
        'root_snomed_concept': { 'atom': 'snomed_concept', 'name': 'Clinical finding', 'category': 'finding' },
        'specific_snomed_concept': { 'atom': 'snomed_concept', 'name': 'Smoker', 'category': 'finding' },
        'value_snomed_concept': null,
        'qualifiers': [],
        'attributes': [],
        'exact': false,
        'history': false,
        'existence': 'Any',
        's_expression': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Smoker" "finding"))',
        'displays': { 'value': null, 'finding': 'Smoker', 'full': 'Smoker' },
        'existing_finding': null,
      },
      {
        'atom': 'finding',
        'root_snomed_concept': { 'atom': 'snomed_concept', 'name': 'Clinical finding', 'category': 'finding' },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Hypertensive disorder, systemic arterial',
          'category': 'disorder',
        },
        'value_snomed_concept': null,
        'qualifiers': [
          {
            'atom': 'qualifier',
            'specific_snomed_concept': {
              'atom': 'snomed_concept',
              'name': 'Known present',
              'category': 'qualifier value',
            },
            'qualifiers': [],
          },
        ],
        'attributes': [],
        'exact': false,
        'history': false,
        'existence': 'Any',
        's_expression':
          '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Hypertensive disorder, systemic arterial" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))',
        'displays': {
          'value': null,
          'finding': 'Known present Hypertensive disorder, systemic arterial',
          'full': 'Known present Hypertensive disorder, systemic arterial',
        },
        'existing_finding': null,
      },
      {
        'atom': 'finding',
        'root_snomed_concept': { 'atom': 'snomed_concept', 'name': 'Clinical finding', 'category': 'finding' },
        'specific_snomed_concept': { 'atom': 'snomed_concept', 'name': 'Hypercholesterolemia', 'category': 'disorder' },
        'value_snomed_concept': null,
        'qualifiers': [
          {
            'atom': 'qualifier',
            'specific_snomed_concept': {
              'atom': 'snomed_concept',
              'name': 'Known present',
              'category': 'qualifier value',
            },
            'qualifiers': [],
          },
        ],
        'attributes': [],
        'exact': false,
        'history': false,
        'existence': 'Any',
        's_expression':
          '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Hypercholesterolemia" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))',
        'displays': {
          'value': null,
          'finding': 'Known present Hypercholesterolemia',
          'full': 'Known present Hypercholesterolemia',
        },
        'existing_finding': null,
      },
      {
        'atom': 'finding',
        'root_snomed_concept': { 'atom': 'snomed_concept', 'name': 'Clinical finding', 'category': 'finding' },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Family history of ischemic heart disease',
          'category': 'situation',
        },
        'value_snomed_concept': null,
        'qualifiers': [],
        'attributes': [],
        'exact': false,
        'history': false,
        'existence': 'Any',
        's_expression': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Family history of ischemic heart disease" "situation"))',
        'displays': {
          'value': null,
          'finding': 'Family history of ischemic heart disease',
          'full': 'Family history of ischemic heart disease',
        },
        'existing_finding': null,
      },
      {
        'atom': 'finding',
        'root_snomed_concept': { 'atom': 'snomed_concept', 'name': 'Clinical finding', 'category': 'finding' },
        'specific_snomed_concept': { 'atom': 'snomed_concept', 'name': 'ST segment elevation', 'category': 'finding' },
        'value_snomed_concept': null,
        'qualifiers': [],
        'attributes': [],
        'exact': false,
        'history': false,
        'existence': 'Any',
        's_expression': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "ST segment elevation" "finding"))',
        'displays': { 'value': null, 'finding': 'St segment elevation', 'full': 'St segment elevation' },
        'existing_finding': null,
      },
      {
        'atom': 'finding',
        'root_snomed_concept': { 'atom': 'snomed_concept', 'name': 'Clinical finding', 'category': 'finding' },
        'specific_snomed_concept': { 'atom': 'snomed_concept', 'name': 'ST segment depression', 'category': 'finding' },
        'value_snomed_concept': null,
        'qualifiers': [],
        'attributes': [],
        'exact': false,
        'history': false,
        'existence': 'Any',
        's_expression': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "ST segment depression" "finding"))',
        'displays': { 'value': null, 'finding': 'St segment depression', 'full': 'St segment depression' },
        'existing_finding': null,
      },
      {
        'atom': 'finding',
        'root_snomed_concept': { 'atom': 'snomed_concept', 'name': 'Clinical finding', 'category': 'finding' },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Electrocardiographic left bundle branch block',
          'category': 'finding',
        },
        'value_snomed_concept': null,
        'qualifiers': [],
        'attributes': [],
        'exact': false,
        'history': false,
        'existence': 'Any',
        's_expression': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Electrocardiographic left bundle branch block" "finding"))',
        'displays': {
          'value': null,
          'finding': 'Electrocardiographic left bundle branch block',
          'full': 'Electrocardiographic left bundle branch block',
        },
        'existing_finding': null,
      },
      {
        'atom': 'finding',
        'root_snomed_concept': { 'atom': 'snomed_concept', 'name': 'Clinical finding', 'category': 'finding' },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Chest pain on breathing',
          'category': 'finding',
        },
        'value_snomed_concept': null,
        'qualifiers': [],
        'attributes': [],
        'exact': false,
        'history': false,
        'existence': 'Any',
        's_expression': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Chest pain on breathing" "finding"))',
        'displays': { 'value': null, 'finding': 'Chest pain on breathing', 'full': 'Chest pain on breathing' },
        'existing_finding': null,
      },
      {
        'atom': 'finding',
        'root_snomed_concept': { 'atom': 'snomed_concept', 'name': 'Clinical finding', 'category': 'finding' },
        'specific_snomed_concept': { 'atom': 'snomed_concept', 'name': 'Pleuritic pain', 'category': 'finding' },
        'value_snomed_concept': null,
        'qualifiers': [],
        'attributes': [],
        'exact': false,
        'history': false,
        'existence': 'Any',
        's_expression': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Pleuritic pain" "finding"))',
        'displays': { 'value': null, 'finding': 'Pleuritic pain', 'full': 'Pleuritic pain' },
        'existing_finding': null,
      },
      {
        'atom': 'measurement',
        'snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Heart rate measured at systemic artery',
          'category': 'observable entity',
        },
        'units': 'bpm',
        's_expression': '(measurement (snomed_concept "Heart rate measured at systemic artery" "observable entity") bpm)',
        'displays': {
          'value': null,
          'finding': 'Heart rate measured at systemic artery',
          'full': 'Heart rate measured at systemic artery',
        },
        'existing_measurement': null,
      },
    ])
    const form_labels = getFormLabels($)
    const form_values = getFormValues($)

    assertMatches({ form_labels, form_values }, {
      'form_labels': {
        'check_for': {
          'finding-nausea': { 'existence': 'Nausea*' },
          'finding-vomiting': { 'existence': 'Vomiting*' },
          'finding-pallor-of-skin-of-face': { 'existence': 'Pallor of skin of face*' },
          'finding-sweating': { 'existence': 'Sweating*' },
          'finding-radiating-chest-pain': { 'existence': 'Radiating chest pain*' },
          'finding-pain-radiating-to-jaw': { 'existence': 'Pain radiating to jaw*' },
          'finding-pain-radiating-to-neck': { 'existence': 'Pain radiating to neck*' },
          'finding-pain-radiating-to-left-arm': { 'existence': 'Pain radiating to left arm*' },
          'finding-pain-radiating-to-right-arm': { 'existence': 'Pain radiating to right arm*' },
          'finding-difficulty-breathing': { 'existence': 'Difficulty breathing*' },
        },
      },
      'form_values': {
        'evaluation_ids': z.string().uuid().array(),
        'check_for': {
          'finding-nausea': {
            's_expression': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Nausea" "finding"))',
          },
          'finding-vomiting': {
            's_expression': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Finding of vomiting" "finding"))',
          },
          'finding-pallor-of-skin-of-face': {
            's_expression': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Pallor of skin of face" "finding"))',
          },
          'finding-sweating': {
            's_expression': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Sweating" "finding"))',
          },
          'finding-radiating-chest-pain': {
            's_expression': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Radiating chest pain" "finding"))',
          },
          'finding-pain-radiating-to-jaw': {
            's_expression': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Pain radiating to jaw" "finding"))',
          },
          'finding-pain-radiating-to-neck': {
            's_expression': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Pain radiating to neck" "finding"))',
          },
          'finding-pain-radiating-to-left-arm': {
            's_expression': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Pain radiating to left arm" "finding"))',
          },
          'finding-pain-radiating-to-right-arm': {
            's_expression': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Pain radiating to right arm" "finding"))',
          },
          'finding-difficulty-breathing': {
            's_expression': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Difficulty breathing" "finding"))',
          },
        },
      },
    })
  })

  itParallel(
    'does not give a probable diagnosis for anaphylaxis if exposed to fish without an allergy',
    async () => {
      const exposure_to_fish_s_expr = '(finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Fish" "substance"))'

      const { patient_id, patient_encounter_id } = await setupTriageNewPatient({
        patient_demographics: randomDemographics('ZA', 'female', 'adult'),
        warning_signs: asWarningSignsAdult([], { pregnant: false }, exposure_to_fish_s_expr),
        brief_history: {
          common_conditions: {
            diabetes: { existence: 'No' },
            pregnancy: { existence: 'No' },
          },
        },
      })

      await events.allProcessedForEncounter(db, { patient_encounter_id })

      const anaphylaxis_diagnosis = await patient_evaluations.findOneOptional(
        db,
        {
          patient_id,
          patient_encounter_id,
          root_snomed_concept_id: DIAGNOSIS.id,
        },
      )

      assert(!anaphylaxis_diagnosis)
    },
  )

  itParallel(
    'does give a probable diagnosis for anaphylaxis if exposed to fish with an allergy',
    async () => {
      const exposure_to_fish_s_expr = '(finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Fish" "substance"))'
      const allergy_to_fish_s_expr = '(allergy (snomed_concept "Fish" "substance"))'

      const { patient_id, patient_encounter_id } = await setupTriageNewPatient({
        patient_demographics: randomDemographics('ZA', 'female', 'adult'),
        warning_signs: asWarningSignsAdult([], { pregnant: false }, exposure_to_fish_s_expr, allergy_to_fish_s_expr),
        brief_history: {
          common_conditions: {
            diabetes: { existence: 'No' },
            pregnancy: { existence: 'No' },
          },
        },
      })

      await events.allProcessedForEncounter(db, { patient_encounter_id })

      const anaphylaxis_diagnosis = await patient_evaluations.findOne(
        db,
        {
          patient_id,
          patient_encounter_id,
          root_snomed_concept_id: DIAGNOSIS.id,
        },
      )

      assertMatches(anaphylaxis_diagnosis, {
        displays: {
          full: 'Anaphylaxis Diagnosis: Probable diagnosis',
        },
      })
    },
  )

  itParallel(
    'does give a possible diagnosis for anaphylaxis for an insect bite',
    async () => {
      const insect_bite_s_expr = '(clinical_finding (snomed_concept "Insect bite - wound" "disorder"))'
      const { $, patient_id: _patient_id, patient_encounter_id: _patient_encounter_id } = await setupTriageNewPatient({
        patient_demographics: randomDemographics('ZA', 'female', 'adult'),
        warning_signs: asWarningSignsAdult([], { pregnant: false }, insect_bite_s_expr),
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
          measurements: asVitalMeasurementFormValues({
            respiratory_rate: 12,
            heart_rate: 60,
            blood_pressure_systolic: 85,
            blood_pressure_diastolic: 55,
            temperature: 36.6,
          }),
          assessments: asVitalAssessmentFormValues({
            mobility_assessment: 'Walking',
            consciousness: 'Alert',
            trauma_presence: 'No',
          }),
        },
      })

      const form_values = getFormValues($)

      assertMatches(form_values, {
        evaluation_ids: z.string().uuid().array(),
        check_for: {
          'finding-sudden-onset-itching': {
            s_expression:
              '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Itching" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))',
          },
          'finding-sudden-onset-eruption': {
            s_expression:
              '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Eruption" "morphologic abnormality") (qualifier (snomed_concept "Sudden onset" "qualifier value")))',
          },
          'finding-insect-bite-wound': {
            s_expression: '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Insect bite - wound" "disorder"))',
            existing_finding: {
              id: z.string().uuid(),
              existence: 'Yes',
            },
            existence: 'Yes',
          },
          'finding-sudden-onset-swelling-face-structure': {
            s_expression:
              '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Swelling" "finding") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))',
          },
          'finding-sudden-onset-swelling-tongue-structure': {
            s_expression:
              '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Swelling" "finding") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Tongue structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))',
          },
          'finding-dizziness': {
            s_expression: '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Dizziness" "finding"))',
          },
          'finding-collapse': {
            s_expression: '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Collapse" "finding"))',
          },
          'finding-difficulty-breathing': {
            s_expression: '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Difficulty breathing" "finding"))',
          },
          'finding-exposure-to-peanut': {
            s_expression: '(finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Peanut" "substance"))',
          },
          'finding-exposure-to-tree-nut': {
            s_expression: '(finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Tree nut" "substance"))',
          },
          'finding-exposure-to-eggs-edible': {
            s_expression: '(finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Eggs (edible)" "substance"))',
          },
          'finding-exposure-to-milk': {
            s_expression: '(finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Milk" "substance"))',
          },
          'finding-exposure-to-fish': {
            s_expression: '(finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Fish" "substance"))',
          },
        },
      }, { strict: true })
    },
  )

  itParallel(
    'upgrades a possible diagnosis for anaphylaxis to a probable diagnosis after meeting prompted for checks',
    async () => {
      const insect_bite_s_expr = '(clinical_finding (snomed_concept "Insect bite - wound" "disorder"))'
      const { $, patient_encounter_id, postStep } = await setupTriageNewPatient({
        patient_demographics: randomDemographics('ZA', 'female', 'adult'),
        warning_signs: asWarningSignsAdult([], { pregnant: false }, insect_bite_s_expr),
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
          measurements: asVitalMeasurementFormValues({
            respiratory_rate: 12,
            heart_rate: 60,
            blood_pressure_systolic: 85, // low, triggers check for anaphylaxis
            blood_pressure_diastolic: 55,
            temperature: 36.6,
          }),
          assessments: asVitalAssessmentFormValues({
            mobility_assessment: 'Walking',
            consciousness: 'Alert',
            trauma_presence: 'No',
          }),
        },
      })

      await events.allProcessedForEncounter(db, { patient_encounter_id })

      // deno-lint-ignore no-explicit-any
      const form_values: any = getFormValues($)
      const additional_tasks_and_investigations_post_data = structuredClone(form_values)
      additional_tasks_and_investigations_post_data.check_for['finding-sudden-onset-itching'].existence = 'Yes'
      additional_tasks_and_investigations_post_data.check_for['finding-difficulty-breathing'].existence = 'Yes'

      for (const key of keys(additional_tasks_and_investigations_post_data.check_for)) {
        if (!additional_tasks_and_investigations_post_data.check_for[key].existence) {
          additional_tasks_and_investigations_post_data.check_for[key].existence = 'No'
        }
      }
      const $assign_priority = await postStep({
        additional_tasks_and_investigations: additional_tasks_and_investigations_post_data,
      })

      const table = getTableDisplay($assign_priority)
      assertMatches(table[0], {
        Assessment: 'Anaphylaxis Diagnosis',
        Finding: 'Probable diagnosis',
        'Reference Range': '',
        'Priority / Score': 'Urgent',
      }, { strict: true })
    },
  )

  itParallel(
    'downgrades a possible diagnosis for anaphylaxis to an improbable diagnosis if checks are not met',
    async () => {
      const insect_bite_s_expr = '(clinical_finding (snomed_concept "Insect bite - wound" "disorder"))'
      const { $, nurse, encounter, patient_id: _patient_id, patient_encounter_id, postStep } = await setupTriageNewPatient({
        patient_demographics: randomDemographics('ZA', 'female', 'adult'),
        warning_signs: asWarningSignsAdult([], { pregnant: false }, insect_bite_s_expr),
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
          measurements: asVitalMeasurementFormValues({
            respiratory_rate: 12,
            heart_rate: 60,
            blood_pressure_systolic: 85,
            blood_pressure_diastolic: 55,
            temperature: 36.6,
          }),
          assessments: asVitalAssessmentFormValues({
            mobility_assessment: 'Walking',
            consciousness: 'Alert',
            trauma_presence: 'No',
          }),
        },
      })

      await events.allProcessedForEncounter(db, { patient_encounter_id })

      // deno-lint-ignore no-explicit-any
      const form_values: any = getFormValues($)

      const $assign_priority = await postStep({
        additional_tasks_and_investigations: {
          evaluation_ids: (await additional_tasks.getTasksGroups(db, { health_worker_id: nurse.health_worker.id, encounter })).evaluation_ids,
          check_for: {
            'finding-sudden-onset-itching': {
              s_expression:
                '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Itching" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))',
              existence: 'No',
            },
            'finding-sudden-onset-eruption': {
              s_expression:
                '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Eruption" "morphologic abnormality") (qualifier (snomed_concept "Sudden onset" "qualifier value")))',
              existence: 'No',
            },
            'finding-insect-bite-wound': {
              s_expression: '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Insect bite - wound" "disorder"))',
              existing_finding: {
                id: form_values['check_for']['finding-insect-bite-wound']['existing_finding']['id'] as string,
                existence: 'Yes',
              },
              existence: 'Yes',
            },
            'finding-sudden-onset-swelling-face-structure': {
              s_expression:
                '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Swelling" "finding") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))',
              existence: 'No',
            },
            'finding-sudden-onset-swelling-tongue-structure': {
              s_expression:
                '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Swelling" "finding") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Tongue structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))',
              existence: 'No',
            },
            'finding-dizziness': {
              s_expression: '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Dizziness" "finding"))',
              existence: 'No',
            },
            'finding-collapse': {
              s_expression: '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Collapse" "finding"))',
              existence: 'No',
            },
            'finding-difficulty-breathing': {
              s_expression: '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Difficulty breathing" "finding"))',
              existence: 'Yes',
            },
            'finding-exposure-to-peanut': {
              s_expression: '(finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Peanut" "substance"))',
              existence: 'No',
            },
            'finding-exposure-to-tree-nut': {
              s_expression: '(finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Tree nut" "substance"))',
              existence: 'No',
            },
            'finding-exposure-to-eggs-edible': {
              s_expression: '(finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Eggs (edible)" "substance"))',
              existence: 'No',
            },
            'finding-exposure-to-milk': {
              s_expression: '(finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Milk" "substance"))',
              existence: 'No',
            },
            'finding-exposure-to-fish': {
              s_expression: '(finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Fish" "substance"))',
              existence: 'No',
            },
          },
        },
      })

      const table = getTableDisplay($assign_priority)
      assertMatches(table[0], {
        Assessment: 'Anaphylaxis Diagnosis',
        Finding: 'Improbable diagnosis',
        'Reference Range': '',
        'Priority / Score': '',
      }, { strict: true })
    },
  )

  itParallel(
    'reevaluates from improbable to probable after posting different signs on additional_tasks',
    async () => {
      const insect_bite_s_expr = '(clinical_finding (snomed_concept "Insect bite - wound" "disorder"))'
      const { $, patient_id: _patient_id, patient_encounter_id: _patient_encounter_id, postStep, getStep } = await setupTriageNewPatient({
        patient_demographics: randomDemographics('ZA', 'female', 'adult'),
        warning_signs: asWarningSignsAdult([], { pregnant: false }, insect_bite_s_expr),
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
          measurements: asVitalMeasurementFormValues({
            respiratory_rate: 12,
            heart_rate: 60,
            blood_pressure_systolic: 85,
            blood_pressure_diastolic: 55,
            temperature: 36.6,
          }),
          assessments: asVitalAssessmentFormValues({
            mobility_assessment: 'Walking',
            consciousness: 'Alert',
            trauma_presence: 'No',
          }),
        },
      })

      // deno-lint-ignore no-explicit-any
      const form_values: any = getFormValues($)

      // First POST: all symptoms "No" → improbable
      const post_data = structuredClone(form_values)
      for (const key in post_data.check_for) {
        post_data.check_for[key].existence = post_data.check_for[key].existence || 'No'
      }

      const $after_first_post = await postStep({
        additional_tasks_and_investigations: post_data,
      })

      // Verify improbable diagnosis after first POST
      const table_1 = getTableDisplay($after_first_post)
      assertMatches(table_1[0], {
        Assessment: 'Anaphylaxis Diagnosis',
        Finding: 'Improbable diagnosis',
        'Reference Range': '',
        'Priority / Score': '',
      }, { strict: true })

      // GET the additional_tasks page again to get updated form values with existing_finding IDs
      const $additional_tasks_2 = await getStep('additional_tasks_and_investigations')

      // deno-lint-ignore no-explicit-any
      const form_values_2: any = getFormValues($additional_tasks_2)

      const second_post = deepMerge(
        form_values_2,
        {
          check_for: {
            'finding-sudden-onset-itching': {
              existence: 'Yes',
            },
            'finding-difficulty-breathing': {
              existence: 'Yes',
            },
          },
        },
      )

      // Second POST: change itching and difficulty-breathing to "Yes" → probable
      const $after_second_post = await postStep({
        additional_tasks_and_investigations: second_post,
      })

      // Verify probable diagnosis after second POST
      const table_2 = getTableDisplay($after_second_post)
      assertMatches(table_2[0], {
        Assessment: 'Anaphylaxis Diagnosis',
        Finding: 'Probable diagnosis',
        'Reference Range': '',
        'Priority / Score': 'Urgent',
      }, { strict: true })
    },
  )

  itParallel.skip('creates an additional task if oxygen saturation is below 92%', async () => {
    const age_determination = 'adult' as const
    /*const { nurse, encounter, patient_encounter_id } =*/ await setupTriageNewPatient({
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
        measurements: asVitalMeasurementFormValues({
          ...DEFAULT_MEASUREMENTS['adult'],
          respiratory_rate: 8,
        }),
        assessments: asVitalAssessmentFormValues(DEFAULT_ASSESSMENTS['adult']),
      },
    })

    // const measurements = await patient_measurements.findAll(
    //   db,
    //   {
    //     patient_id: encounter.patient.id,
    //     s_expression: `
    //       (and (not (measurement ${VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS.height}))
    //            (not (measurement ${VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS.weight})))
    //     `,
    //   },
    // )

    // assertMatches(measurements, [
    //   {
    //     'type': 'finding',
    //     'id': z.string().uuid(),
    //     'created_at': z.date(),
    //     'snomed_concept_id': '118245000',
    //     'patient_encounter_id': z.string().uuid(),
    //     'patient_encounter_employee_id': z.string().uuid(),
    //     'name': 'Measurement finding',
    //     'category': 'finding',
    //     'destination_relations': [],
    //     'value_snomed_concept_id': null,

    //     'specific_snomed_concept_id': '103228002',
    //     'finding_name': 'Hemoglobin saturation with oxygen',
    //     'value_display': '91%',
    //     'source_relations': [
    //       {
    //         'source_id': z.string().uuid(),
    //         'snomed_concept_id': '42752001',
    //       },
    //     ],
    //     'as_part_of_procedure': {
    //       'id': z.string().uuid(),
    //       'snomed_concept_id': '410188000',
    //       'name': 'Taking patient vital signs assessment',
    //     },
    //     'priority': null,
    //     'qualifiers': [],
    //     'value': '91',
    //     'units': '%',
    //     'full_display': 'Hemoglobin saturation with oxygen: 91%',
    //   },
    // ], { strict: true })

    // const evaluations = await patient_evaluations.findAll(
    //   db,
    //   {
    //     patient_id: encounter.patient.id,
    //   },
    // )

    // const action_status = findMatching(evaluations, {
    //   name: 'Action status',
    // })

    // assertMatches(action_status, {
    //   'type': 'evaluation',
    //   'id': z.string().uuid(),
    //   'created_at': z.date(),
    //   'snomed_concept_id': '385641008',
    //   'patient_encounter_id': z.string().uuid(),
    //   'evaluates_record_id': z.string().uuid(),
    //   'employment_id': null,
    //   'by_system': true,
    //   'name': 'Action status',
    //   'category': 'attribute',
    //   'value_snomed_concept_id': '385643006',
    //   'value_name': 'To be done',
    //   'qualifiers': [],
    //   'source_relations': [],
    //   'destination_relations': [{
    //     'destination_id': z.string().uuid(),
    //     'snomed_concept_id': '42752001',
    //   }],
    // }, { strict: true })

    // const planned_procedure = await patient_procedures.getById(
    //   db,
    //   action_status.evaluates_record_id,
    // )

    // assertMatches(planned_procedure, {
    //   'id': z.string().uuid(),
    //   'created_at': z.date(),
    //   'snomed_concept_id': '57485005',
    //   'patient_encounter_id': z.string().uuid(),
    //   'name': 'Oxygen therapy',
    //   'value_snomed_concept_id': null,

    //   'qualifiers': [],
    //   'source_relations': [],
    //   'destination_relations': [],
    //   'full_display': 'Oxygen therapy',
    //   'value_display': 'Oxygen therapy',
    //   'category': 'procedure',
    //   'type': 'procedure',
    //   'by_system': true,
    //   'employment_id': null,
    // }, { strict: true })
  })
})
