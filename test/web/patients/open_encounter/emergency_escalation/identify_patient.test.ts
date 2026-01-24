import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { afterAll, before } from 'std/testing/bdd.ts'
import db from '../../../../../db/db.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import waitUntilTestServerUp from '../../../../_helpers/waitUntilTestServerUp.ts'
import { setupEmergencyEscalation } from './_setup.ts'
import assertIncludes from '../../../../../util/assertIncludes.ts'
import { getFormLabels, getFormValues } from 'test/_helpers/form.ts'
import randomDemographics from '../../../../../mocks/randomDemographics.ts'
import { patients } from '../../../../../db/models/patients.ts'
import assertNotIncludes from '../../../../../util/assertNotIncludes.ts'

describeParallel(
  '/app/organizations/[organization_id]/patients/[patient_id]/open_encounters/emergency_escalation/identify_patient',
  () => {
    before(waitUntilTestServerUp)
    afterAll(() => db.destroy())

    itParallel('creates a patient for initial use, loading a page to fill in their details', async () => {
      const { $, initial_patient_id } = await setupEmergencyEscalation({})
      console.log('getting here')
      assertIncludes($.url, '/open_encounter/emergency_escalation/identify_patient')
      assertIncludes($.url, initial_patient_id)

      const form_values = getFormValues($)
      assertEquals(form_values, { 'patient_name': null, 'date_of_birth': null, 'gender': null, 'sex': null })

      const form_labels = getFormLabels($)
      assertEquals(form_labels, {
        'patient_name': 'Patient*',
        'date_of_birth': 'Date Of Birth*',
        'sex': 'Sex*Select',
        'gender': 'Gender*',
        'mode_of_arrival': [
          'Just arrivedThe patient is here without advance notice.The emergency department will be notified to come to reception immediately.',
          'Needs transportThe patient needs emergency transport to the clinic.',
          'En route personallyThe patient is on their way to the clinic on their own.',
          'En route in emergency transportThe patient is on their way to the clinic in an ambulance or other emergency transport.',
        ],
      })
    })

    itParallel('uses the same patient that was initially created if no patient_id is POSTed', async () => {
      const demographics = randomDemographics('ZA')
      const { $, initial_patient_id } = await setupEmergencyEscalation({
        identify_patient: {
          patient_name: demographics.name,
          date_of_birth: demographics.date_of_birth,
          sex: demographics.sex,
          gender: demographics.gender,
          mode_of_arrival: 'just_arrived',
        },
      })
      assertIncludes($.url, '/open_encounter/emergency_escalation/emergency_reason')
      assertIncludes($.url, initial_patient_id)
    })

    itParallel('deletes the initial patient if a returning patient is used instead', async () => {
      const demographics = randomDemographics('ZA')
      const existing_patient = await patients.insert(db, {
        ...demographics,
        completed_registration: true,
      })
      const { $, initial_patient_id } = await setupEmergencyEscalation({
        identify_patient: {
          patient_id: existing_patient.id,
          patient_name: demographics.name,
          date_of_birth: demographics.date_of_birth,
          sex: demographics.sex,
          gender: demographics.gender,
          mode_of_arrival: 'just_arrived',
        },
      })
      assertIncludes($.url, '/open_encounter/emergency_escalation/emergency_reason')
      assertNotIncludes($.url, initial_patient_id)
      assertIncludes($.url, existing_patient.id)
    })
  },
)
