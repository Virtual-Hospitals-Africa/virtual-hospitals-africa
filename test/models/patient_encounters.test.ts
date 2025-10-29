import { afterAll, describe } from 'std/testing/bdd.ts'
import * as patient_encounters from '../../db/models/patient_encounters.ts'
import * as waiting_room from '../../db/models/waiting_room.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../db/db.ts'
import { assertArrayNonEmpty } from '../../util/arraySize.ts'
import { assert } from 'node:console'
import { addTestEmployee } from '../_helpers/employees.ts'
import { withTestOrganization } from '../_helpers/organizations.ts'
import { itUsesTrxAnd } from '../_helpers/transaction.ts'
import {
  insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest,
  insertRegistrationWithEmployeeForTest,
} from '../_helpers/workflows.ts'

describe(
  'db/models/patient_encounters.ts',
  () => {
    afterAll(() => db.destroy())
    describe('during registration', () => {
      itUsesTrxAnd(
        'shows registration in progress',
        (trx) =>
          withTestOrganization(trx, async (organization_id) => {
            const receptionist = await addTestEmployee(trx, {
              organization_id,
              profession: 'receptionist',
            })

            const {
              organization,
              organization_employment,
              patient_encounter_id,
              patient_id,
              patient_encounter_employee_id,
            } = await insertRegistrationWithEmployeeForTest(
              trx,
              organization_id,
              {
                employment_id: receptionist.employee_id,
              },
            )

            const open_encounter = await patient_encounters.getById(
              trx,
              patient_encounter_id,
            )

            const patient = {
              id: patient_id,
              name: '[Unregistered patient]',
              description: null,
              avatar_url: null,
            }

            assertArrayNonEmpty(
              open_encounter.workflows.registration!.employees,
            )
            assertArrayNonEmpty(
              open_encounter.all_employees_seen,
            )
            assert(open_encounter.workflows.registration!.completed_at)
            assert(open_encounter.arrived_timestamp instanceof Date)
            assertEquals(
              open_encounter.status.patient_presence!.employees.length,
              1,
            )
            assertEquals(open_encounter, {
              organization,
              workflows: {
                registration: {
                  patient_workflow_id:
                    open_encounter.workflows.registration!.patient_workflow_id,
                  workflow: 'registration',
                  status: 'in progress',
                  steps_completed: [],
                  employees: [
                    {
                      patient_encounter_employee_id,
                      employment_id: organization_employment.non_admin_id!,
                      organization_id: organization_employment.organization.id,
                      profession: 'receptionist',
                      health_worker_id: receptionist.id,
                      health_worker_name: receptionist.name,
                      avatar_url:
                        open_encounter.workflows.registration!.employees[0]
                          .avatar_url,
                      specialty: null,
                      seen_at:
                        open_encounter.workflows.registration!.employees[0]
                          .seen_at,
                    },
                  ],
                },
              },
              priority: null,
              status: {
                open: true,
                patient_presence: {
                  department_name: 'reception',
                  current_workflow: 'registration',
                  next_workflow: null,
                  employees: [
                    {
                      patient_encounter_employee_id,
                      health_worker_id: receptionist.id,
                      employment_id: receptionist.employee_id,
                      health_worker_name: receptionist.name,
                      profession: 'receptionist',
                      specialty: null,
                      seen_at: open_encounter.all_employees_seen[0].seen_at,
                      avatar_url: receptionist.avatar_url,
                      organization_id: organization.id,
                    },
                  ],
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
                  patient_encounter_employee_id,
                  employment_id: organization_employment.non_admin_id!,
                  seen_at: open_encounter.all_employees_seen[0].seen_at,
                },
              ],
            })

            const [in_waiting_room] = await waiting_room.get(
              trx,
              organization_employment,
            )

            assertEquals(in_waiting_room, {
              patient_encounter_id,
              patient,
              arrived_ago_display: 'Just now',
              workflow_status_display: 'Registration In Progress',
              actions: [{
                disabled: false,
                text: 'registration',
                method: 'POST',
                href:
                  `/app/organizations/${organization_id}/patients/${patient.id}/open_encounter/start-workflow?workflow=registration`,
              }],
              present_employees: [
                open_encounter.workflows.registration!.employees[0],
              ],
              reason: null,
              priority_level: null,
              target_treatment_time: null,
              department_name: 'reception',
              arrived_timestamp: open_encounter.arrived_timestamp,
            })
          }),
      )
    })

    describe('after registration completed', () => {
      itUsesTrxAnd(
        'is awaiting triage',
        (trx) =>
          withTestOrganization(trx, async (organization_id) => {
            const receptionist = await addTestEmployee(trx, {
              organization_id,
              profession: 'receptionist',
            })

            const {
              organization,
              organization_employment,
              patient_encounter_id,
              employee,
              patient,
            } =
              await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
                trx,
                organization_id,
                {
                  employment_id: receptionist.employee_id,
                },
              )

            const open_encounter = await patient_encounters.getById(
              trx,
              patient_encounter_id,
            )

            assertArrayNonEmpty(
              open_encounter.workflows.registration!.employees,
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
                  patient_workflow_id:
                    open_encounter.workflows.registration!.patient_workflow_id,
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
                  employees: [
                    {
                      patient_encounter_employee_id:
                        employee.patient_encounter_employee_id,
                      employment_id: organization_employment.non_admin_id!,
                      organization_id: organization_employment.organization.id,
                      profession: 'receptionist',
                      health_worker_id: receptionist.id,
                      health_worker_name: receptionist.name,
                      avatar_url:
                        open_encounter.workflows.registration!.employees[0]
                          .avatar_url,
                      specialty: null,
                      seen_at:
                        open_encounter.workflows.registration!.employees[0]
                          .seen_at,
                    },
                  ],
                  completed_at: open_encounter.workflows.registration!
                    .completed_at!,
                },
                triage: {
                  patient_workflow_id:
                    open_encounter.workflows.triage!.patient_workflow_id,
                  workflow: 'triage',
                  status: 'not started',
                  steps_completed: [],
                  employees: [],
                },
                consultation: {
                  patient_workflow_id: open_encounter.workflows.consultation!
                    .patient_workflow_id,
                  workflow: 'consultation',
                  status: 'not started',
                  steps_completed: [],
                  employees: [],
                },
              },
              priority: null,
              status: {
                open: true,
                patient_presence: {
                  department_name: 'waiting room',
                  current_workflow: null,
                  next_workflow: 'triage',
                  employees: [],
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
                  patient_encounter_employee_id:
                    employee.patient_encounter_employee_id,
                  employment_id: organization_employment.non_admin_id!,
                  seen_at: open_encounter.all_employees_seen[0].seen_at,
                },
              ],
            })

            const [in_waiting_room] = await waiting_room.get(
              trx,
              organization_employment,
            )

            assertEquals(in_waiting_room, {
              patient_encounter_id,
              patient,
              arrived_ago_display: 'Just now',
              workflow_status_display: 'Awaiting Triage',
              actions: [{
                disabled: true,
                text: 'triage',
                method: 'POST',
                href:
                  `/app/organizations/${organization_id}/patients/${patient.id}/open_encounter/start-workflow?workflow=triage`,
              }],
              present_employees: [],
              reason: 'seeking treatment',
              priority_level: null,
              target_treatment_time: null,
              department_name: 'waiting room',
              arrived_timestamp: open_encounter.arrived_timestamp,
            })
          }),
      )
    })
  },
)
