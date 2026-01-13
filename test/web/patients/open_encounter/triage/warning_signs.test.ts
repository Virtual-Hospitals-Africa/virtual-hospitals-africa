import { describeParallel, itParallel, TestOpts } from 'test/_helpers/testParallel.ts'
import { afterAll, before } from 'std/testing/bdd.ts'
import db from '../../../../../db/db.ts'
import { addTestEmployeeWithSession } from '../../../../_helpers/employees.ts'
import { insertReturningSeekingTreatmentWithEmployeeForTest } from '../../../../_helpers/workflows.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import waitUntilTestServerUp from '../../../../_helpers/waitUntilTestServerUp.ts'
import { getFormValues } from '../../../../_helpers/form.ts'
import { patient_findings } from '../../../../../db/models/patient_findings.ts'
import { assertMatches } from '../../../../../util/assertMatches.ts'
import { z } from 'zod'
import { patient_encounters } from '../../../../../db/models/patient_encounters.ts'
import { KEYED_WARNING_SIGNS } from '../../../../../shared/warning_signs.ts'
import { brief_history } from '../../../../../db/models/brief_history.ts'
import { assert } from 'std/assert/assert.ts'
import { WarningSign } from '../../../../../types.ts'
import assertLength from '../../../../../util/assertLength.ts'
import { getTableDisplay } from '../../../../_helpers/table.ts'
import { COMMON_CONDITIONS } from '../../../../../shared/brief_history.ts'
import { CLINICAL_FINDING, STATUS_ATTRIBUTE } from '../../../../../shared/snomed_concepts.ts'
import assertIncludes from '../../../../../util/assertIncludes.ts'
import { additional_tasks } from '../../../../../db/models/additional_tasks.ts'
import { asWarningSigns, setupTriageNewPatient } from './_setup.ts'
import { hyphenate } from '../../../../../util/hyphenate.ts'
import { events } from '../../../../../db/models/events.ts'
import { asResultAsync } from '../../../../../util/asResult.ts'
import values from '../../../../../util/values.ts'
import { humanReadableJson } from '../../../../../util/humanReadableJson.ts'
import keys from '../../../../../util/keys.ts'
import { getGridDisplay } from 'test/_helpers/grid.ts'

describeParallel('triage/warning_signs', () => {
  before(waitUntilTestServerUp)
  afterAll(() => db.destroy())
  afterAll(() => events.closeAllProcessedPubSub({ graceful: false }))

  describeParallel('GET', () => {
    itParallel(
      'renders a warning signs page when patient not known to be pregnant',
      async () => {
        const { $ } = await setupTriageNewPatient({
          patient_demographics: {},
        })

        const expected = {
          'Emergency': [
            'Obstructed airwayNot breathing',
            'Cardiac arrestHeart attack',
            'SeizureCurrent',
            'BurnFacial',
            'BurnInhalation',
          ],
          'Very urgent': [
            'Shortness of breathacute',
            'Chest pain',
            'SeizurePost ictal',
            'Focal neurologyacute; Stroke',
            'BurnChemical',
            'Coughing blood',
            'PoisoningOverdose',
            'Aggression',
            'Severe limb ischemiaThreatened limb',
            'BurnCircumferential',
            'Vomiting fresh blood',
            'High energy transferSevere mechanism of injury',
            'Stabbed neck',
            'Eye injury',
            'BurnOver 20%',
            'HaemorrhageUncontrolled',
            'Dislocation of larger jointnot finger or toe',
            'Compound fracturewith a break in the skin',
            'Severe pain',
            'BurnModerate severity',
          ],
          'Urgent': [
            'Persistent vomiting',
            'Dislocation of finger',
            'Closed fractureno break in the skin',
            'Moderate pain',
            'BurnOther',
            'HaemorrhageControlled',
            'Dislocation of toe joint',
            'Abdominal pain',
          ],
          'Common Symptoms': [
            'Nasal discharge',
            'Fever',
            'Cough',
            'Sore throat',
            'Headache',
            'Fatigue',
            'Shortness of breath',
            'Nausea',
            'Vomiting',
            'Diarrhea',
            'Dizziness',
            'Muscle pain',
            'Pain of joint',
            'Back pain',
            'Constipation',
          ],
        }

        assertEquals($('.priority-table').length, Object.keys(expected).length)

        const actual: typeof expected = {} as unknown as typeof expected
        for (const category of keys(expected)) {
          const grid_display = getGridDisplay($, `.priority-table[data-category="${category}"] > .grid`)
          actual[category] = grid_display
        }

        assertEquals(actual, expected)
      },
    )

    itParallel(
      'renders the pregnancy-specific signs when the patient is pregnant',
      async () => {
        const { nurse, encounter, patient_id, patient_encounter_id, getStep } = await setupTriageNewPatient({
          patient_demographics: {},
          early_brief_history: {
            diabetes: { existence: 'No' },
            pregnancy: { existence: 'Yes' },
          },
        })

        const most_recent_findings = await brief_history
          .renderedMostRecentFindings(db, {
            patient_id,
            encounter,
            health_worker_id: nurse.health_worker.id,
            conditions: COMMON_CONDITIONS,
          })
        assert(most_recent_findings.pregnancy)

        await patient_encounters.close(db, {
          patient_encounter_id,
        })

        const result = await asResultAsync(() => getStep('warning_signs'))
        assert(
          !result.success,
          'Because we closed the earlier patient_id, we expect this to fail. But when we open a new one below we expect that to succeed',
        )
        assertIncludes(
          result.error.message,
          '[404]: No open encounter for this patient at this organization',
        )

        await insertReturningSeekingTreatmentWithEmployeeForTest(
          db,
          nurse.health_worker.organization_id,
          {
            patient_id,
            employment_id: nurse.health_worker.employee_id,
          },
        )

        const $warning_signs = await getStep('warning_signs')

        const form_values = getFormValues($warning_signs)
        assertMatches(form_values, {
          'warning_signs': {
            'very-urgent-pregnancy-and-abdominal-trauma': {
              'existence': 'No',
              's_expression': KEYED_WARNING_SIGNS['Pregnancy and abdominal trauma'].clinical_finding_s_expression,
            },
            'very-urgent-pregnancy-and-abdominal-pain': {
              'existence': 'No',
              's_expression': KEYED_WARNING_SIGNS['Pregnancy and abdominal pain'].clinical_finding_s_expression,
            },
            'very-urgent-severe-limb-ischemia': {
              'existence': 'No',
              's_expression': KEYED_WARNING_SIGNS['Severe limb ischemia'].clinical_finding_s_expression,
            },
          },
        })

        assert(!form_values['warning_signs']['urgent-abdominal-pain'])
      },
    )
  })

  describeParallel('POST', () => {
    itParallel(
      'inserts a simple warning sign finding without qualifiers',
      async () => {
        const { patient_id, patient_encounter_id } = await setupTriageNewPatient({
          patient_demographics: {},
          warning_signs: asWarningSigns(['Cardiac arrest'], { pregnant: false }),
        })

        const this_patient_findings = await patient_findings.findAll(db, {
          patient_id,
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
            'patient_encounter_id': patient_encounter_id,
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
        const { patient_id, patient_encounter_id, getStep, postStep } = await setupTriageNewPatient({
          patient_demographics: {},
          warning_signs: asWarningSigns(['Seizure'], { pregnant: false }),
        })

        const this_patient_findings = await patient_findings.findAll(db, {
          patient_id,
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
            'patient_encounter_id': patient_encounter_id,
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
              'finding': 'Seizure',
              'full': 'Seizure',
              'value': null,
            },
            'modifiers': z.array(z.any()),
            'destination_relations': [],
            'source_relations': [],
            'evaluations': z.array(z.any()),
            'attributes': [],
            'existence': 'Yes',
          },
        ], { strict: true })

        const $ = await getStep('warning_signs')
        const form_values = getFormValues($)
        assertMatches(form_values, {
          'warning_signs': {
            'emergency-seizure': {
              's_expression': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Seizure" "finding"))',
              'warning_sign_key': 'Seizure',
              'priority_level': 'Emergency',
              'existing_record': {
                'id': z.string().uuid(),
              },
              'existence': 'Yes',
            },
            'very-urgent-dislocation-of-larger-joint': {
              's_expression': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Dislocation" "morphologic abnormality"))',
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
          patient_id,
        })

        assertLength(this_patient_findings2, 1)
      },
    )

    itParallel(
      'inserts multiple warning sign findings when multiple are selected',
      async () => {
        const { patient_id } = await setupTriageNewPatient({
          patient_demographics: {},
          warning_signs: asWarningSigns(['Cardiac arrest', 'Chest pain'], { pregnant: false }),
        })

        const this_patient_findings = await patient_findings.findAll(db, {
          patient_id,
        })

        assertEquals(this_patient_findings.length, 2)

        // Both should be Clinical findings with the appropriate qualifiers
        const cardiac_arrest_finding = this_patient_findings.find((f) => f.specific_snomed_concept.snomed_concept_id === '410429000')
        const chest_pain_finding = this_patient_findings.find((f) => f.specific_snomed_concept.snomed_concept_id === '29857009')

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
      'marks a warning sign as having been entered in error if a second POST on the same page modifies it',
      async () => {
        const { patient_id, getStep, postStep } = await setupTriageNewPatient({
          patient_demographics: {},
          warning_signs: asWarningSigns(['Chest pain'], { pregnant: false }),
        })

        assertLength(
          await patient_findings.findAll(db, {
            patient_id,
          }),
          1,
        )

        const $ = await getStep('warning_signs')
        const form_values = getFormValues($)

        assertMatches(form_values, {
          'warning_signs': {
            'very-urgent-high-energy-transfer': {
              's_expression': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Injury caused by causative force" "disorder"))',
              'warning_sign_key': 'High energy transfer',
              'priority_level': 'Very urgent',
              'existing_record': {
                'id': z.string().uuid(),
                'altered': false,
              },
            },
            'very-urgent-chest-pain': {
              's_expression': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Chest pain" "finding"))',
              'warning_sign_key': 'Chest pain',
              'priority_level': 'Very urgent',
              'existing_record': {
                'id': z.string().uuid(),
                'altered': false,
              },
              'existence': 'Yes',
            },
          },
        })

        const next_form_submission = structuredClone(form_values)
        // @ts-ignore the frontend sends this back blank
        delete next_form_submission.warning_signs['very-urgent-chest-pain'].existence
        next_form_submission.warning_signs['very-urgent-chest-pain'].existing_record
          .altered = true

        await postStep({
          // deno-lint-ignore no-explicit-any
          warning_signs: next_form_submission as any,
        })

        assertLength(
          await patient_findings.findAll(db, {
            patient_id,
          }),
          0,
        )
      },
    )

    itParallel(
      '409s if the client fails to include previously submitted records',
      async () => {
        const { patient_id, getStep, postStep } = await setupTriageNewPatient({
          patient_demographics: {},
          warning_signs: asWarningSigns(['Chest pain'], { pregnant: false }),
        })

        assertLength(
          await patient_findings.findAll(db, {
            patient_id,
          }),
          1,
        )

        const $ = await getStep('warning_signs')
        const form_values = getFormValues($)

        assertMatches(form_values, {
          'warning_signs': {
            'very-urgent-high-energy-transfer': {
              's_expression': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Injury caused by causative force" "disorder"))',
              'warning_sign_key': 'High energy transfer',
              'priority_level': 'Very urgent',
              'existing_record': {
                'id': z.string().uuid(),
                'altered': false,
              },
            },
            'very-urgent-chest-pain': {
              's_expression': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Chest pain" "finding"))',
              'warning_sign_key': 'Chest pain',
              'priority_level': 'Very urgent',
              'existing_record': {
                'id': z.string().uuid(),
                'altered': false,
              },
              'existence': 'Yes',
            },
          },
        })

        const next_form_submission = structuredClone(form_values)
        // @ts-ignore deleting chest-pain entirely
        delete next_form_submission.warning_signs['very-urgent-chest-pain']

        const result = await asResultAsync(() =>
          postStep({
            // deno-lint-ignore no-explicit-any
            warning_signs: next_form_submission as any,
          })
        )

        assert(!result.success)
        assertIncludes(
          result.error.message,
          '[409]: It is expected that the frontend resubmit previously submitted records',
        )
      },
    )

    itParallel(
      '409s if the client fails to mark records as altered when they were',
      async () => {
        const { patient_id, getStep, postStep } = await setupTriageNewPatient({
          patient_demographics: {},
          warning_signs: asWarningSigns(['Chest pain'], { pregnant: false }),
        })

        assertLength(
          await patient_findings.findAll(db, {
            patient_id,
          }),
          1,
        )

        const $ = await getStep('warning_signs')
        const form_values = getFormValues($)

        assertMatches(form_values, {
          'warning_signs': {
            'very-urgent-high-energy-transfer': {
              's_expression': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Injury caused by causative force" "disorder"))',
              'warning_sign_key': 'High energy transfer',
              'priority_level': 'Very urgent',
              'existing_record': {
                'id': z.string().uuid(),
                'altered': false,
              },
            },
            'very-urgent-chest-pain': {
              's_expression': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Chest pain" "finding"))',
              'warning_sign_key': 'Chest pain',
              'priority_level': 'Very urgent',
              'existing_record': {
                'id': z.string().uuid(),
                'altered': false,
              },
              'existence': 'Yes',
            },
          },
        })

        const next_form_submission = structuredClone(form_values)
        Object.assign(
          next_form_submission.warning_signs['very-urgent-high-energy-transfer'],
          {
            existence: 'Yes',
          },
        )

        const result = await asResultAsync(() =>
          postStep({
            // deno-lint-ignore no-explicit-any
            warning_signs: next_form_submission as any,
          })
        )

        assert(!result.success)
        assertEquals(
          result.error.message.split('\n')[0],
          `[409]: It is expected that the frontend keep track of whether the previously submitted record was altered. Detected a mismatch for ${
            form_values.warning_signs['very-urgent-high-energy-transfer'].existing_record.id
          } which had existence: No, but just_submitted.existence: Yes`,
        )
      },
    )

    itParallel(
      'does not insert any positive findings when no warning signs are selected, but still inserts negative findings',
      async () => {
        const { patient_id } = await setupTriageNewPatient({
          patient_demographics: {},
          warning_signs: asWarningSigns([], { pregnant: false }),
        })

        const positive_findings_count = await patient_findings.countAll(db, { patient_id })
        assertEquals(positive_findings_count, 0)

        const negative_findings_count = await patient_findings.countAll(db, { patient_id, include_negative: true })
        const number_of_pregnancy_related_signs = 2
        assertEquals(negative_findings_count, keys(KEYED_WARNING_SIGNS).length - number_of_pregnancy_related_signs)
      },
    )

    itParallel(
      'does not save warning signs already made during the encounter',
      async () => {
        const { patient_id, getStep, postStep } = await setupTriageNewPatient({
          patient_demographics: {},
          warning_signs: asWarningSigns(['Chest pain'], { pregnant: false }),
        })

        const findings_count_after_first_insertion = await patient_findings
          .findAll(db, { patient_id })

        assertEquals(findings_count_after_first_insertion.length, 1)

        const $ = await getStep('warning_signs')
        const form_values = getFormValues($)
        assertMatches(form_values, {
          'warning_signs': {
            'very-urgent-chest-pain': {
              's_expression': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Chest pain" "finding"))',
              'warning_sign_key': 'Chest pain',
              'priority_level': 'Very urgent',
              'existing_record': {
                'id': z.string().uuid(),
              },
              'existence': 'Yes',
            },
            'very-urgent-dislocation-of-larger-joint': {
              's_expression': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Dislocation" "morphologic abnormality"))',
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
            patient_id,
          })

        assertEquals(findings_count_after_second_insertion, 1)
      },
    )

    itParallel(
      'does save identical warning concepts made during different encounters',
      async () => {
        const { nurse, patient_id, patient_encounter_id, postStep } = await setupTriageNewPatient({
          patient_demographics: {},
          warning_signs: asWarningSigns(['Chest pain'], { pregnant: false }),
        })

        const findings_count_after_first_insertion = await patient_findings
          .findAll(db, {
            patient_id,
          })

        assertEquals(findings_count_after_first_insertion.length, 1)

        await patient_encounters.close(db, { patient_encounter_id })

        await insertReturningSeekingTreatmentWithEmployeeForTest(
          db,
          nurse.health_worker.organization_id,
          {
            patient_id,
            employment_id: nurse.health_worker.employee_id,
          },
        )

        await postStep({
          warning_signs: asWarningSigns(['Chest pain'], { pregnant: false }),
        })

        const findings_count_after_second_insertion = await patient_findings
          .countAll(db, { patient_id })

        assertEquals(findings_count_after_second_insertion, 2)
      },
    )

    itParallel(
      'saves findings other than warning signs (those selected via search)',
      async () => {
        const { patient_id, getStep, postStep } = await setupTriageNewPatient({
          patient_demographics: {},
          warning_signs: {
            warning_signs: {
              ...asWarningSigns([], { pregnant: false }).warning_signs,
              'Pain of ear': {
                existence: 'Yes' as const,
                priority_level: 'Non-urgent' as const,
                s_expression: `(clinical_finding (snomed_concept "Pain of ear" "finding"))`,
              },
            },
          },
        })

        const [finding] = await patient_findings.findAll(db, {
          patient_id,
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

        const $ = await getStep('warning_signs')

        assertEquals(
          $('#warning-signs-selected-chips').text(),
          'Pain of ear',
        )

        // Posting again has no effect
        await postStep({
          // deno-lint-ignore no-explicit-any
          warning_signs: getFormValues($) as any,
        })

        const subsequent_findings = await patient_findings.findAll(db, {
          patient_id,
        })
        assertLength(subsequent_findings, 1)
      },
    )

    itParallel(
      'saves findings other than warning signs, including a priority level if the concept is a descendant of a warning sign',
      async () => {
        const { $, clinic, nurse, patient_id, getStep, postStep } = await setupTriageNewPatient({
          patient_demographics: {},
          early_brief_history: {
            diabetes: { existence: 'No' },
            pregnancy: { existence: 'Yes' },
          },
        })

        const search_route = $('#warning-signs-search').attr(
          'data-searchroute',
        )

        assertEquals(
          search_route,
          `/app/organizations/${clinic.id}/patients/${patient_id}/open_encounter/snomed-warning-signs`,
        )

        const { results } = await nurse.fetchJson(
          `${search_route}?search=appendicular+pain`,
        )
        assertEquals(results[0], {
          category: 'Search Results',
          clinical_finding_s_expression: '(clinical_finding (snomed_concept "Appendicular pain" "finding"))',
          snomed_concept_id: '275406005',
          primary_name: 'Appendicular pain',
          secondary_text: 'finding',
          sats_priority: 'Very urgent',
          sats_priority_by_virtue_of_matching_warning_sign: 'Pregnancy and abdominal pain',
          similarity: 1,
        })

        // deno-lint-ignore no-explicit-any
        const form_values = getFormValues($) as any

        form_values.warning_signs['s275406005'] = {
          existence: 'Yes',
          priority_level: results[0].sats_priority,
          s_expression: results[0].clinical_finding_s_expression,
        }

        await postStep({
          warning_signs: form_values,
        })

        const findings = await patient_findings.findAll(db, {
          patient_id,
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

        const $reload = await getStep('warning_signs')

        assertIncludes(
          $reload('#warning-signs-selected-chips').text(),
          'Appendicular pain',
        )
      },
    )

    itParallel(
      'creates an additional task to check for a head injury with watery discharge',
      async () => {
        const { nurse, encounter, patient_id, patient_encounter_id } = await setupTriageNewPatient({
          patient_demographics: {},
          warning_signs: {
            warning_signs: {
              ...asWarningSigns([], { pregnant: false }).warning_signs,
              's275406005': {
                existence: 'Yes',
                priority_level: 'Non-urgent',
                s_expression: `(clinical_finding (snomed_concept "Nasal discharge" "finding"))`,
              },
            },
          },
        })

        const findings = await patient_findings.findAll(db, {
          patient_id,
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
          patient_encounter_id,
        })

        const task_groups = await additional_tasks.getTasksGroups(db, {
          encounter,
          health_worker_id: nurse.health_worker.id,
        })

        assertLength(task_groups, 1)
      },
    )

    function testRoundTrip(sign: WarningSign, pregnant: boolean, opts?: TestOpts) {
      itParallel(
        `renders the page with the ${sign.key} sign checked after having submitted it (TODO emergency logic will be different probably)`,
        async () => {
          const { clinic, $, getStep } = await setupTriageNewPatient({
            patient_demographics: {},
            early_brief_history: pregnant
              ? {
                diabetes: { existence: 'No' },
                pregnancy: { existence: 'Yes' },
              }
              : undefined,
            warning_signs: asWarningSigns([sign.key], { pregnant }),
          })

          const receptionist = await addTestEmployeeWithSession(db, {
            profession: 'receptionist',
            registration_status: 'approved',
            organization_id: clinic.id,
          })

          assertEquals(
            $('#patient-drawer-priority').text(),
            sign.sats_priority,
            `mismatch for ${humanReadableJson(sign)}`,
          )

          const $warning_signs = await getStep('warning_signs')

          const form_values = getFormValues($warning_signs)
          const hyphenated_key = hyphenate(sign.sats_priority + '-' + sign.key.toLowerCase())
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
        opts,
      )
    }

    for (const sign of values(KEYED_WARNING_SIGNS)) {
      const pregnant = [
        'Pregnancy and abdominal pain',
        'Pregnancy and abdominal trauma',
      ].includes(sign.key)

      testRoundTrip(sign, pregnant)
    }

    /* Singletons to test */

    // Exercises s_expression
    // testRoundTrip(KEYED_WARNING_SIGNS['Burn Other'], false, { only: true })

    // Pregnancy
    // testRoundTrip(KEYED_WARNING_SIGNS['Pregnancy and abdominal pain'], true, { only: true })
  })
})
