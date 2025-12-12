import { afterAll, before, describe, it } from 'std/testing/bdd.ts'
import db from '../../../../../db/db.ts'
import { addTestEmployeeWithSession } from '../../../../_helpers/employees.ts'
import { insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest } from '../../../../_helpers/workflows.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { TEST_ORGANIZATION_UUIDS } from '../../../../_helpers/organizations.ts'
import { route } from '../../../../route.ts'
import asFormData from '../../../../../util/asFormData.ts'
import waitUntilTestServerUp from '../../../../_helpers/waitUntilTestServerUp.ts'
import { getFormLabels } from '../../../../_helpers/form.ts'

describe('triage/warning_signs', () => {
  before(waitUntilTestServerUp)
  afterAll(() => db.destroy())

  describe('GET', () => {
    it.skip('renders a warning signs page when patient not known to be pregnant', async () => {
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
        `/app/organizations/${TEST_ORGANIZATION_UUIDS.ZA.clinic}/patients/${encounter.patient.id}/open_encounter/triage/brief_history`,
        {
          method: 'POST',
          body: asFormData({
            diabetes: {
              existence: 'Yes',
            },
            pregnancy: {
              existence: 'No',
            },
          }),
        },
      )

      assertEquals(
        $warning_signs.url,
        `${route}/app/organizations/${TEST_ORGANIZATION_UUIDS.ZA.clinic}/patients/${encounter.patient.id}/open_encounter/triage/warning_signs`,
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
          'Fracture':
            'FractureClosed (no break in the skin)FractureClosed (no break in the skin)',
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
})
