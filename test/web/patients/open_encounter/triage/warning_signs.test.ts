import { afterAll, before, describe, it } from 'std/testing/bdd.ts'
import db from '../../../../../db/db.ts'
import { addTestEmployeeWithSession } from '../../../../_helpers/employees.ts'
import {
  insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest,
  insertReturningSeekingTreatmentWithEmployeeForTest,
} from '../../../../_helpers/workflows.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { createTestOrganization } from '../../../../_helpers/organizations.ts'
import waitUntilTestServerUp from '../../../../_helpers/waitUntilTestServerUp.ts'
import { getFormLabels, getFormValues } from '../../../../_helpers/form.ts'
import asFormData from '../../../../../util/asFormData.ts'
import { patient_findings } from '../../../../../db/models/patient_findings.ts'
import { assertMatches } from '../../../../../util/assertMatches.ts'
import { z } from 'zod'
import { route } from '../../../../route.ts'
import * as patient_encounters from '../../../../../db/models/patient_encounters.ts'
import { CLINICAL_FINDING_SNOMED_CONCEPT_ID } from '../../../../../db/models/patient_findings.ts'
import { WARNING_SIGNS } from '../../../../../shared/warning_signs.ts'
import { renderedMostRecentFindings } from '../../../../../db/models/brief_history.ts'
import { assert } from 'std/assert/assert.ts'
import entries from '../../../../../util/entries.ts'
import { WarningSign } from '../../../../../types.ts'
import assertLength from '../../../../../util/assertLength.ts'

describe('triage/warning_signs', () => {
  before(waitUntilTestServerUp)
  afterAll(() => db.destroy())

  describe('GET', () => {
    it('renders a warning signs page when patient not known to be pregnant', async () => {
      const clinic = await createTestOrganization(db)
      const { health_worker: nurse, fetchCheerio } =
        await addTestEmployeeWithSession(db, {
          profession: 'nurse',
          registration_status: 'approved',
          organization_id: clinic.id,
        })

      const encounter =
        await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
          db,
          nurse.organization_id,
          {
            employment_id: nurse.employee_id,
          },
        )

      const $warning_signs = await fetchCheerio(
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
          'Abdominal pain': 'Abdominal pain',
          'Persistent vomiting': 'Persistent vomiting',
          'Moderate pain': 'Moderate pain',
        },
      })
    })

    it('renders the pregnancy-specific signs when the patient is pregnant', async () => {
      const clinic = await createTestOrganization(db)
      const { health_worker: nurse, fetchOk, fetchCheerio } =
        await addTestEmployeeWithSession(db, {
          profession: 'nurse',
          registration_status: 'approved',
          organization_id: clinic.id,
        })

      const initial_encounter =
        await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
          db,
          nurse.organization_id,
          {
            employment_id: nurse.employee_id,
          },
        )

      const patient_id = initial_encounter.patient.id

      await fetchOk(
        `/app/organizations/${clinic.id}/patients/${patient_id}/open_encounter/triage/brief_history`,
        {
          method: 'POST',
          body: asFormData({
            diabetes: {
              existence: 'No',
            },
            pregnancy: {
              existence: 'Yes',
            },
          }),
        },
        {
          cancel_response_body: true,
        },
      )

      const most_recent_findings = await renderedMostRecentFindings(db, {
        patient_id: initial_encounter.patient.id,
        encounter: initial_encounter,
        health_worker_id: nurse.id,
      })
      assert(most_recent_findings.pregnancy)

      await patient_encounters.close(db, {
        patient_encounter_id: initial_encounter.patient_encounter_id,
      })

      await insertReturningSeekingTreatmentWithEmployeeForTest(
        db,
        nurse.organization_id,
        {
          patient_id: patient_id,
          employment_id: nurse.employee_id,
        },
      )

      const $warning_signs = await fetchCheerio(
        `/app/organizations/${clinic.id}/patients/${patient_id}/open_encounter/triage/warning_signs`,
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
    })
  })

  describe('POST', () => {
    it('inserts a simple warning sign finding without qualifiers', async () => {
      const clinic = await createTestOrganization(db)
      const { health_worker: nurse, fetchOk } =
        await addTestEmployeeWithSession(db, {
          profession: 'nurse',
          registration_status: 'approved',
          organization_id: clinic.id,
        })

      const encounter =
        await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
          db,
          nurse.organization_id,
          {
            employment_id: nurse.employee_id,
          },
        )

      const response = await fetchOk(
        `${route}/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/triage/warning_signs`,
        {
          method: 'POST',
          body: asFormData({
            warning_signs: {
              'Cardiac arrest':
                WARNING_SIGNS['Cardiac arrest'].clinical_finding_s_expression,
            },
          }),
        },
        {
          cancel_response_body: true,
        },
      )

      assertEquals(
        response.url,
        `${route}/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/triage/brief_history`,
      )

      const this_patient_findings = await patient_findings.findAll(db, {
        patient_id: encounter.patient.id,
      })

      assertMatches(this_patient_findings, [
        {
          'record_id': z.string().uuid(),
          'created_at': z.date(),
          'snomed_concept_id': CLINICAL_FINDING_SNOMED_CONCEPT_ID,
          'patient_encounter_id': encounter.patient_encounter_id,
          'name': 'Clinical finding',
          'value_snomed_concept_id': null,
          'value_name': null,
          'as_part_of_procedure': {
            'record_id': z.string().uuid(),
            'snomed_concept_id': '225390008',
            'name': 'Triage',
          },
          'qualifiers': [
            {
              'record_id': z.string().uuid(),
              'snomed_concept_id': '410429000',
              'name': 'Cardiac arrest',
              'value_name': null,
            },
          ],
        },
      ])
    })

    it('inserts a warning sign finding with nested qualifiers from the s_expression', async () => {
      const clinic = await createTestOrganization(db)
      const { health_worker: nurse, fetchOk } =
        await addTestEmployeeWithSession(db, {
          profession: 'nurse',
          registration_status: 'approved',
          organization_id: clinic.id,
        })

      const encounter =
        await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
          db,
          nurse.organization_id,
          {
            employment_id: nurse.employee_id,
          },
        )

      // Submit with "Seizure" selected: (finding 91175000 (qualifier 15240007))
      // 91175000 = Seizure (canonical name in SNOMED)
      // 15240007 = Current
      const response = await fetchOk(
        `${route}/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/triage/warning_signs`,
        {
          method: 'POST',
          body: asFormData({
            warning_signs: {
              'Seizure': WARNING_SIGNS['Seizure'].clinical_finding_s_expression,
            },
          }),
        },
        {
          cancel_response_body: true,
        },
      )

      assertEquals(
        response.url,
        `${route}/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/triage/brief_history`,
      )

      const this_patient_findings = await patient_findings.findAll(db, {
        patient_id: encounter.patient.id,
      })

      assertMatches(this_patient_findings, [
        {
          'record_id': z.string().uuid(),
          'created_at': z.date(),
          'snomed_concept_id': CLINICAL_FINDING_SNOMED_CONCEPT_ID,
          'patient_encounter_id': encounter.patient_encounter_id,
          'name': 'Clinical finding',
          'value_snomed_concept_id': null,
          'value_name': null,
          'as_part_of_procedure': {
            'record_id': z.string().uuid(),
            'snomed_concept_id': '225390008',
            'name': 'Triage',
          },
          'qualifiers': [
            {
              'record_id': z.string().uuid(),
              'snomed_concept_id': '91175000',
              'name': 'Seizure',
              'value_name': null,
              'qualifiers': [{
                'record_id': z.string().uuid(),
                'snomed_concept_id': '15240007',
                'name': 'Current',
                'value_name': null,
              }],
            },
          ],
        },
      ])

      await fetchOk(
        `${route}/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/triage/warning_signs`,
        {
          method: 'POST',
          body: asFormData({
            warning_signs: {
              'Seizure': WARNING_SIGNS['Seizure'].clinical_finding_s_expression,
            },
          }),
        },
        {
          cancel_response_body: true,
        },
      )

      const this_patient_findings2 = await patient_findings.findAll(db, {
        patient_id: encounter.patient.id,
      })

      assertLength(this_patient_findings2, 1)
    })

    it('inserts multiple warning sign findings when multiple are selected', async () => {
      const clinic = await createTestOrganization(db)
      const { health_worker: nurse, fetchOk } =
        await addTestEmployeeWithSession(db, {
          profession: 'nurse',
          registration_status: 'approved',
          organization_id: clinic.id,
        })

      const encounter =
        await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
          db,
          nurse.organization_id,
          {
            employment_id: nurse.employee_id,
          },
        )

      // Submit with both "Cardiac arrest" and "Chest pain" selected
      await fetchOk(
        `${route}/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/triage/warning_signs`,
        {
          method: 'POST',
          body: asFormData({
            warning_signs: {
              'Cardiac arrest':
                WARNING_SIGNS['Cardiac arrest'].clinical_finding_s_expression,
              'Chest pain':
                WARNING_SIGNS['Chest pain'].clinical_finding_s_expression,
            },
          }),
        },
        {
          cancel_response_body: true,
        },
      )

      const this_patient_findings = await patient_findings.findAll(db, {
        patient_id: encounter.patient.id,
      })

      assertEquals(this_patient_findings.length, 2)

      // Both should be Clinical findings with the appropriate qualifiers
      const cardiac_arrest_finding = this_patient_findings.find((f) =>
        f.qualifiers.some((q) => q.snomed_concept_id === '410429000')
      )
      const chest_pain_finding = this_patient_findings.find((f) =>
        f.qualifiers.some((q) => q.snomed_concept_id === '29857009')
      )

      assertMatches(cardiac_arrest_finding, {
        'snomed_concept_id': CLINICAL_FINDING_SNOMED_CONCEPT_ID,
        'name': 'Clinical finding',
        'qualifiers': [
          {
            'snomed_concept_id': '410429000',
            'name': 'Cardiac arrest',
          },
        ],
      })

      assertMatches(chest_pain_finding, {
        'snomed_concept_id': CLINICAL_FINDING_SNOMED_CONCEPT_ID,
        'name': 'Clinical finding',
        'qualifiers': [
          {
            'snomed_concept_id': '29857009',
            'name': 'Chest pain',
          },
        ],
      })
    })

    it('does not insert any findings when no warning signs are selected', async () => {
      const clinic = await createTestOrganization(db)
      const { health_worker: nurse, fetchOk } =
        await addTestEmployeeWithSession(db, {
          profession: 'nurse',
          registration_status: 'approved',
          organization_id: clinic.id,
        })

      const encounter =
        await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
          db,
          nurse.organization_id,
          {
            employment_id: nurse.employee_id,
          },
        )

      // Submit with no warning signs selected
      const response = await fetchOk(
        `${route}/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/triage/warning_signs`,
        {
          method: 'POST',
          body: asFormData({}),
        },
        {
          cancel_response_body: true,
        },
      )

      assertEquals(
        response.url,
        `${route}/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/triage/brief_history`,
      )

      const this_patient_findings = await patient_findings.findAll(db, {
        patient_id: encounter.patient.id,
      })

      assertEquals(this_patient_findings.length, 0)
    })

    it('does not save warning signs already made during the encounter', async () => {
      const clinic = await createTestOrganization(db)
      const { health_worker: nurse, fetchOk } =
        await addTestEmployeeWithSession(db, {
          profession: 'nurse',
          registration_status: 'approved',
          organization_id: clinic.id,
        })

      const encounter =
        await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
          db,
          nurse.organization_id,
          {
            employment_id: nurse.employee_id,
          },
        )

      await fetchOk(
        `${route}/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/triage/warning_signs`,
        {
          method: 'POST',
          body: asFormData({
            warning_signs: {
              'Chest pain':
                WARNING_SIGNS['Chest pain'].clinical_finding_s_expression,
            },
          }),
        },
        {
          cancel_response_body: true,
        },
      )

      const findings_count_after_first_insertion = await patient_findings
        .findAll(db, {
          patient_id: encounter.patient.id,
        })

      assertEquals(findings_count_after_first_insertion.length, 1)

      await fetchOk(
        `${route}/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/triage/warning_signs`,
        {
          method: 'POST',
          body: asFormData({
            warning_signs: {
              'Chest pain':
                WARNING_SIGNS['Chest pain'].clinical_finding_s_expression,
            },
          }),
        },
        {
          cancel_response_body: true,
        },
      )

      const findings_count_after_second_insertion = await patient_findings
        .countAll(db, {
          patient_id: encounter.patient.id,
        })

      assertEquals(findings_count_after_second_insertion, 1)
    })

    it('does save identical warning concepts made during different encounters', async () => {
      const clinic = await createTestOrganization(db)
      const { health_worker: nurse, fetchOk } =
        await addTestEmployeeWithSession(db, {
          profession: 'nurse',
          registration_status: 'approved',
          organization_id: clinic.id,
        })

      const initial_encounter =
        await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
          db,
          nurse.organization_id,
          {
            employment_id: nurse.employee_id,
          },
        )

      await fetchOk(
        `${route}/app/organizations/${clinic.id}/patients/${initial_encounter.patient.id}/open_encounter/triage/warning_signs`,
        {
          method: 'POST',
          body: asFormData({
            warning_signs: {
              'Chest pain':
                WARNING_SIGNS['Chest pain'].clinical_finding_s_expression,
            },
          }),
        },
        {
          cancel_response_body: true,
        },
      )

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
          nurse.organization_id,
          {
            patient_id: initial_encounter.patient.id,
            employment_id: nurse.employee_id,
          },
        )

      await fetchOk(
        `${route}/app/organizations/${clinic.id}/patients/${subsequent_encounter.patient.id}/open_encounter/triage/warning_signs`,
        {
          method: 'POST',
          body: asFormData({
            warning_signs: {
              'Chest pain':
                WARNING_SIGNS['Chest pain'].clinical_finding_s_expression,
            },
          }),
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
    })

    function testRoundTrip(key: string, sign: WarningSign, pregnant: boolean) {
      it(`renders the page with the ${key} sign checked after having submitted it (TODO emergency logic will be different probably)`, async () => {
        const clinic = await createTestOrganization(db)
        const { health_worker: nurse, fetchOk, fetchCheerio } =
          await addTestEmployeeWithSession(db, {
            profession: 'nurse',
            registration_status: 'approved',
            organization_id: clinic.id,
          })

        const encounter =
          await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
            db,
            nurse.organization_id,
            {
              employment_id: nurse.employee_id,
            },
          )

        if (pregnant) {
          await fetchOk(
            `/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/triage/brief_history`,
            {
              method: 'POST',
              body: asFormData({
                diabetes: {
                  existence: 'No',
                },
                pregnancy: {
                  existence: 'Yes',
                },
              }),
            },
            {
              cancel_response_body: true,
            },
          )
        }

        await fetchOk(
          `/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/triage/warning_signs`,
          {
            method: 'POST',
            body: asFormData({
              warning_signs: {
                [key]: sign.clinical_finding_s_expression,
              },
            }),
          },
          {
            cancel_response_body: true,
          },
        )

        const $ = await fetchCheerio(
          `/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/triage/warning_signs`,
        )

        const form_values = getFormValues($)
        assertEquals(form_values, {
          warning_signs: {
            [key]: sign.clinical_finding_s_expression,
          },
        })
      })
    }

    for (const [key, sign] of entries(WARNING_SIGNS)) {
      const pregnant = [
        'Pregnancy and abdominal pain',
        'Pregnancy and abdominal trauma',
      ].includes(key)

      testRoundTrip(key, sign, pregnant)
    }
  })
})
