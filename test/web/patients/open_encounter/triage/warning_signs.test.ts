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
import { CLINICAL_FINDING, PAIN_LEVEL, SEVERE_PAIN, STATUS_ATTRIBUTE } from '../../../../../shared/snomed_concepts.ts'
import assertIncludes from '../../../../../util/assertIncludes.ts'
import { additional_tasks } from '../../../../../db/models/additional_tasks.ts'
import { asWarningSignsAdult, asWarningSignsOlderChild, dateOfBirth, setupTriageNewPatient } from './_setup.ts'
import { events } from '../../../../../db/models/events.ts'
import { asResultAsync } from '../../../../../util/asResult.ts'
import values from '../../../../../util/values.ts'
import { humanReadableJson } from '../../../../../util/humanReadableJson.ts'
import keys from '../../../../../util/keys.ts'
import { getGridDisplay } from 'test/_helpers/grid.ts'
import { nobreak } from '../../../../../util/nobreak.ts'
import randomDemographics from '../../../../../mocks/randomDemographics.ts'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import { CheerioAPI } from 'cheerio'
import { TriageWarningSignsPostBody } from '../../../../../shared/warning_signs_post.ts'
import { normalForm, parseArrayWithSchema } from '../../../../../shared/s_expression.ts'
import { insertable_finding_base } from '../../../../../shared/s_expression_schemas.ts'
import { inverseSExpression } from '../../../../../shared/s_expression_inverse.ts'
import generateUUID from '../../../../../util/uuid.ts'
import { patient_findings_with_modifiers } from '../../../../../db/models/patient_findings_with_modifiers.ts'
import { findingSitesWithPriorRecords } from '../../../../../routes/app/organizations/[organization_id]/patients/[patient_id]/open_encounter/triage/warning_signs.tsx'

const COUGH = '(clinical_finding (snomed_concept "Cough" "finding"))'

/*
  Fresh hands the islands their props inside the boot script as one flat array of values
  indexed from one another, so the string literals in it are what can be read easily.
  Enough to see what the page handed the island.
*/
function islandStateStrings($: CheerioAPI): Set<string> {
  const scripts = $('script').toArray().map((script) => $(script).html() || '')
  const boot = scripts.find((text) => text.includes('boot('))
  assert(boot, `No boot script found in the page among scripts: ${scripts.map((text) => text.slice(0, 80)).join(' | ')}`)
  // The state is the longest string literal handed to boot, itself JSON
  const literals = [...boot.matchAll(/"(?:[^"\\]|\\.)*"/g)].map(([literal]) => JSON.parse(literal) as string)
  const state = literals.reduce((longest, literal) => literal.length > longest.length ? literal : longest, '')
  const strings = new Set<string>()
  const walk = (value: unknown) => {
    if (typeof value === 'string') strings.add(value)
    else if (Array.isArray(value)) value.forEach(walk)
    else if (isObjectLike(value)) values(value).forEach(walk)
  }
  walk(JSON.parse(state))
  return strings
}

/* The hidden inputs the warning signs page submits, see islands/WarningSigns/form_values.ts */
const WarningSignsForm = z.object({
  saved_record_ids: z.array(z.string().uuid()).default([]),
  none_of_these: z.object({ s_expressions: z.string() }),
})

function scrapedWarningSignsForm($: CheerioAPI): z.output<typeof WarningSignsForm> {
  return WarningSignsForm.parse(getFormValues($))
}

function noneOfThese(form: TriageWarningSignsPostBody): Set<string> {
  return new Set(parseArrayWithSchema(form.none_of_these.s_expressions, insertable_finding_base).map(inverseSExpression))
}

function signNormalForm(sign: WarningSign): string {
  return normalForm(sign.clinical_finding_s_expression)
}

/* What the finding modal's pain level input produces, see islands/finding/PainLevel.tsx */
const COUGH_WITH_SEVERE_PAIN = `(clinical_finding (snomed_concept "Cough" "finding") (attribute ${PAIN_LEVEL.s_expression} ${SEVERE_PAIN.s_expression}))`

describeParallel('triage/warning_signs', () => {
  before(waitUntilTestServerUp)
  afterAll(() => db.destroy())
  afterAll(() => events.closeAllProcessedPubSub({ graceful: false }))

  describeParallel('GET', () => {
    itParallel(
      'renders the host the floating side panels portal into, left of the patient drawer',
      async () => {
        const { $ } = await setupTriageNewPatient({
          patient_demographics: {},
        })

        // The follow-ups panel is rendered in this host and the priority escalation panel
        // portals into it, so without it in the server-rendered page neither appears.
        // See components/library/layout/side_panels.ts
        assertEquals($('#drawer-side-panels').length, 1)
        // Nothing to check for yet, so no panel
        assertEquals($('#follow-ups-panel').length, 0)
        // Outside the workflow's form, so that the panels' inputs are never submitted with it
        assertEquals($('form #drawer-side-panels').length, 0)
        assertEquals($('#patient-drawer').length, 1)
      },
    )

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
            'AggressionViolent or agressive behavior',
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
            'BurnModerate severity',
          ],
          'Urgent': [
            'Persistent vomiting',
            'Dislocation of finger',
            'Closed fractureno break in the skin',
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
            'Insect bite',
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
      'offers adults a filter by finding site, whose signs come from the guide page for that site and carry prior records',
      async () => {
        const { $, patient_id, patient_encounter_id, getStep, postClinicalFinding } = await setupTriageNewPatient({
          patient_demographics: {},
        })
        assertEquals($('#warning-signs-finding-site-filter button').length, 1)
        const strings = islandStateStrings($)
        assert(strings.has('Ear structure'), 'The ear should be among the sites handed to the island')
        assert(strings.has('Loss of scalp hair'), "The scalp page's findings should be handed to the island")

        // A finding recorded from a site's table shows as the record of that sign, without claiming it from the warning signs
        const record_id = await postClinicalFinding({
          s_expression: '(clinical_finding (snomed_concept "Pain of ear" "finding"))',
          priority_level: 'Non-urgent',
        })
        const $again = await getStep('warning_signs')
        assert(islandStateStrings($again).has(record_id))

        const prior_findings = await patient_findings_with_modifiers.findAll(db, {
          patient_id,
          patient_encounter_id,
          include_negative: true,
        })
        const finding_sites = findingSitesWithPriorRecords(prior_findings, 'adult')
        assertEquals(finding_sites.length, 23)
        const ear = finding_sites.find((site) => site.label === 'Ear')!
        assertMatches(ear, {
          label: 'Ear',
          snomed_concept: { name: 'Ear structure', category: 'body structure' },
          signs: z.array(z.object({ name: z.string(), category: z.literal('Ear') })),
        })
        assertMatches(ear.signs.find((sign) => sign.name === 'Pain of ear'), {
          key: 'Pain of ear',
          existing_record: { id: record_id, existence: 'Yes' },
        })
        assertEquals(ear.signs.find((sign) => sign.name === 'Tinnitus')!.existing_record, undefined)
      },
    )

    itParallel(
      'offers older children no filter by finding site, as the guide pages are for adults',
      async () => {
        const { $ } = await setupTriageNewPatient({
          patient_demographics: { date_of_birth: dateOfBirth('older child') },
        })
        assertEquals($('#warning-signs-finding-site-filter').length, 0)
        assert(!islandStateStrings($).has('Ear structure'))
        assertEquals(findingSitesWithPriorRecords([], 'older child'), [])
      },
    )

    itParallel(
      'renders the pregnancy-specific signs when the patient is pregnant',
      async () => {
        const { nurse, encounter, patient_id, patient_encounter_id, getStep } = await setupTriageNewPatient({
          patient_demographics: {},
          early_brief_history: {
            common_conditions: {
              diabetes: { existence: 'No' },
              pregnancy: { existence: 'Yes' },
            },
          },
        })

        const most_recent_findings = await brief_history
          .renderedMostRecentRecords(db, {
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
          '404',
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

        const form = scrapedWarningSignsForm($warning_signs)
        assertEquals(form.saved_record_ids, [])
        const none_of_these = noneOfThese(form)
        assert(none_of_these.has(signNormalForm(KEYED_WARNING_SIGNS['Pregnancy and abdominal trauma'])))
        assert(none_of_these.has(signNormalForm(KEYED_WARNING_SIGNS['Pregnancy and abdominal pain'])))
        assert(none_of_these.has(signNormalForm(KEYED_WARNING_SIGNS['Severe limb ischemia'])))
        // The pregnancy sign shares its s_expression with the general abdominal pain sign, which is not shown
        assertEquals($warning_signs('#very-urgent-pregnancy-and-abdominal-pain').length, 1)
        assertEquals($warning_signs('#urgent-abdominal-pain').length, 0)
      },
    )

    itParallel(
      'renders a warning signs page for an older child',
      async () => {
        const { $ } = await setupTriageNewPatient({
          patient_demographics: randomDemographics('ZA', 'female', 'older child'),
        })

        const expected = {
          'Emergency': {
            'Airway & Breathing': [
              'Not breathing or Reported apnoea',
              'Obstructed breathing',
              'Central cyanosis (SPO2 less than 92%)',
              'Respiratory distress (Severe)',
            ],
            'Circulation': [
              'Cold Hands',
              'Pulse weak & fast',
              'Capillary refill time (3 sec or more)',
              'Lethargic',
              'Uncontrolled bleeding (not nose bleed)',
            ],
            'Convulsions/Coma': [
              'Convulsing or Immediately Post-Ictal not alert',
              'AVPU: responds only To Pain (P)',
              'AVPU: Unresponsive (U)',
              'Confusion',
            ],
            'Dehydration': [
              'Diarrhoea or Vomiting',
              'Lethargy/ floppy infant',
              'Very sunken eyes',
              'Skin pinch very slow (2 secs or more)',
            ],
            'Other': [
              'Facial /Inhalation burn',
              'Hypoglycaemia recorded at any time',
              'Glucose less than 3mmol/L',
              'Purpuric rash',
            ],
          },
          'Very urgent': [
            'Tiny baby (Younger than 2 months)',
            'Inconsolable crying (Severe pain)',
            'Presenting complaint more sleepy than normal',
            'Poisoning or overdose',
            'Focal neurology acute',
            'Severe mechanism of injury',
            'Burn 10% or more (Circumferential, electrical, chemical)',
            'Eye Injury',
            'Fracture (Open or threatened limb)',
            'Dislocation of larger joint (not finger or toe)',
          ],
          'Urgent': [
            'Some respiratory distress',
            'Some Dehydration (Diarrhoea or Diarrhoea and vomiting)',
            'Sunken eyes',
            'Restless/ irritable',
            'Thirsty/decreased urine output',
            'Dry mouth',
            'Crying without tears',
            'Skin pinch slow (Less than 2 sec)',
            'Unable to drink /feed or vomit everything',
            'Malnutrition (Visible severe wasting)',
            'Malnutrition Oedema (pitting Oedema of both feet)',
            'Unwell child with known diabetes',
            'Any other burn less than 10%',
            'Closed fracture',
            'Dislocation of finger or toe',
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
            'Insect bite',
            'Back pain',
            'Constipation',
          ],
        }

        assertEquals($('.priority-table').length, Object.keys(expected).length)

        // deno-lint-ignore no-explicit-any
        const actual: any = {}
        for (const category of keys(expected)) {
          if (isObjectLike(expected[category])) {
            actual[category] = {}
            for (const subcategory of keys(expected[category])) {
              const grid_display = getGridDisplay($, `[data-subcategory="${subcategory}"] > .grid`)
              actual[category][subcategory] = grid_display
            }
          } else {
            const grid_display = getGridDisplay($, `.priority-table[data-category="${category}"] > .grid`)
            actual[category] = grid_display
          }
        }

        assertEquals(actual, expected)
      },
    )
  })

  describeParallel('POST', () => {
    itParallel(
      'inserts a simple warning sign finding without qualifiers',
      async () => {
        const { patient_id, patient_encounter_id } = await setupTriageNewPatient({
          patient_demographics: {},
          warning_signs: asWarningSignsAdult(['Cardiac arrest'], { pregnant: false }),
        })

        const this_patient_findings = await patient_findings.findAll(db, {
          patient_id,
        })

        assertMatches(this_patient_findings, [
          {
            'id': z.string().uuid(),
            'created_at': z.date(),
            'root_snomed_concept_name': 'Clinical finding',
            'root_snomed_concept_category': 'finding',
            'root_snomed_concept_id': CLINICAL_FINDING.id,
            'specific_snomed_concept_id': '410429000',
            'patient_encounter_id': patient_encounter_id,
            'as_part_of_procedure': {
              'id': z.string().uuid(),
              'root_snomed_concept_id': '71388002',
              'root_snomed_concept_name': 'Procedure',
              'root_snomed_concept_category': 'procedure',
              'specific_snomed_concept_id': '245581009',
              'specific_snomed_concept_name': 'Emergency examination for triage',
              'specific_snomed_concept_category': 'procedure',
            },
          },
        ])
      },
    )

    itParallel(
      'inserts a warning sign for an older child',
      async () => {
        const { patient_id, patient_encounter_id } = await setupTriageNewPatient({
          patient_demographics: {},
          warning_signs: asWarningSignsOlderChild(['Very sunken eyes']),
        })

        const this_patient_findings = await patient_findings.findAll(db, {
          patient_id,
        })

        assertMatches(this_patient_findings, [
          {
            'id': z.string().uuid(),
            'created_at': z.date(),
            'root_snomed_concept_name': 'Clinical finding',
            'root_snomed_concept_category': 'finding',
            'root_snomed_concept_id': CLINICAL_FINDING.id,
            'specific_snomed_concept_id': '246923005',
            'patient_encounter_id': patient_encounter_id,
            'as_part_of_procedure': {
              'id': z.string().uuid(),
              'root_snomed_concept_id': '71388002',
              'root_snomed_concept_name': 'Procedure',
              'root_snomed_concept_category': 'procedure',
              'specific_snomed_concept_id': '245581009',
              'specific_snomed_concept_name': 'Emergency examination for triage',
              'specific_snomed_concept_category': 'procedure',
            },
          },
        ])
      },
    )

    itParallel(
      'inserts a warning sign finding with nested qualifiers from the s_expression',
      async () => {
        const { encounter, nurse, patient_id, patient_encounter_id, getStep, postStep } = await setupTriageNewPatient({
          patient_demographics: {},
          warning_signs: asWarningSignsAdult(['Seizure'], { pregnant: false }),
        })

        await events.allProcessedForEncounter(db, {
          patient_encounter_id,
        })

        const this_patient_findings = await patient_findings.findAll(db, {
          patient_id,
        })

        assertMatches(this_patient_findings, [
          {
            'id': z.string().uuid(),
            'created_at': z.date(),
            'root_snomed_concept_id': CLINICAL_FINDING.id,
            'root_snomed_concept_name': 'Clinical finding',
            'root_snomed_concept_category': 'finding',
            'patient_id': patient_id,
            'patient_encounter_id': patient_encounter_id,
            'patient_encounter_employee_id': z.string().uuid(),
            'type': 'finding',
            'value': null,
            'specific_snomed_concept_id': '91175000',
            'specific_snomed_concept_name': 'Seizure',
            'specific_snomed_concept_category': 'finding',
            'as_part_of_procedure': {
              'id': z.string().uuid(),
              'root_snomed_concept_id': '71388002',
              'root_snomed_concept_name': 'Procedure',
              'root_snomed_concept_category': 'procedure',
              'specific_snomed_concept_id': '245581009',
              'specific_snomed_concept_name': 'Emergency examination for triage',
              'specific_snomed_concept_category': 'procedure',
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
            // 'source_relations': [{
            //   'source_id': z.string().uuid().optional(),
            //   'root_snomed_concept_id': 129265001,
            //   'specific_snomed_concept_id': 385641008,
            // }],
            'evaluations': z.array(z.any()),
            'attributes': [],
            'existence': 'Yes',
          },
        ], { strict: true })

        const { task_groups } = await additional_tasks.getTasksGroups(db, {
          encounter,
          health_worker_id: nurse.health_worker.id,
        })

        assertMatches(task_groups, [
          {
            'due_to': [
              {
                'displays': { 'full': 'Seizure' },
              },
            ],
            'tasks': [
              {
                atom: 'link',
                title: 'APC 2023 — Seizures',
                href: '/medical-resources/primary-care/adult.pdf#page=19',
                thumbnail_href: '/medical-resources/za/primary-care/adult/thumbnails/400/19.png',
              },
              { atom: 'finding', displays: { full: 'Current Injury of head' } },
              { atom: 'finding', displays: { full: 'Unconscious' } },
              { atom: 'finding', displays: { full: 'Hypoglycemia' } },
              { atom: 'finding', displays: { full: 'Alcohol use disorder' } },
              { atom: 'finding', displays: { full: 'Status epilepticus' } },
              { atom: 'finding', displays: { full: 'Cardiac arrhythmia' } },
            ],
          },
        ])

        const $ = await getStep('warning_signs')
        const form = scrapedWarningSignsForm($)
        assertEquals(form.saved_record_ids, this_patient_findings.map((finding) => finding.id))
        const none_of_these = noneOfThese(form)
        assert(!none_of_these.has(signNormalForm(KEYED_WARNING_SIGNS['Seizure'])))
        assert(none_of_these.has(signNormalForm(KEYED_WARNING_SIGNS['Dislocation of larger joint'])))

        // Repost without modification
        await postStep({ warning_signs: form })

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
          warning_signs: asWarningSignsAdult(['Cardiac arrest', 'Chest pain'], { pregnant: false }),
        })

        const this_patient_findings = await patient_findings.findAll(db, {
          patient_id,
        })

        assertEquals(this_patient_findings.length, 2)

        // Both should be Clinical findings with the appropriate qualifiers
        const cardiac_arrest_finding = this_patient_findings.find((f) => f.specific_snomed_concept_id === '410429000')
        const chest_pain_finding = this_patient_findings.find((f) => f.specific_snomed_concept_id === '29857009')

        assertMatches(cardiac_arrest_finding, {
          'root_snomed_concept_id': CLINICAL_FINDING.id,
          'root_snomed_concept_name': 'Clinical finding',
          'specific_snomed_concept_id': '410429000',
        })

        assertMatches(chest_pain_finding, {
          'root_snomed_concept_id': CLINICAL_FINDING.id,
          'root_snomed_concept_name': 'Clinical finding',
          'specific_snomed_concept_id': '29857009',
        })
      },
    )

    itParallel(
      'records a sign as absent once it has been removed via mark_as_error and the page is resubmitted',
      async () => {
        const { patient_id, getStep, postStep, postMarkAsError } = await setupTriageNewPatient({
          patient_demographics: {},
          warning_signs: asWarningSignsAdult(['Chest pain'], { pregnant: false }),
        })

        const [chest_pain] = await patient_findings.findAll(db, { patient_id })
        assert(chest_pain)
        assertEquals(chest_pain.specific_snomed_concept_name, 'Chest pain')

        await postMarkAsError(chest_pain.id)

        // Having been removed, the page no longer shows chest pain as checked
        const $ = await getStep('warning_signs')
        const form = scrapedWarningSignsForm($)
        assertEquals(form.saved_record_ids, [])
        assert(noneOfThese(form).has(signNormalForm(KEYED_WARNING_SIGNS['Chest pain'])))

        await postStep({ warning_signs: form })

        assertLength(await patient_findings.findAll(db, { patient_id }), 0)

        const recordsOf = (name: string) => all_records.filter((finding) => finding.specific_snomed_concept_name === name)
        const all_records = await patient_findings.findAll(db, { patient_id, include_negative: true })
        // Chest pain is now recorded as absent, while a sign that already had a record was not recorded again
        assertMatches(recordsOf('Chest pain'), [{ existence: 'No' }])
        assertMatches(recordsOf('Cardiac arrest'), [{ existence: 'No' }])
      },
    )

    itParallel(
      '409s if the client fails to include a previously saved record, naming it',
      async () => {
        const { patient_id, getStep, postStep } = await setupTriageNewPatient({
          patient_demographics: {},
          warning_signs: asWarningSignsAdult(['Chest pain'], { pregnant: false }),
        })

        const [chest_pain] = await patient_findings.findAll(db, { patient_id })
        assert(chest_pain)

        const $ = await getStep('warning_signs')
        const form = scrapedWarningSignsForm($)
        assertEquals(form.saved_record_ids, [chest_pain.id])

        const result = await asResultAsync(() =>
          postStep({
            warning_signs: { ...form, saved_record_ids: [] },
          })
        )

        assert(!result.success)
        assertIncludes(result.error.message, '[409]')
        assertIncludes(result.error.message, chest_pain.id)
      },
    )

    itParallel(
      '409s if the client claims a saved record that is not a valid positive finding of this encounter, naming it',
      async () => {
        const { patient_id, getStep, postStep, postMarkAsError } = await setupTriageNewPatient({
          patient_demographics: {},
          warning_signs: asWarningSignsAdult(['Chest pain'], { pregnant: false }),
        })

        const [chest_pain] = await patient_findings.findAll(db, { patient_id })
        assert(chest_pain)

        const $ = await getStep('warning_signs')
        const form = scrapedWarningSignsForm($)

        const never_saved = generateUUID()
        const with_unknown = await asResultAsync(() =>
          postStep({
            warning_signs: { ...form, saved_record_ids: [...form.saved_record_ids, never_saved] },
          })
        )
        assert(!with_unknown.success)
        const [status_line] = with_unknown.error.message.split('\n')
        assertIncludes(status_line, '[409]')
        assertIncludes(status_line, never_saved)
        assert(!status_line.includes(chest_pain.id), 'chest pain is validly saved and so is not an offender')

        // A record since marked as entered in error is no longer valid
        await postMarkAsError(chest_pain.id)
        const with_removed = await asResultAsync(() => postStep({ warning_signs: form }))
        assert(!with_removed.success)
        assertIncludes(with_removed.error.message, '[409]')
        assertIncludes(with_removed.error.message, chest_pain.id)
      },
    )

    itParallel(
      'does not insert any positive findings when no warning signs are selected, but still inserts negative findings',
      async () => {
        const { patient_id } = await setupTriageNewPatient({
          patient_demographics: {},
          warning_signs: asWarningSignsAdult([], { pregnant: false }),
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
          warning_signs: asWarningSignsAdult(['Chest pain'], { pregnant: false }),
        })

        const findings_count_after_first_insertion = await patient_findings
          .findAll(db, { patient_id })

        assertEquals(findings_count_after_first_insertion.length, 1)

        const $ = await getStep('warning_signs')
        const form = scrapedWarningSignsForm($)
        assertEquals(form.saved_record_ids, findings_count_after_first_insertion.map((finding) => finding.id))
        assert(noneOfThese(form).has(signNormalForm(KEYED_WARNING_SIGNS['Dislocation of larger joint'])))

        // Reposting the page as rendered records the common symptoms as absent, which the shorthand above never sent
        await postStep({ warning_signs: form })
        assertEquals(await patient_findings.countAll(db, { patient_id }), 1)
        const all_count_after_second_insertion = await patient_findings.countAll(db, { patient_id, include_negative: true })

        // Reposting again records nothing further, every sign now having a record
        await postStep({ warning_signs: form })
        assertEquals(await patient_findings.countAll(db, { patient_id }), 1)
        assertEquals(await patient_findings.countAll(db, { patient_id, include_negative: true }), all_count_after_second_insertion)
      },
    )

    itParallel(
      'does save identical warning concepts made during different encounters',
      async () => {
        const { nurse, patient_id, patient_encounter_id, postStep } = await setupTriageNewPatient({
          patient_demographics: {},
          warning_signs: asWarningSignsAdult(['Chest pain'], { pregnant: false }),
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
          warning_signs: asWarningSignsAdult(['Chest pain'], { pregnant: false }),
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
              ...asWarningSignsAdult([], { pregnant: false }).warning_signs,
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
          root_snomed_concept_id: CLINICAL_FINDING.id,
          specific_snomed_concept_name: 'Pain of ear',
          priority: 'Non-urgent',
        })

        const $ = await getStep('warning_signs')

        assertEquals(
          $('#warning-signs-selected-chips').text(),
          'Pain of ear',
        )

        // Posting again has no effect
        await postStep({ warning_signs: scrapedWarningSignsForm($) })

        const subsequent_findings = await patient_findings.findAll(db, {
          patient_id,
        })
        assertLength(subsequent_findings, 1)
      },
    )

    itParallel(
      'saves findings other than warning signs, including a priority level if the concept is a descendant of a warning sign',
      async () => {
        const { $, nurse, patient_id, getStep, postStep } = await setupTriageNewPatient({
          patient_demographics: {},
          early_brief_history: {
            common_conditions: {
              diabetes: { existence: 'No' },
              pregnancy: { existence: 'Yes' },
            },
          },
        })

        const search_route = $('#warning-signs-search').attr(
          'data-searchroute',
        )

        assertEquals(
          search_route,
          `/app/snomed/warning-signs?age_determination=adult&pregnancy=true`,
        )

        const { results } = await nurse.fetchJSON(
          `${search_route}&search=appendicular+pain`,
        )
        assertEquals(results[0], {
          category: 'Search Results',
          clinical_finding_s_expression: '(clinical_finding (snomed_concept "Appendicular pain" "finding"))',
          snomed_concept_id: '275406005',
          name: 'Appendicular pain',
          description: 'finding',
          priority: 'Very urgent',
          priority_by_virtue_of_matching_warning_sign: 'Pregnancy and abdominal pain',
          finding_site: null,
          best_similarity: 1.4,
          onset_required: false,
          predefined_attributes: [
            {
              s_expression: '(attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Appendix structure" "body structure"))',
            },
          ],
          relevant_qualifiers: [],
        })

        await postStep({
          warning_signs: {
            warning_signs: {
              ...asWarningSignsAdult([], { pregnant: true }).warning_signs,
              's275406005': {
                existence: 'Yes',
                priority_level: results[0].priority,
                s_expression: results[0].clinical_finding_s_expression,
              },
            },
          },
        })

        const findings = await patient_findings.findAll(db, {
          patient_id,
          s_expression: `(finding (excluding (finding ${STATUS_ATTRIBUTE.s_expression})))`,
        })
        assertLength(findings, 1)

        assertMatches(findings[0], {
          root_snomed_concept_id: CLINICAL_FINDING.id,
          specific_snomed_concept_name: 'Appendicular pain',
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
              ...asWarningSignsAdult([], { pregnant: false }).warning_signs,
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
          root_snomed_concept_id: CLINICAL_FINDING.id,
          specific_snomed_concept_name: 'Nasal discharge',
          priority: 'Non-urgent',
        })

        await events.allProcessedForEncounter(db, {
          patient_encounter_id,
        })

        const { task_groups } = await additional_tasks.getTasksGroups(db, {
          encounter,
          health_worker_id: nurse.health_worker.id,
        })

        assertLength(task_groups, 1)
      },
    )

    itParallel(
      'a cough on its own gets no priority',
      async () => {
        const { patient_id, patient_encounter_id } = await setupTriageNewPatient({
          patient_demographics: {},
          warning_signs: asWarningSignsAdult([], { pregnant: false }, COUGH),
        })

        await events.allProcessedForEncounter(db, { patient_encounter_id })

        assertMatches(await patient_findings.findAll(db, { patient_id }), [{
          specific_snomed_concept_name: 'Cough',
          priority: null,
        }])
      },
    )

    itParallel(
      'a cough with a severe pain level is marked Very urgent by the pain level system priority evaluation',
      async () => {
        const { patient_id, patient_encounter_id } = await setupTriageNewPatient({
          patient_demographics: {},
          warning_signs: asWarningSignsAdult([], { pregnant: false }, COUGH_WITH_SEVERE_PAIN),
        })

        await events.allProcessedForEncounter(db, { patient_encounter_id })

        assertMatches(await patient_findings.findAll(db, { patient_id }), [{
          specific_snomed_concept_name: 'Cough',
          priority: 'Very urgent',
          attributes: [{
            specific_snomed_concept_name: PAIN_LEVEL.name,
            value: { name: SEVERE_PAIN.name },
          }],
        }])
      },
    )

    function testRoundTrip(sign: WarningSign, pregnant: boolean, opts?: TestOpts) {
      itParallel(
        `renders the page with the ${sign.key} sign checked after having submitted it (TODO emergency logic will be different probably)`,
        async () => {
          const { $, clinic, encounter, patient_encounter_id, nurse, getStep } = await setupTriageNewPatient({
            patient_demographics: {},
            early_brief_history: pregnant
              ? {
                common_conditions: {
                  diabetes: { existence: 'No' },
                  pregnancy: { existence: 'Yes' },
                },
              }
              : undefined,
            warning_signs: asWarningSignsAdult([sign.key], { pregnant }),
          })

          const receptionist = await addTestEmployeeWithSession(db, {
            role: 'receptionist',

            organization_id: clinic.id,
          })

          assertEquals(
            $('#patient-drawer-priority').text(),
            sign.priority,
            `mismatch for ${humanReadableJson(sign)}`,
          )

          if (sign.priority === 'Emergency') {
            assert($.url.endsWith('route_patient'))
          } else if (pregnant) {
            assert($.url.endsWith('height_and_weight'))
          } else {
            assert($.url.endsWith('brief_history'))
          }

          const $warning_signs = await getStep('warning_signs')

          const form = scrapedWarningSignsForm($warning_signs)
          assertLength(form.saved_record_ids, 1)
          assert(!noneOfThese(form).has(signNormalForm(sign)), `${sign.key} is checked so should not be among none_of_these`)

          await events.allProcessedForEncounter(db, { patient_encounter_id })

          const { task_groups } = await additional_tasks.getTasksGroups(db, {
            encounter,
            health_worker_id: nurse.health_worker.id,
          })

          const tasks = task_groups.flatMap((group) => group.tasks)
          const medical_guidance_task = tasks.some((task) => task.atom === 'link')

          const no_guidance_expected = new Set([
            'Obstructed airway',
            'Burn Inhalation',
            'Focal neurology',
            'Poisoning',
            'High energy transfer',
            'Severe limb ischemia',
            'Haemorrhage Uncontrolled',
            'Eye injury',
            'Dislocation of larger joint',
            'Closed fracture',
            'Pregnancy and abdominal trauma',
            'Haemorrhage Controlled',
            'Abdominal pain',
          ])
          assert(medical_guidance_task || no_guidance_expected.has(sign.key), `No medical guidance task created for ${sign.key}`)

          const $waiting_room = await receptionist.fetchCheerio(
            `/app/organizations/${clinic.id}/waiting_room`,
          )

          const waiting_room_table = getTableDisplay($waiting_room)
          assertMatches(waiting_room_table, [{
            Priority: nobreak(sign.priority),
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
    // testRoundTrip(KEYED_WARNING_SIGNS['Dislocation of larger joint'], false, { only: true })

    // Exercises s_expression
    // testRoundTrip(KEYED_WARNING_SIGNS['Burn Other'], false, { only: true })

    // Pregnancy
    // testRoundTrip(KEYED_WARNING_SIGNS['Pregnancy and abdominal pain'], true, { only: true })

    // Emergency
    // testRoundTrip(KEYED_WARNING_SIGNS['Burn Facial'], false, { only: true })
  })
})
