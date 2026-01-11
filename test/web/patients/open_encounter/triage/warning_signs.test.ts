import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { afterAll, before } from 'std/testing/bdd.ts'
import db from '../../../../../db/db.ts'
import { addTestEmployeeWithSession } from '../../../../_helpers/employees.ts'
import { insertReturningSeekingTreatmentWithEmployeeForTest } from '../../../../_helpers/workflows.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import waitUntilTestServerUp from '../../../../_helpers/waitUntilTestServerUp.ts'
import { getFormLabels, getFormValues } from '../../../../_helpers/form.ts'
import asFormData from '../../../../../util/asFormData.ts'
import { patient_findings } from '../../../../../db/models/patient_findings.ts'
import { assertMatches } from '../../../../../util/assertMatches.ts'
import { z } from 'zod'
import { route } from '../../../../_route.ts'
import { patient_encounters } from '../../../../../db/models/patient_encounters.ts'
import { WARNING_SIGNS } from '../../../../../shared/warning_signs.ts'
import { brief_history } from '../../../../../db/models/brief_history.ts'
import { assert } from 'std/assert/assert.ts'
import { WarningSign } from '../../../../../types.ts'
import assertLength from '../../../../../util/assertLength.ts'
import { getTableDisplay } from '../../../../_helpers/table.ts'
import { COMMON_CONDITIONS } from '../../../../../shared/brief_history.ts'
import {
  CLINICAL_FINDING,
  STATUS_ATTRIBUTE,
} from '../../../../../shared/snomed_concepts.ts'
import assertIncludes from '../../../../../util/assertIncludes.ts'
import { additional_tasks } from '../../../../../db/models/additional_tasks.ts'
import { humanReadableJson } from '../../../../../util/humanReadableJson.ts'
import { asWarningSigns, setupTriage } from './_setup.ts'
import { hyphenate } from '../../../../../util/hyphenate.ts'
import { events } from '../../../../../db/models/events.ts'
import values from '../../../../../util/values.ts'

describeParallel('triage/warning_signs', () => {
  before(waitUntilTestServerUp)
  afterAll(() => db.destroy())
  afterAll(() => events.closeAllProcessedPubSub({ graceful: false }))

  describeParallel('GET', () => {
    itParallel(
      'renders a warning signs page when patient not known to be pregnant',
      async () => {
        const { clinic, nurse, encounter } = await setupTriage({
          patient_demographics: {},
          warning_signs: { warning_signs: {} },
        })

        const $warning_signs = await nurse.fetchCheerio(
          `/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/triage/warning_signs`,
        )

        const search_route = $warning_signs('#warning-signs-search').attr(
          'data-searchroute',
        )
        assertEquals(
          search_route,
          `/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/snomed-warning-signs`,
        )

        const form_labels = getFormLabels($warning_signs)
        assertEquals(form_labels, {
          'warning_signs': {
            'Obstructed airway': 'Obstructed airwayNot breathing',
            'Seizure': 'SeizureCurrent',
            'Burn Facial': 'BurnFacial',
            'Burn Inhalation': 'BurnInhalation',
            'Cardiac arrest': 'Cardiac arrest',
            'High energy transfer':
              'High energy transferSevere mechanism of injury',
            'Focal neurology — acute': 'Focal neurology — acuteStroke',
            'Fracture': 'FractureClosed (no break in the skin)',
            'Burn Circumferential': 'BurnCircumferential',
            'Shortness of breath - acute': 'Shortness of breath - acute',
            'Aggression': 'Aggression',
            'Burn Chemical': 'BurnChemical',
            'Threatened limb': 'Threatened limb',
            'Poisoning': 'Poisoning',
            'Overdose': 'Overdose',
            'Coughing blood': 'Coughing blood',
            'Eye injury': 'Eye injury',
            'Chest pain': 'Chest pain',
            'Dislocation of larger joint':
              'Dislocation of larger jointnot finger or toe',
            'Vomiting fresh blood': 'Vomiting fresh blood',
            'Stabbed neck': 'Stabbed neck',
            'Fractured - compound': 'Fractured - compoundwith a break in skin',
            'Hemorrhage Uncontrolled': 'Hemorrhage Uncontrolledarterial bleed',
            'Seizure - post ictal': 'Seizure - post ictal',
            'Severe pain': 'Severe pain',
            'Burn Moderate severity': 'BurnModerate severity',
            'Haemorrhage Controlled': 'HaemorrhageControlled',
            'Dislocation of finger': 'Dislocation of finger',
            'Dislocation of toe joint': 'Dislocation of toe joint',
            'Burn Other': 'BurnOther',
            'Abdominal pain': 'Abdominal pain',
            'Persistent vomiting': 'Persistent vomiting',
            'Moderate pain': 'Moderate pain',
          },
        })
      },
    )

    itParallel(
      'renders the pregnancy-specific signs when the patient is pregnant',
      async () => {
        const { clinic, nurse, encounter } = await setupTriage({
          patient_demographics: {},
          early_brief_history: {
            diabetes: { existence: 'No' },
            pregnancy: { existence: 'Yes' },
          },
          warning_signs: { warning_signs: {} },
        })

        const most_recent_findings = await brief_history
          .renderedMostRecentFindings(db, {
            patient_id: encounter.patient.id,
            encounter,
            health_worker_id: nurse.health_worker.id,
            conditions: COMMON_CONDITIONS,
          })
        assert(most_recent_findings.pregnancy)

        await patient_encounters.close(db, {
          patient_encounter_id: encounter.patient_encounter_id,
        })

        await insertReturningSeekingTreatmentWithEmployeeForTest(
          db,
          nurse.health_worker.organization_id,
          {
            patient_id: encounter.patient.id,
            employment_id: nurse.health_worker.employee_id,
          },
        )

        const $warning_signs = await nurse.fetchCheerio(
          `/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/triage/warning_signs`,
        )

        const form_labels = getFormLabels($warning_signs)
        assertEquals(form_labels, {
          'warning_signs': {
            'Obstructed airway': 'Obstructed airwayNot breathing',
            'Seizure': 'SeizureCurrent',
            'Burn Facial': 'BurnFacial',
            'Burn Inhalation': 'BurnInhalation',
            'Cardiac arrest': 'Cardiac arrest',
            'High energy transfer':
              'High energy transferSevere mechanism of injury',
            'Focal neurology — acute': 'Focal neurology — acuteStroke',
            'Fracture': 'FractureClosed (no break in the skin)',
            'Burn Circumferential': 'BurnCircumferential',
            'Shortness of breath - acute': 'Shortness of breath - acute',
            'Aggression': 'Aggression',
            'Burn Chemical': 'BurnChemical',
            'Threatened limb': 'Threatened limb',
            'Poisoning': 'Poisoning',
            'Overdose': 'Overdose',
            'Coughing blood': 'Coughing blood',
            'Eye injury': 'Eye injury',
            'Chest pain': 'Chest pain',
            'Dislocation of larger joint':
              'Dislocation of larger jointnot finger or toe',
            'Vomiting fresh blood': 'Vomiting fresh blood',
            'Stabbed neck': 'Stabbed neck',
            'Fractured - compound': 'Fractured - compoundwith a break in skin',
            'Hemorrhage Uncontrolled': 'Hemorrhage Uncontrolledarterial bleed',
            'Seizure - post ictal': 'Seizure - post ictal',
            'Severe pain': 'Severe pain',
            'Burn Moderate severity': 'BurnModerate severity',
            'Haemorrhage Controlled': 'HaemorrhageControlled',
            'Dislocation of finger': 'Dislocation of finger',
            'Dislocation of toe joint': 'Dislocation of toe joint',
            'Burn Other': 'BurnOther',
            'Pregnancy and abdominal trauma': 'Pregnancy and abdominal trauma',
            'Pregnancy and abdominal pain': 'Pregnancy and abdominal pain',
            'Persistent vomiting': 'Persistent vomiting',
            'Moderate pain': 'Moderate pain',
          },
        })
      },
    )
  })

  describeParallel('POST', () => {
    itParallel(
      'inserts a simple warning sign finding without qualifiers',
      async () => {
        const { $, clinic, encounter } = await setupTriage({
          patient_demographics: {},
          warning_signs: asWarningSigns(['Cardiac arrest']),
        })

        assertEquals(
          $.url,
          `${route}/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/triage/brief_history`,
        )

        const this_patient_findings = await patient_findings.findAll(db, {
          patient_id: encounter.patient.id,
        })

        assertMatches(this_patient_findings, [
          {
            'record_id': z.string().uuid(),
            'created_at': z.date(),
            'root_snomed_concept': {
              'name': 'Clinical finding',
              'category': 'finding',
              'snomed_concept_id': CLINICAL_FINDING.id,
            },
            'specific_snomed_concept': {
              'snomed_concept_id': '410429000',
            },
            'patient_encounter_id': encounter.patient_encounter_id,
            'as_part_of_procedure': {
              'record_id': z.string().uuid(),
              'root_snomed_concept': {
                'snomed_concept_id': '71388002',
                'name': 'Procedure',
                'category': 'procedure',
              },
              'specific_snomed_concept': {
                'snomed_concept_id': '245581009',
                'name': 'Emergency examination for triage',
                'category': 'procedure',
              },
            },
          },
        ])
      },
    )

    itParallel(
      'inserts a warning sign finding with nested qualifiers from the s_expression',
      async () => {
        const { encounter, getStep, postStep } = await setupTriage({
          patient_demographics: {},
          warning_signs: asWarningSigns(['Seizure']),
        })

        const this_patient_findings = await patient_findings.findAll(db, {
          patient_id: encounter.patient.id,
        })

        assertMatches(this_patient_findings, [
          {
            'record_id': z.string().uuid(),
            'created_at': z.date(),
            'root_snomed_concept': {
              'snomed_concept_id': CLINICAL_FINDING.id,
              'name': 'Clinical finding',
              'category': 'finding',
            },
            'patient_encounter_id': encounter.patient_encounter_id,
            'patient_encounter_employee_id': z.string().uuid(),
            'type': 'finding',
            'value': null,
            'specific_snomed_concept': {
              'snomed_concept_id': '91175000',
              'name': 'Seizure',
              'category': 'finding',
            },
            'as_part_of_procedure': {
              'record_id': z.string().uuid(),
              'root_snomed_concept': {
                'snomed_concept_id': '71388002',
                'name': 'Procedure',
                'category': 'procedure',
              },
              'specific_snomed_concept': {
                'snomed_concept_id': '245581009',
                'name': 'Emergency examination for triage',
                'category': 'procedure',
              },
            },
            'priority': 'Emergency',
            'score': null,
            'displays': {
              'finding': 'Current Seizure',
              'full': 'Current Seizure',
              'value': null,
            },
            'modifiers': z.array(z.any()),
            'destination_relations': [],
            'source_relations': [],
            'evaluations': z.array(z.any()),
            'attributes': [],
          },
        ], { strict: true })

        const $ = await getStep('warning_signs')
        const form_values = getFormValues($)
        assertMatches(form_values, {
          'warning_signs': {
            'seizure': {
              's_expression':
                '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Seizure" "finding") (qualifier (snomed_concept "Current" "qualifier value")))',
              'warning_sign_key': 'Seizure',
              'priority_level': 'Emergency',
              'existing_record': {
                'id': z.string().uuid(),
              },
              'existence': 'Yes',
            },
            'dislocation-of-larger-joint': {
              's_expression':
                '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Dislocation" "morphologic abnormality"))',
              'warning_sign_key': 'Dislocation of larger joint',
              'priority_level': 'Very urgent',
            },
          },
        })

        // Repost without modification
        await postStep({
          // deno-lint-ignore no-explicit-any
          warning_signs: form_values as any,
        })

        const this_patient_findings2 = await patient_findings.findAll(db, {
          patient_id: encounter.patient.id,
        })

        assertLength(this_patient_findings2, 1)
      },
    )

    itParallel(
      'inserts multiple warning sign findings when multiple are selected',
      async () => {
        const { encounter } = await setupTriage({
          patient_demographics: {},
          warning_signs: asWarningSigns(['Cardiac arrest', 'Chest pain']),
        })

        const this_patient_findings = await patient_findings.findAll(db, {
          patient_id: encounter.patient.id,
        })

        assertEquals(this_patient_findings.length, 2)

        // Both should be Clinical findings with the appropriate qualifiers
        const cardiac_arrest_finding = this_patient_findings.find((f) =>
          f.specific_snomed_concept.snomed_concept_id === '410429000'
        )
        const chest_pain_finding = this_patient_findings.find((f) =>
          f.specific_snomed_concept.snomed_concept_id === '29857009'
        )

        assertMatches(cardiac_arrest_finding, {
          'root_snomed_concept': {
            'snomed_concept_id': CLINICAL_FINDING.id,
            'name': 'Clinical finding',
          },
          'specific_snomed_concept': {
            'snomed_concept_id': '410429000',
          },
        })

        assertMatches(chest_pain_finding, {
          'root_snomed_concept': {
            'snomed_concept_id': CLINICAL_FINDING.id,
            'name': 'Clinical finding',
          },
          'specific_snomed_concept': {
            'snomed_concept_id': '29857009',
          },
        })
      },
    )

    itParallel(
      'marks a warning sign as having been entered in error if a second POST on the same page does not include a warning sign originally submitted',
      async () => {
        const { clinic, nurse, encounter } = await setupTriage({
          patient_demographics: {},
          warning_signs: asWarningSigns(['Chest pain']),
        })

        assertLength(
          await patient_findings.findAll(db, {
            patient_id: encounter.patient.id,
          }),
          1,
        )

        await nurse.fetchOk(
          `${route}/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/triage/warning_signs`,
          {
            method: 'POST',
          },
          {
            cancel_response_body: true,
          },
        )

        assertLength(
          await patient_findings.findAll(db, {
            patient_id: encounter.patient.id,
          }),
          0,
        )
      },
    )

    itParallel(
      'does not insert any findings when no warning signs are selected',
      async () => {
        const { $, clinic, encounter } = await setupTriage({
          patient_demographics: {},
          warning_signs: { warning_signs: {} },
        })

        assertEquals(
          $.url,
          `${route}/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/triage/brief_history`,
        )

        const this_patient_findings = await patient_findings.findAll(db, {
          patient_id: encounter.patient.id,
        })

        assertEquals(this_patient_findings.length, 0)
      },
    )

    itParallel(
      'does not save warning signs already made during the encounter',
      async () => {
        const { encounter, getStep, postStep } = await setupTriage({
          patient_demographics: {},
          warning_signs: asWarningSigns(['Chest pain']),
        })

        const findings_count_after_first_insertion = await patient_findings
          .findAll(db, {
            patient_id: encounter.patient.id,
          })

        assertEquals(findings_count_after_first_insertion.length, 1)

        const $ = await getStep('warning_signs')
        const form_values = getFormValues($)
        assertMatches(form_values, {
          'warning_signs': {
            'chest-pain': {
              's_expression':
                '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Chest pain" "finding"))',
              'warning_sign_key': 'Chest pain',
              'priority_level': 'Very urgent',
              'existing_record': {
                'id': z.string().uuid(),
              },
              'existence': 'Yes',
            },
            'dislocation-of-larger-joint': {
              's_expression':
                '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Dislocation" "morphologic abnormality"))',
              'warning_sign_key': 'Dislocation of larger joint',
              'priority_level': 'Very urgent',
            },
          },
        })

        // Repost without modification
        await postStep({
          // deno-lint-ignore no-explicit-any
          warning_signs: form_values as any,
        })

        const findings_count_after_second_insertion = await patient_findings
          .countAll(db, {
            patient_id: encounter.patient.id,
          })

        assertEquals(findings_count_after_second_insertion, 1)
      },
    )

    itParallel(
      'does save identical warning concepts made during different encounters',
      async () => {
        const { clinic, nurse, encounter: initial_encounter } =
          await setupTriage({
            patient_demographics: {},
            warning_signs: asWarningSigns(['Chest pain']),
          })

        const findings_count_after_first_insertion = await patient_findings
          .findAll(db, {
            patient_id: initial_encounter.patient.id,
          })

        assertEquals(findings_count_after_first_insertion.length, 1)

        await patient_encounters.close(db, {
          patient_encounter_id: initial_encounter.patient_encounter_id,
        })

        const subsequent_encounter =
          await insertReturningSeekingTreatmentWithEmployeeForTest(
            db,
            nurse.health_worker.organization_id,
            {
              patient_id: initial_encounter.patient.id,
              employment_id: nurse.health_worker.employee_id,
            },
          )

        await nurse.fetchOk(
          `${route}/app/organizations/${clinic.id}/patients/${subsequent_encounter.patient.id}/open_encounter/triage/warning_signs`,
          {
            method: 'POST',
            body: asFormData(asWarningSigns(['Chest pain'])),
          },
          {
            cancel_response_body: true,
          },
        )

        const findings_count_after_second_insertion = await patient_findings
          .countAll(db, {
            patient_id: initial_encounter.patient.id,
          })

        assertEquals(findings_count_after_second_insertion, 2)
      },
    )

    itParallel(
      'saves findings other than warning signs (those selected via search)',
      async () => {
        const { clinic, nurse, encounter } = await setupTriage({
          patient_demographics: {},
          warning_signs: {
            warning_signs: {
              'Pain of ear': {
                existence: 'Yes',
                priority_level: 'Non-urgent',
                s_expression:
                  `(finding ${CLINICAL_FINDING.s_expression} (snomed_concept "Pain of ear" "finding"))`,
              },
            },
          },
        })

        const [finding] = await patient_findings.findAll(db, {
          patient_id: encounter.patient.id,
        })

        assertMatches(finding, {
          root_snomed_concept: {
            snomed_concept_id: CLINICAL_FINDING.id,
          },
          specific_snomed_concept: {
            name: 'Pain of ear',
          },
          priority: 'Non-urgent',
        })

        const $ = await nurse.fetchCheerio(
          `${route}/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/triage/warning_signs`,
        )

        assertEquals(
          $('#priority-grid-non-urgent').text(),
          'Non-urgentPain of earfinding',
        )

        // Posting again has no effect
        await nurse.fetchOk(
          `${route}/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/triage/warning_signs`,
          {
            method: 'POST',
            body: asFormData({
              warning_signs: {
                'Pain of ear':
                  `(finding ${CLINICAL_FINDING.s_expression} (snomed_concept "Pain of ear" "finding"))`,
              },
            }),
          },
          {
            cancel_response_body: true,
          },
        )

        const subsequent_findings = await patient_findings.findAll(db, {
          patient_id: encounter.patient.id,
        })
        assertLength(subsequent_findings, 1)
      },
    )

    itParallel(
      'saves findings other than warning signs, including a priority level if the concept is a descendant of a warning sign',
      async () => {
        const { clinic, nurse, encounter, getStep, postStep } =
          await setupTriage({
            patient_demographics: {},
            early_brief_history: {
              diabetes: { existence: 'No' },
              pregnancy: { existence: 'Yes' },
            },
          })

        const warning_signs_route =
          `/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/snomed-warning-signs`
        const { results } = await nurse.fetchJson(
          `${warning_signs_route}?search=appendicular+pain`,
        )
        assertEquals(results[0], {
          clinical_finding_s_expression:
            '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Appendicular pain" "finding"))',
          snomed_concept_id: '275406005',
          sats_primary_name: 'Appendicular pain',
          sats_secondary_text: 'finding',
          sats_priority: 'Very urgent',
          sats_priority_by_virtue_of_matching_warning_sign:
            'Pregnancy and abdominal pain',
          similarity: 1,
        })

        await postStep({
          warning_signs: {
            warning_signs: {
              's275406005': {
                existence: 'Yes',
                priority_level: results[0].sats_priority,
                s_expression: results[0].clinical_finding_s_expression,
              },
            },
          },
        })

        const findings = await patient_findings.findAll(db, {
          patient_id: encounter.patient.id,
          s_expression: `(not (finding ${STATUS_ATTRIBUTE.id}))`,
        })
        assertLength(findings, 1)

        assertMatches(findings[0], {
          root_snomed_concept: {
            snomed_concept_id: CLINICAL_FINDING.id,
          },
          specific_snomed_concept: {
            name: 'Appendicular pain',
          },
          priority: 'Very urgent',
        })

        const $ = await getStep('warning_signs')

        assertIncludes(
          $('#priority-grid-very-urgent').text(),
          'Appendicular pain',
        )
      },
    )

    itParallel(
      'creates an additional task to check for a head injury with watery discharge',
      async () => {
        const { nurse, encounter } = await setupTriage({
          patient_demographics: {},
          early_brief_history: {
            diabetes: { existence: 'No' },
            pregnancy: { existence: 'Yes' },
          },
          warning_signs: {
            warning_signs: {
              's275406005': {
                existence: 'Yes',
                priority_level: 'Non-urgent',
                s_expression:
                  `(finding ${CLINICAL_FINDING.s_expression} (snomed_concept "Nasal discharge" "finding"))`,
              },
            },
          },
        })

        const findings = await patient_findings.findAll(db, {
          patient_id: encounter.patient.id,
          s_expression: `(not (finding ${STATUS_ATTRIBUTE.id}))`,
        })
        assertLength(findings, 1)

        assertMatches(findings[0], {
          root_snomed_concept: {
            snomed_concept_id: CLINICAL_FINDING.id,
          },
          specific_snomed_concept: {
            name: 'Nasal discharge',
          },
          priority: 'Non-urgent',
        })

        await events.allProcessedForEncounter(db, {
          patient_encounter_id: encounter.patient_encounter_id,
        })

        const task_groups = await additional_tasks.getTasksGroups(db, {
          encounter,
          health_worker_id: nurse.health_worker.id,
        })

        console.log(humanReadableJson(task_groups))

        assertLength(task_groups, 1)
      },
    )

    function testRoundTrip(sign: WarningSign, pregnant: boolean) {
      itParallel(
        `renders the page with the ${sign.key} sign checked after having submitted it (TODO emergency logic will be different probably)`,
        async () => {
          const { clinic, nurse, encounter } = await setupTriage({
            patient_demographics: {},
            early_brief_history: pregnant
              ? {
                diabetes: { existence: 'No' },
                pregnancy: { existence: 'Yes' },
              }
              : undefined,
            warning_signs: asWarningSigns([sign.key]),
          })

          const receptionist = await addTestEmployeeWithSession(db, {
            profession: 'receptionist',
            registration_status: 'approved',
            organization_id: clinic.id,
          })

          const $warning_signs = await nurse.fetchCheerio(
            `/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/triage/warning_signs`,
          )

          assertEquals(
            $warning_signs('#patient-drawer-priority').text(),
            sign.sats_priority,
          )

          const form_values = getFormValues($warning_signs)
          const hyphenated_key = hyphenate(sign.key.toLowerCase())
          assertMatches(form_values, {
            warning_signs: {
              [hyphenated_key]: {
                warning_sign_key: sign.key,
                priority_level: sign.sats_priority,
                s_expression: sign.clinical_finding_s_expression,
              },
            },
          })

          const $waiting_room = await receptionist.fetchCheerio(
            `/app/organizations/${clinic.id}/waiting_room`,
          )

          const waiting_room_table = getTableDisplay($waiting_room)
          assertMatches(waiting_room_table, [{
            Priority: sign.sats_priority,
          }])
        },
      )
    }

    for (const sign of values(WARNING_SIGNS)) {
      const pregnant = [
        'Pregnancy and abdominal pain',
        'Pregnancy and abdominal trauma',
      ].includes(sign.key)

      testRoundTrip(sign, pregnant)
    }

    // When you just want to test one. This is a good test to exercise s_expression
    // testRoundTrip(WARNING_SIGNS['Burn Other'], false)
  })
})
