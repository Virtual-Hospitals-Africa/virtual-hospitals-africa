import { afterAll } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { assertArrayNonEmpty } from '../../util/arraySize.ts'
import db from '../../db/db.ts'
import { waiting_room } from '../../db/models/waiting_room.ts'
import { patient_encounters } from '../../db/models/patient_encounters.ts'
import { completedRegistration } from '../../shared/patient_registration.ts'
import { addTestEmployee } from '../_helpers/employees.ts'
import { createTestOrganization } from '../_helpers/organizations.ts'
import { insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest, insertRegistrationWithEmployeeForTest } from '../_helpers/workflows.ts'
import { RenderedPatient } from '../../types.ts'
import { exists } from '../../util/exists.ts'
import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { z } from 'zod'
import { assertMatches } from '../../util/assertMatches.ts'

describeParallel('db/models/patient_encounters.ts', () => {
  afterAll(() => db.destroy())

  itParallel('shows registration in progress', async () => {
    const organization_id = (await createTestOrganization(db)).id
    const receptionist = await addTestEmployee(db, {
      organization_id,
      role: 'receptionist',
    })

    const {
      organization,
      organization_employment,
      patient_encounter_id,
      patient_id,
      patient_encounter_employee_id,
    } = await insertRegistrationWithEmployeeForTest(
      db,
      organization_id,
      {
        employment_id: receptionist.employee_id,
      },
    )
    assert(organization_employment)

    const open_encounter = await patient_encounters.getById(
      db,
      patient_encounter_id,
    )

    const patient: RenderedPatient = {
      id: patient_id,
      name: null,
      description: null,
      avatar_url: null,
      sex: null,
      date_of_birth: null,
      names: null,
      completed_registration: false,
      gender: null,
      national_id_number: null,
      dob_formatted: null,
      age_display: null,
      age_years: null,
      age_days: null,
      preferred_language_code_iso_639_2_b: null,
      most_recent_height_cm_measurement: null,
    }

    assertArrayNonEmpty(
      open_encounter.workflows.registration!
        .seen_patient_encounter_employee_ids,
    )
    assertArrayNonEmpty(
      open_encounter.all_employees_seen,
    )
    assert(open_encounter.arrived_timestamp instanceof Date)
    assertEquals(
      open_encounter.status.patient_presence!
        .present_with_patient_encounter_employee_ids
        .length,
      1,
    )
    assertEquals(open_encounter, {
      organization,
      workflows: {
        registration: {
          patient_workflow_id: open_encounter.workflows.registration!.patient_workflow_id,
          workflow: 'registration',
          status: 'in progress',
          steps_completed: [],
          seen_patient_encounter_employee_ids: [
            patient_encounter_employee_id,
          ],
        },
      },
      priority: null,
      status: {
        open: true,
        patient_presence: {
          department_name: 'Reception',
          current_workflow: 'registration',
          next_workflow: null,
          present_with_patient_encounter_employee_ids: [
            patient_encounter_employee_id,
          ],
          room: open_encounter.status.patient_presence!.room,
        },
      },
      patient,
      reason: null,
      patient_encounter_id,
      arrived_timestamp: open_encounter.arrived_timestamp,
      notes: null,
      appointment: null,
      wait_time: open_encounter.wait_time,
      all_employees_seen: [
        {
          ...open_encounter.all_employees_seen[0],
          patient_encounter_employee_id,
          id: receptionist.id,
          employee_id: exists(organization_employment).employment_id,
          name: receptionist.name,
          role: 'receptionist',
          avatar_url: `/health_workers/${open_encounter.all_employees_seen[0].id}/avatar`,
          organization_id: organization.id,
        },
      ],
    })

    const [in_waiting_room] = await waiting_room.get(
      db,
      organization_employment,
    )

    assertMatches(in_waiting_room, {
      patient_encounter_id,
      patient: {
        id: patient.id,
        avatar_url: patient.avatar_url,
        description: patient.description,
        name: '[Unregistered patient]',
      },
      room: open_encounter.status.patient_presence!.room,
      arrived_ago_display: z.enum(['Just now', '1 minute ago']),
      workflow_status_display: 'Registration In Progress',
      actions: [{
        disabled: false,
        text: 'registration',
        method: 'POST',
        href: `/app/organizations/${organization_id}/patients/${patient.id}/open_encounter/start-workflow?workflow=registration`,
      }],
      present_employees: [
        open_encounter.all_employees_seen[0],
      ],
      reason: null,
      priority: null,
      target_treatment_time: null,
      department_name: 'Reception',
      arrived_timestamp: open_encounter.arrived_timestamp,
    }, { strict: true })
  })

  itParallel(
    'is awaiting triage after after registration completed',
    async () => {
      const clinic = await createTestOrganization(db, {
        category: 'Clinic',
      })
      const receptionist = await addTestEmployee(db, {
        organization_id: clinic.id,
        role: 'receptionist',
      })

      const {
        organization,
        organization_employment,
        patient_encounter_id,
        employee,
        patient,
      } = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
        db,
        clinic.id,
        {
          employment_id: receptionist.employee_id,
        },
      )

      const open_encounter = await patient_encounters.getById(
        db,
        patient_encounter_id,
      )

      assertArrayNonEmpty(
        open_encounter.workflows.registration!
          .seen_patient_encounter_employee_ids,
      )
      assertArrayNonEmpty(
        open_encounter.all_employees_seen,
      )
      assert(open_encounter.workflows.registration!.completed_at)
      assert(open_encounter.arrived_timestamp instanceof Date)
      assertEquals(open_encounter, {
        organization,
        workflows: {
          registration: {
            patient_workflow_id: open_encounter.workflows.registration!.patient_workflow_id,
            workflow: 'registration',
            status: 'completed',
            steps_completed: [
              'personal',
              'this_visit',
              'primary_care',
              'contacts',
              'confirm_details',
              'terms_and_conditions',
              'route_patient',
            ],
            seen_patient_encounter_employee_ids: [
              employee.patient_encounter_employee_id,
            ],
            completed_at: open_encounter.workflows.registration!
              .completed_at!,
          },
          triage: {
            patient_workflow_id: open_encounter.workflows.triage!.patient_workflow_id,
            workflow: 'triage',
            status: 'not started',
            steps_completed: [],
            seen_patient_encounter_employee_ids: [],
          },
          consultation: {
            patient_workflow_id: open_encounter.workflows.consultation!
              .patient_workflow_id,
            workflow: 'consultation',
            status: 'not started',
            steps_completed: [],
            seen_patient_encounter_employee_ids: [],
          },
        },
        priority: null,
        status: {
          open: true,
          patient_presence: {
            department_name: 'Waiting room',
            current_workflow: null,
            next_workflow: 'triage',
            present_with_patient_encounter_employee_ids: [],
            room: open_encounter.status.patient_presence!.room,
          },
        },
        patient,
        reason: 'seeking treatment',
        patient_encounter_id,
        arrived_timestamp: open_encounter.arrived_timestamp,
        notes: null,
        appointment: null,
        wait_time: open_encounter.wait_time,
        all_employees_seen: [
          {
            ...open_encounter.all_employees_seen[0],
            patient_encounter_employee_id: employee.patient_encounter_employee_id,
            employee_id: exists(organization_employment).employment_id,
            organization_id: organization_employment.id,
            role: 'receptionist',
            id: receptionist.id,
            name: receptionist.name,
          },
        ],
      })

      const [in_waiting_room] = await waiting_room.get(
        db,
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
        room: open_encounter.status.patient_presence!.room,
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
        arrived_timestamp: open_encounter.arrived_timestamp,
      }, { strict: true })
    },
  )
})
