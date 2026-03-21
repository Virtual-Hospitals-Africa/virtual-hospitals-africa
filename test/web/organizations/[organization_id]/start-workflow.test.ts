import { assert } from 'std/assert/assert.ts'
import { afterAll, before } from 'std/testing/bdd.ts'
import z from 'zod'
import db from '../../../../db/db.ts'
import { waiting_room } from '../../../../db/models/waiting_room.ts'
import { completedRegistration } from '../../../../shared/patient_registration.ts'
import { assertMatches } from '../../../../util/assertMatches.ts'
import { addTestEmployee, addTestEmployeeWithSession } from 'test/_helpers/employees.ts'
import { createTestOrganization } from 'test/_helpers/organizations.ts'
import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest } from 'test/_helpers/workflows.ts'
import waitUntilTestServerUp from 'test/_helpers/waitUntilTestServerUp.ts'
import { asResultAsync, isSuccess } from '../../../../util/asResult.ts'
import partition from '../../../../util/partition.ts'

describeParallel('/start-workflow?workflow=triage', () => {
  before(waitUntilTestServerUp)
  afterAll(() => db.destroy())

  itParallel(
    'does not allow multiple nurses to join triage at the same time',
    async () => {
      const clinic = await createTestOrganization(db, {
        category: 'Clinic',
      })
      const receptionist = await addTestEmployee(db, {
        organization_id: clinic.id,
        role: 'receptionist',
      })

      const nurse1 = await addTestEmployeeWithSession(db, {
        organization_id: clinic.id,
      })
      const nurse2 = await addTestEmployeeWithSession(db, {
        organization_id: clinic.id,
      })

      const {
        organization_employment,
        health_worker,
        patient_encounter_id,
        patient,
      } = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
        db,
        clinic.id,
        {
          employment_id: receptionist.employee_id,
        },
      )

      const [in_waiting_room] = await waiting_room.get(
        db,
        health_worker,
        organization_employment,
      )

      assert(completedRegistration(patient))

      assertMatches(in_waiting_room, {
        patient_encounter_id,
        patient: {
          id: patient.id,
          name: patient.name,
          avatar_url: patient.avatar_url,
          description: patient.description,
        },
        arrived_ago_display: z.enum(['Just now', '1 minute ago']),
        workflow_status_display: 'Awaiting Triage',
        actions: [{
          disabled: true,
          text: 'triage',
          method: 'POST',
          href: `/app/organizations/${clinic.id}/patients/${patient.id}/open_encounter/start-workflow?workflow=triage`,
        }],
        present_employees: [],
        reason: 'seeking treatment',
        priority: null,
        target_treatment_time: null,
        department_name: 'Waiting room',
      })

      const at_the_same_time = await Promise.all([
        asResultAsync(() => nurse1.fetchOk(`/app/organizations/${clinic.id}/patients/${patient.id}/open_encounter/start-workflow?workflow=triage`, { method: 'POST' })),
        asResultAsync(() => nurse2.fetchOk(`/app/organizations/${clinic.id}/patients/${patient.id}/open_encounter/start-workflow?workflow=triage`, { method: 'POST' })),
      ])
      console.log({at_the_same_time})
      const [[success], [failure]] = partition(at_the_same_time, isSuccess)
      assert(success, 'Supposed to have one success')
      assert(failure, 'Supposed to have one failure')
      console.log({failure})
    },
  )
})
