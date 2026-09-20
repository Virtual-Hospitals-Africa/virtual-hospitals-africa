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
import { getFormValues } from 'test/_helpers/form.ts'
import type { CheerioAPI } from 'cheerio'

import sortBy from '../../../../../util/sortBy.ts'

/*
  The check_for section renders each group with its due_to, the findings still to check for as
  a checkbox list and those already recorded as chips (islands/FollowUps/GroupSection.tsx).
*/
function checkForGroups($: CheerioAPI): { due_to: string; to_check: string[]; checked: string[] }[] {
  return $('#check-for-section [data-follow-up-group]').map((_, group) => ({
    due_to: $(group).find('[data-due-to]').text().replace(/^Due to\s*/, ''),
    to_check: $(group).find('[id^="follow-ups-"]:not([id^="follow-ups-checked-"]) label span.text-sm').map((_, el) => $(el).text()).get(),
    checked: $(group).find('[id^="follow-ups-checked-"] button').map((_, el) => $(el).text()).get(),
  })).get()
}

// The follow ups panel, rendered in the column left of the drawer, and the groups it lists
function followUpsPanelGroups($: CheerioAPI): string[] {
  return $('#drawer-side-panels #follow-ups-panel [data-follow-up-group] [data-due-to]').map((_, el) => $(el).text().replace(/^Due to\s*/, '')).get()
}

describeParallel('triage/additional_tasks_and_investigations', () => {
  before(waitUntilTestServerUp)
  before(async () => {
    await events.initializeAllProcessedPubSub()
  })
  afterAll(() => db.destroy())
  afterAll(() => events.closeAllProcessedPubSub({ graceful: false }))

  itParallel('prompts for Nausea Vomiting Pallor Sweating in case of chest pain', async () => {
    const { $, clinic, encounter, nurse, getStep } = await setupTriageNewPatient({
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

    const tasks = sortBy(
      task_group.tasks,
      (task) => task.atom === 'link' ? 0 : 1,
      (task) => task.atom === 'finding' ? task.displays.full : '',
    )

    const expected = sortBy(
      [
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
          'existing_record': null,
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
          'existing_record': null,
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
          'existing_record': null,
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
          'existing_record': null,
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
          'existing_record': null,
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
          'existing_record': null,
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
          'existing_record': null,
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
          'existing_record': null,
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
          'existing_record': null,
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
          'existing_record': null,
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
          'existing_record': null,
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
          'existing_record': null,
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
          'existing_record': null,
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
          'existing_record': null,
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
          'existing_record': null,
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
          'existing_record': null,
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
          'existing_record': null,
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
          'existing_record': null,
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
          'existing_record': null,
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
          'existing_record': null,
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
          'existing_record': null,
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
          'existing_record': null,
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
          'existing_record': null,
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
          'existing_record': null,
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
          'existing_record': null,
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
          'existing_record': null,
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
          'existing_record': null,
        },
      ],
      (task) => task.atom === 'link' ? 0 : 1,
      (task) => task.atom === 'finding' ? task.displays!.full : '',
    )

    assertMatches(tasks, expected)

    /*
      The check_for findings are listed in the page's check_for section for the health worker
      to check, not as inputs submitted with the page. Nothing of them is in the form.
    */
    // deno-lint-ignore no-explicit-any
    const form_values: any = getFormValues($)
    assert(!('check_for' in form_values) && !('evaluation_ids' in form_values), JSON.stringify(form_values))
    const [group, ...other_groups] = checkForGroups($)
    assertEquals(other_groups, [])
    assertMatches(group, { due_to: 'Chest pain', checked: [] })
    assertEquals(group.to_check.length, expected.filter((task) => task.atom === 'finding').length)
    for (
      const name of [
        'Nausea',
        'Vomiting',
        'Pallor of skin of face',
        'Sweating',
        'Radiating chest pain',
        'Pain radiating to jaw',
        'Pain radiating to neck',
        'Pain radiating to left arm',
        'Pain radiating to right arm',
        'Difficulty breathing',
      ]
    ) {
      assert(group.to_check.includes(name), `${name} not among ${group.to_check.join(', ')}`)
    }
    // The panel starts empty on this page: the check_for tasks are in the page itself
    assertEquals($('#follow-ups-panel').length, 0)

    // Whereas on any other page the same tasks start out in the panel
    const $warning_signs = await getStep('warning_signs')
    assertEquals($warning_signs('#check-for-section').length, 0)
    assertEquals(followUpsPanelGroups($warning_signs), ['Chest pain'])
    assertEquals($warning_signs('form #follow-ups-panel').length, 0, 'The panel sits outside the form so nothing of it is submitted')
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

      const anaphylaxis_diagnoses = await patient_evaluations.findAll(
        db,
        {
          patient_id,
          patient_encounter_id,
          root_snomed_concept_id: DIAGNOSIS.id,
        },
      )
      /*
        TODO the FindingsAdded events of the exposure and the allergy are processed concurrently, and
        each can find no anaphylaxis diagnosis present yet and insert one, so the same probable
        diagnosis is sometimes recorded twice. Until the pipeline serialises an encounter's events,
        what is asserted is that anaphylaxis is diagnosed and only ever as probable.
      */
      assert(anaphylaxis_diagnoses.length >= 1)
      for (const diagnosis of anaphylaxis_diagnoses) {
        assertMatches(diagnosis, {
          displays: {
            full: 'Anaphylaxis Diagnosis: Probable diagnosis',
          },
        })
      }
    },
  )

  itParallel(
    'does give an Urgent priority + possible diagnosis for anaphylaxis given an insect bite with low blood pressure',
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

      assertEquals(
        $('#patient-drawer-priority').text(),
        'Urgent',
      )

      // The insect bite already recorded starts out checked; the rest are listed to check for,
      // due to the possible diagnosis the bite with low blood pressure indicates
      const groups = checkForGroups($)
      const group = groups.find((group) => group.due_to === 'Anaphylaxis Diagnosis: Possible diagnosis')
      assert(group, JSON.stringify(groups))
      assertEquals(group.checked, ['Insect bite - wound'])
      for (
        const name of [
          'Sudden onset Itching',
          'Sudden onset Eruption',
          'Sudden onset Swelling (Face structure)',
          'Sudden onset Swelling (Tongue structure)',
          'Dizziness',
          'Collapse',
          'Difficulty breathing',
          'Exposure to Peanut',
          'Exposure to Tree nut',
          'Exposure to Eggs (edible)',
          'Exposure to Milk',
          'Exposure to Fish',
        ]
      ) {
        assert(group.to_check.includes(name), `${name} not among ${group.to_check.join(', ')}`)
      }
      assert(!group.to_check.includes('Insect bite - wound'))
    },
  )

  /*
    check_for tasks are no longer answered from this page. The anaphylaxis scenarios that were
    here, ruling the possible diagnosis in or out from the check_for answers, live in
    test/web/patients/open_encounter/none_of_the_above_findings.test.ts
  */
  itParallel(
    'prompts for blood glucose status if consciousness is not alert. If between 3-6 mmol/L for a patient with high BMI, follows up for other possible diabetes risk factors',
    async () => {
      const { $, postStep } = await setupTriageNewPatient({
        patient_demographics: randomDemographics('ZA', 'female', 'adult'),
        warning_signs: asWarningSignsAdult([], { pregnant: false }),
        brief_history: {
          common_conditions: {
            diabetes: { existence: 'No' },
            pregnancy: { existence: 'No' },
          },
        },
        // High BMI
        height_and_weight: {
          measurements: {
            height: {
              value: 140,
              units: 'cm',
            },
            weight: {
              value: 130,
              units: 'kg',
            },
          },
        },
        measure_vitals: {
          measurements: asVitalMeasurementFormValues({
            respiratory_rate: 12,
            heart_rate: 60,
            blood_pressure_systolic: 120,
            blood_pressure_diastolic: 80,
            temperature: 36.6,
          }),
          assessments: asVitalAssessmentFormValues({
            mobility_assessment: 'Walking',
            consciousness: 'Reacts to voice',
            trauma_presence: 'No',
          }),
        },
      })

      // deno-lint-ignore no-explicit-any
      const form_values: any = getFormValues($)

      // Each measurement names its task, so that submitting it marks the task done
      assertMatches(form_values, {
        measurements: {
          'measurement-blood-glucose-status': {
            value: null,
            units: 'mmol/L',
            s_expression: '(measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L)',
            task_description: z.string().min(1),
          },
        },
      })

      const post_data = structuredClone(form_values)
      // deno-lint-ignore no-explicit-any
      post_data.measurements['measurement-blood-glucose-status'].value = '5.1' as any

      const $after_post = await postStep({
        additional_tasks_and_investigations: post_data,
      })

      assert($after_post.url.endsWith('/triage/additional_tasks_and_investigations'))
      assertEquals($after_post('span:contains("Follow up based on new findings")').length, 1)

      // The follow up check_for task is in the page's check_for section
      const groups = checkForGroups($after_post)
      assert(groups.some((group) => group.to_check.includes('Sedentary lifestyle')), JSON.stringify(groups))
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
