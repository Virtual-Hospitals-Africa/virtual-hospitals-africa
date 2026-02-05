import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { afterAll, before } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../../../../db/db.ts'
import waitUntilTestServerUp from '../../../../_helpers/waitUntilTestServerUp.ts'
import {
  asVitalAssessmentFormValues,
  asVitalMeasurementFormValues,
  asWarningSigns,
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
import { system_diagnosis_rules } from '../../../../../db/models/system_diagnosis_rules.ts'
import { patient_findings } from '../../../../../db/models/patient_findings.ts'

import { getFormLabels, getFormValues } from 'test/_helpers/form.ts'
import { getTableDisplay } from 'test/_helpers/table.ts'

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
        diabetes: { existence: 'No' },
        pregnancy: { existence: 'No' },
      },
      warning_signs: asWarningSigns(['Chest pain'], { pregnant: false }),
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

    const task_groups = await additional_tasks.getTasksGroups(db, {
      encounter,
      health_worker_id: nurse.health_worker.id,
    })

    assertEquals(task_groups.length, 1)
    const [task_group] = task_groups
    assertMatches(task_group.due_to, [{ 'displays': { 'full': 'Chest pain' } }])

    assertEquals(task_group.tasks, [
      {
        'atom': 'link',
        'title': 'Chest pain page',
        'href': '/medical-resources/primary-care/adult.pdf#page=37',
        'thumbnail_href': '/medical-resources/za/primary-care/adult/thumbnails/150/37.png',
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
        'specific_snomed_concept': { 'atom': 'snomed_concept', 'name': 'Vomiting', 'category': 'disorder' },
        'value_snomed_concept': null,
        'qualifiers': [],
        'attributes': [],
        'exact': false,
        'history': false,
        'existence': 'Any',
        's_expression': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Vomiting" "disorder"))',
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
    ])

    const form_labels = getFormLabels($)
    const form_values = getFormValues($)

    assertEquals(form_labels, {
      'check_for': {
        'finding-nausea': { 'existence': 'Nausea*' },
        'finding-vomiting': { 'existence': 'Vomiting*' },
        'finding-pallor-of-skin-of-face': { 'existence': 'Pallor of skin of face*' },
        'finding-sweating': { 'existence': 'Sweating*' },
      },
    })
    assertEquals(form_values, {
      'check_for': {
        'finding-nausea': {
          's_expression': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Nausea" "finding"))',
        },
        'finding-vomiting': {
          's_expression': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Vomiting" "disorder"))',
        },
        'finding-pallor-of-skin-of-face': {
          's_expression': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Pallor of skin of face" "finding"))',
        },
        'finding-sweating': {
          's_expression': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Sweating" "finding"))',
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
        warning_signs: asWarningSigns([], { pregnant: false }, exposure_to_fish_s_expr),
        brief_history: {
          diabetes: {
            existence: 'No',
          },
          pregnancy: {
            existence: 'No',
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
        warning_signs: asWarningSigns([], { pregnant: false }, exposure_to_fish_s_expr, allergy_to_fish_s_expr),
        brief_history: {
          diabetes: {
            existence: 'No',
          },
          pregnancy: {
            existence: 'No',
          },
        },
      })

      const allergy_to_fish = await patient_findings.findOne(db, {
        patient_id,
        s_expression: allergy_to_fish_s_expr,
      })

      await events.allProcessedForEncounter(db, { patient_encounter_id })

      await system_diagnosis_rules.insertSystemDiagnosesIfNotAlreadyIdentified(db, {
        patient_id,
        patient_encounter_id,
        patient_age_determination: 'adult',
        records: [{
          id: allergy_to_fish.id,
          existence: 'Yes',
        }],
      })

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

      // Running again has no effect
      await system_diagnosis_rules.insertSystemDiagnosesIfNotAlreadyIdentified(db, {
        patient_id,
        patient_encounter_id,
        patient_age_determination: 'adult',
        records: [{
          id: allergy_to_fish.id,
          existence: 'Yes',
        }],
      })

      const same_anaphylaxis_diagnosis = await patient_evaluations.findOne(
        db,
        {
          patient_id,
          patient_encounter_id,
          root_snomed_concept_id: DIAGNOSIS.id,
        },
      )

      assertEquals(anaphylaxis_diagnosis, same_anaphylaxis_diagnosis)
    },
  )

  itParallel(
    'does give a possible diagnosis for anaphylaxis for an insect bite',
    async () => {
      const insect_bite_s_expr = '(clinical_finding (snomed_concept "Insect bite - wound" "disorder"))'
      const { $, patient_id, patient_encounter_id } = await setupTriageNewPatient({
        patient_demographics: randomDemographics('ZA', 'female', 'adult'),
        warning_signs: asWarningSigns([], { pregnant: false }, insect_bite_s_expr),
        brief_history: {
          diabetes: {
            existence: 'No',
          },
          pregnancy: {
            existence: 'No',
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
          full: 'Anaphylaxis Diagnosis: Possible diagnosis',
        },
      })

      const insect_bite = await patient_findings.findOne(db, {
        patient_id,
        s_expression: insect_bite_s_expr,
      })

      // Running again has no effect
      await system_diagnosis_rules.insertSystemDiagnosesIfNotAlreadyIdentified(db, {
        patient_id,
        patient_encounter_id,
        patient_age_determination: 'adult',
        records: [{
          id: insect_bite.id,
          existence: 'Yes',
        }],
      })

      const same_anaphylaxis_diagnosis = await patient_evaluations.findOne(
        db,
        {
          patient_id,
          patient_encounter_id,
          root_snomed_concept_id: DIAGNOSIS.id,
        },
      )

      assertEquals(anaphylaxis_diagnosis, same_anaphylaxis_diagnosis)

      const form_values = getFormValues($)

      assertMatches(form_values, {
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
      const { $, patient_id, patient_encounter_id, postStep } = await setupTriageNewPatient({
        patient_demographics: randomDemographics('ZA', 'female', 'adult'),
        warning_signs: asWarningSigns([], { pregnant: false }, insect_bite_s_expr),
        brief_history: {
          diabetes: {
            existence: 'No',
          },
          pregnancy: {
            existence: 'No',
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
          full: 'Anaphylaxis Diagnosis: Possible diagnosis',
        },
      })

      // deno-lint-ignore no-explicit-any
      const form_values: any = getFormValues($)

      const $assign_priority = await postStep({
        additional_tasks_and_investigations: {
          check_for: {
            'finding-sudden-onset-itching': {
              s_expression:
                '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Itching" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))',
              existence: 'Yes',
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
      console.log(table[0])
      assertMatches(table[0], {
        Assessment: 'Anaphylaxis Diagnosis',
        Finding: z.string().regex(
          /^Probable diagnosisAnaphylaxis Diagnosis: Probable diagnosisEvaluated by:Systemat \d+:\d+ (AM|PM)Itching→Evidence ofDifficulty breathing→Evidence of$/,
        ),
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
