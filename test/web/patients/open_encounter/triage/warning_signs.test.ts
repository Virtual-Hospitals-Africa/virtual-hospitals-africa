import { afterAll, before, describe, it } from 'std/testing/bdd.ts'
import db from '../../../../../db/db.ts'
import { addTestEmployeeWithSession } from '../../../../_helpers/employees.ts'
import { insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest } from '../../../../_helpers/workflows.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { TEST_ORGANIZATION_UUIDS } from '../../../../_helpers/organizations.ts'
import waitUntilTestServerUp from '../../../../_helpers/waitUntilTestServerUp.ts'
import { getFormLabels } from '../../../../_helpers/form.ts'
import asFormData from '../../../../../util/asFormData.ts'
import { patient_findings } from '../../../../../db/models/patient_findings.ts'
import { assertMatches } from '../../../../../util/assertMatches.ts'
import { z } from 'zod'
import { route } from '../../../../route.ts'
import { CLINICAL_FINDING_SNOMED_CONCEPT_ID } from '../../../../../db/models/warning_signs.ts'
import { WARNING_SIGNS } from '../../../../../shared/warning_signs.ts'

describe('triage/warning_signs', () => {
  before(waitUntilTestServerUp)
  afterAll(() => db.destroy())

  describe('GET', () => {
    it('renders a warning signs page when patient not known to be pregnant', async () => {
      const { health_worker: nurse, fetchCheerio } =
        await addTestEmployeeWithSession(db, {
          profession: 'nurse',
          registration_status: 'approved',
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
        `/app/organizations/${TEST_ORGANIZATION_UUIDS.ZA.clinic}/patients/${encounter.patient.id}/open_encounter/triage/warning_signs`,
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
          'Dislocation of finge': 'Dislocation of finge',
          'Dislocation of toe joint': 'Dislocation of toe joint',
          'Burn Other': 'BurnOther',
          'Abdominal pain': 'Abdominal pain',
          'Persistent vomiting': 'Persistent vomiting',
          'Moderate pain': 'Moderate pain',
        },
      })
    })
  })

  describe('POST', () => {
    it('inserts a simple warning sign finding without qualifiers', async () => {
      const { health_worker: nurse, fetchOk } =
        await addTestEmployeeWithSession(db, {
          profession: 'nurse',
          registration_status: 'approved',
        })

      const encounter =
        await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
          db,
          nurse.organization_id,
          {
            employment_id: nurse.employee_id,
          },
        )

      // Submit with "Cardiac arrest" selected: (finding 410429000)
      // Use redirect: 'manual' to avoid following redirect to brief_history page
      const response = await fetchOk(
        `${route}/app/organizations/${TEST_ORGANIZATION_UUIDS.ZA.clinic}/patients/${encounter.patient.id}/open_encounter/triage/warning_signs`,
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
        `${route}/app/organizations/${TEST_ORGANIZATION_UUIDS.ZA.clinic}/patients/${encounter.patient.id}/open_encounter/triage/brief_history`,
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
              'patient_encounter_id': encounter.patient_encounter_id,
              'snomed_concept_id': '410429000',
              'name': 'Cardiac arrest',
              'attribute_value': null,
            },
          ],
        },
      ])
    })

    it('inserts a warning sign finding with nested qualifiers from the s_expression', async () => {
      const { health_worker: nurse, fetchOk } =
        await addTestEmployeeWithSession(db, {
          profession: 'nurse',
          registration_status: 'approved',
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
        `${route}/app/organizations/${TEST_ORGANIZATION_UUIDS.ZA.clinic}/patients/${encounter.patient.id}/open_encounter/triage/warning_signs`,
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
        `${route}/app/organizations/${TEST_ORGANIZATION_UUIDS.ZA.clinic}/patients/${encounter.patient.id}/open_encounter/triage/brief_history`,
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
              'patient_encounter_id': encounter.patient_encounter_id,
              'snomed_concept_id': '91175000',
              'name': 'Seizure',
              'attribute_value': null,
              'qualifiers': [{
                'record_id': z.string().uuid(),
                'patient_encounter_id': encounter.patient_encounter_id,
                'snomed_concept_id': '15240007',
                'name': 'Current',
                'attribute_value': null,
              }],
            },
          ],
        },
      ])
    })

    it('inserts multiple warning sign findings when multiple are selected', async () => {
      const { health_worker: nurse, fetchOk } =
        await addTestEmployeeWithSession(db, {
          profession: 'nurse',
          registration_status: 'approved',
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
        `${route}/app/organizations/${TEST_ORGANIZATION_UUIDS.ZA.clinic}/patients/${encounter.patient.id}/open_encounter/triage/warning_signs`,
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
      const { health_worker: nurse, fetchOk } =
        await addTestEmployeeWithSession(db, {
          profession: 'nurse',
          registration_status: 'approved',
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
        `${route}/app/organizations/${TEST_ORGANIZATION_UUIDS.ZA.clinic}/patients/${encounter.patient.id}/open_encounter/triage/warning_signs`,
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
        `${route}/app/organizations/${TEST_ORGANIZATION_UUIDS.ZA.clinic}/patients/${encounter.patient.id}/open_encounter/triage/brief_history`,
      )

      const this_patient_findings = await patient_findings.findAll(db, {
        patient_id: encounter.patient.id,
      })

      assertEquals(this_patient_findings.length, 0)
    })
  })
})
