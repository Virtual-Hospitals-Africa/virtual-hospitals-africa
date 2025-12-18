import { afterAll, before, describe, it } from 'std/testing/bdd.ts'
import db from '../../../../../db/db.ts'
import { addTestEmployeeWithSession } from '../../../../_helpers/employees.ts'
import { insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest } from '../../../../_helpers/workflows.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { createTestOrganization } from '../../../../_helpers/organizations.ts'
import asFormData from '../../../../../util/asFormData.ts'
import waitUntilTestServerUp from '../../../../_helpers/waitUntilTestServerUp.ts'
import { getFormLabels, getFormValues } from '../../../../_helpers/form.ts'
import { route } from '../../../../route.ts'

describe('triage/measure_vitals', () => {
  before(waitUntilTestServerUp)
  afterAll(() => db.destroy())

  describe('GET', () => {
    it('loads a page ', async () => {
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

      await fetchOk(
        `/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/triage/brief_history`,
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
        {
          cancel_response_body: true,
        },
      )

      const $ = await fetchCheerio(
        `/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/triage/warning_signs`,
        {
          method: 'POST',
        },
      )

      assertEquals(
        $.url,
        `${route}/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/triage/measure_vitals`,
      )

      // @Ettore as it stands these are hard to test. I want to be able to POST
      // a consistent body without needing the form to load
      const form_values = getFormValues($)
      const form_labels = getFormLabels($)

      console.log(form_values)
      console.log(form_labels)

      // assertEquals(form_labels, {
      //   "assessments": {
      //     "abde741e-1d08-41e0-b81a-56f6a153ae78": {
      //       "option_snomed_concept_id": "Avpu Consciousness"
      //     },
      //     "09481c9b-5b3d-41d7-a857-5952889f4d45": {
      //       "option_snomed_concept_id": "Mobility Assessment"
      //     },
      //     "58d63492-fd0a-4482-9638-4d079f80c6ff": {
      //       "option_snomed_concept_id": "Trauma Presence"
      //     }
      //   },
      //   "findings": {
      //     "b2012ed5-9ebc-4237-bc47-b2695f2107e1": {
      //       "value": "Height"
      //     },
      //     "9f89ee41-dfdd-4d14-96cd-37b654336741": {
      //       "value": "Weight"
      //     },
      //     "066f85c5-aec4-4174-a6c1-e3eb25597d2e": {
      //       "value": "Temperature"
      //     },
      //     "e49ba8ea-c2e1-4635-854c-bb147a73780b": {
      //       "value": "Blood Pressure Systolic"
      //     },
      //     "0176b451-f2b4-43de-bda1-22d4daeffa4d": {
      //       "value": "Blood Pressure Diastolic"
      //     },
      //     "be362741-5ac9-49e7-af00-f7a1037e1586": {
      //       "value": "Blood Oxygen Saturation"
      //     },
      //     "0ed58b01-f68a-4e3a-b4e7-fdffa9911da4": {
      //       "value": "Blood Glucose"
      //     },
      //     "6db23a42-716e-4cc2-a209-de53fbf38f49": {
      //       "value": "Heart Rate"
      //     },
      //     "d78d1d2b-5af8-4ba1-8b08-9f58056a68ce": {
      //       "value": "Respiratory Rate"
      //     }
      //   }
      // })

      // // @Ettore this is hard to test against with the server generated uuids
      // // See below for what I think we want
      // assertEquals(form_values, {
      //   'findings': {
      //     '7ced63ea-6166-41fd-b107-9cb7a0e66ba5': {
      //       'value': null,
      //     },
      //     'f603099d-0a80-4b16-abfe-722bb3a1fafd': {
      //       'value': null,
      //     },
      //     '9818ccf7-82ee-4bcb-80ae-156417d3cf62': {
      //       'value': null,
      //     },
      //     'f45a4076-048b-473e-89be-2af711da078e': {
      //       'value': null,
      //     },
      //     '2be02206-fecb-4171-b57f-ecd11f3c7f51': {
      //       'value': null,
      //     },
      //     'e6432a81-b818-4f63-8f36-a9318dba47c3': {
      //       'value': null,
      //     },
      //     '9a493320-70fb-456c-acf5-a6d6904a6a16': {
      //       'value': null,
      //     },
      //     'f3465a4d-3eba-4af7-9e45-9c54b6967b61': {
      //       'value': null,
      //     },
      //     '8a89dd63-54d1-43e8-8c51-bef5c4a8eb99': {
      //       'value': null,
      //     },
      //   },
      // })

      /* I'd expect something more like this
      assertEquals(form_values, {
        'vital_measurements': {
          height: { value: null },
          weight: { value: null },
          temperature: { value: null },
          blood_pressure_systolic: { value: null },
          blood_pressure_diastolic: { value: null },
          blood_oxygen_saturation: { value: null },
          blood_glucose: { value: null },
          heart_rate: { value: null },
          respiratory_rate: { value: null },
        },
        'vital_assessments': {
          avpu_consciousness: { value: null },
          mobility_assessment: { value: null },
          trauma_presence: { value: null },
        },
      })
      */
    })
  })
})
