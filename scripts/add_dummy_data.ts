// deno-lint-ignore-file
import db from '../db/db.ts'
import * as health_workers from '../db/models/health_workers.ts'
import * as organizations from '../db/models/organizations.ts'
import * as patients from '../db/models/patients.ts'
import * as patient_encounters from '../db/models/patient_encounters.ts'
import * as patient_registration from '../db/models/patient_registration.ts'
import * as patient_workflows from '../db/models/patient_workflows.ts'
import * as patient_triage from '../db/models/patient_triage.ts'
import randomDemographics from '../mocks/randomDemographics.ts'
import { EncounterReason } from '../db.d.ts'
import range from '../util/range.ts'
import { sql } from 'kysely'
import { forEach } from '../util/inParallel.ts'
import {
  Workflow,
  WORKFLOW_STEPS,
  workflowStepKey,
} from '../shared/workflow.ts'
import {
  isTriageLevel,
  TARGET_TIME_TO_TREATMENT_MINUTES,
  WorkflowStatus,
} from '../types.ts'
import randomAvatar from '../mocks/randomAvatar.ts'
import randomDateOfBirth from '../mocks/randomDateOfBirth.ts'
import { TriageLevel } from '../types.ts'
import { Department } from '../shared/departments.ts'
import { timeAgoDisplay } from '../util/timeAgoDisplay.ts'
import { parseDateTime, timeInSimpleAmPm } from '../util/date.ts'
import words from '../util/words.ts'
import capitalize from '../util/capitalize.ts'
import { addTestEmployee } from '../test/_helpers/employees.ts'
import { exists } from '../util/exists.ts'
import { nonAdminId } from '../shared/nonAdminId.ts'
import randomNamesAndSex from '../mocks/randomNamesAndSex.ts'

type WaitingRoomScenario = [
  'male' | 'female',
  EncounterReason,
  Department,
  Workflow,
  WorkflowStatus['status'],
  TriageLevel | 'Undetermined',
  number,
]

// deno-fmt-ignore-start
const wm_scenarios: WaitingRoomScenario[] = [
  // sex, reason for visit, department, current workflow, workflow status, triage priority
  ['female', 'seeking treatment', 'waiting room', 'triage', 'not started', 'Undetermined', 10],
  ['male', 'seeking treatment', 'waiting room', 'consultation', 'not started', 'Non-urgent', 55],
  ['female', 'seeking treatment', 'waiting room', 'consultation', 'not started', 'Non-urgent', 48],
  ['male', 'seeking treatment', 'waiting room', 'consultation', 'not started', 'Non-urgent', 42],
  ['female', 'seeking treatment', 'waiting room', 'consultation', 'not started', 'Non-urgent', 30],
  ['female', 'seeking treatment', 'resus', 'stabilization', 'in progress', 'Emergency', 28],
  ['female', 'seeking treatment', 'reception', 'registration', 'in progress', 'Undetermined', 4],
  ['male', 'seeking treatment', 'triage', 'triage', 'in progress', 'Undetermined', 39],
  ['male', 'seeking treatment', 'triage', 'triage', 'in progress', 'Undetermined', 7],
  ['female', 'seeking treatment', 'primary care', 'consultation', 'in progress', 'Very urgent', 58],
  ['female', 'seeking treatment', 'primary care', 'consultation', 'in progress', 'Urgent', 30],
  ['male', 'seeking treatment', 'primary care', 'consultation', 'in progress', 'Non-urgent', 93],
  ['female', 'seeking treatment', 'primary care', 'consultation', 'in progress', 'Non-urgent', 78],
  ['male', 'seeking treatment', 'primary care', 'consultation', 'in progress', 'Non-urgent', 28],
]

// deno-fmt-ignore-end

type PatientScenario = [
  'male' | 'female',
  EncounterReason,
  Workflow,
  WorkflowStatus['status'],
  TriageLevel | 'Undetermined',
]

// deno-fmt-ignore-start
const patient_scenarios: PatientScenario[] = [
  // sex, reason for visit, current workflow, workflow status, triage priority
  ['female', 'seeking treatment', 'registration', 'in progress', 'Undetermined'],
  ['female', 'seeking treatment', 'triage', 'not started', 'Undetermined'],
  ['female', 'seeking treatment', 'triage', 'in progress', 'Urgent'],
  ['female', 'seeking treatment', 'consultation', 'not started', 'Non-urgent'],
  ['female', 'seeking treatment', 'consultation', 'not started', 'Non-urgent'],
  ['male', 'seeking treatment', 'consultation', 'not started', 'Non-urgent'],
  ['male', 'seeking treatment', 'consultation', 'not started', 'Non-urgent'],
  ['male', 'seeking treatment', 'consultation', 'not started', 'Non-urgent'],
  ['male', 'seeking treatment', 'consultation', 'not started', 'Non-urgent'],
  ['male', 'seeking treatment', 'consultation', 'not started', 'Non-urgent'],
]

type HW = Awaited<ReturnType<typeof addTestEmployee>>

async function addPatientsToWaitingRoom(
  { rural_clinic_organization_id, _requesting_review_of_organization_id }: {
    rural_clinic_organization_id: string
    _requesting_review_of_organization_id: string
  },
) {
  const avatars_used = new Set<string>()
  function randomAvatarNotYetUsed(sex: 'male' | 'female') {
    let random_avatar = randomAvatar(sex)
    while (avatars_used.has(random_avatar)) {
      random_avatar = randomAvatar(sex)
    }
    avatars_used.add(random_avatar)
    return random_avatar
  }

  const num_rural_clinic_medical_staff = 5
  const admin_demo = randomNamesAndSex()
  const admin = await addTestEmployee(db, {
    profession: 'admin',
    health_worker_attrs: {
      name: admin_demo.name,
      avatar_url: randomAvatarNotYetUsed(admin_demo.sex),
    },
  })

  const receptionist_demo = randomNamesAndSex()
  const _receptionist = await addTestEmployee(db, {
    profession: 'receptionist',
    health_worker_attrs: {
      name: receptionist_demo.name,
      avatar_url: randomAvatarNotYetUsed(receptionist_demo.sex),
    },
  })

  const nurses: HW[] = await Promise.all(
    range(num_rural_clinic_medical_staff).map(() => {
      const demo = randomNamesAndSex()
      return addTestEmployee(db, {
        profession: 'nurse',
        specialty: 'primary care',
        registration_status: 'not started',
        health_worker_attrs: {
          name: demo.name,
          avatar_url: randomAvatarNotYetUsed(demo.sex),
        },
      })
    }),
  )

  console.log('adding doctors...')
  const num_regional_medical_center_staff = 2

  const _doctors: HW[] = await Promise.all(
    range(num_regional_medical_center_staff).map(() => {
      const demo = randomNamesAndSex()
      return addTestEmployee(db, {
        profession: 'doctor',
        organization_id: _requesting_review_of_organization_id,
        health_worker_attrs: {
          name: demo.name,
          avatar_url: randomAvatarNotYetUsed(demo.sex),
        },
      })
    }),
  )

  console.log('adding patient scenarios...')
  const organization = await organizations.getById(
    db,
    rural_clinic_organization_id,
  )

  await forEach(
    patient_scenarios.entries(),
    async ([i, [sex, _reason, workflow, workflow_status, triage_level]]) => {
      const demo = randomDemographics('ZA', sex)
      const nurse = nurses[i % nurses.length]
      const arrived_ago = i === 0
        ? 0
        : i * 4 + (3 - Math.floor(Math.random() * 3))

      console.log(`Creating patient ${i + 1}/${patient_scenarios.length}...`)

      const health_worker = await health_workers.getEmployed(db, {
        health_worker_id: nurse.id,
      })
      const organization_employment = health_worker.organizations.find((o) =>
        o.id === rural_clinic_organization_id
      )!

      // Scenario 1: Registration in progress
      if (workflow === 'registration' && workflow_status === 'in progress') {
        const result = await patient_registration.start(
          db,
          organization,
          organization_employment,
        )

        // Backdate the arrival time
        await db.updateTable('patient_encounters')
          .where('patient_encounters.id', '=', result.patient_encounter_id)
          .set({
            created_at: sql`created_at - interval '${
              sql.raw(String(arrived_ago))
            } minute'`,
          })
          .execute()

        // Clear employment presence so this nurse can work with another patient
        await db.updateTable('employment_presence')
          .where('id', '=', exists(nonAdminId(organization_employment)))
          .set({ with_patient_id: null })
          .execute()

        console.log(`  ✓ Created patient in registration (in progress)`)
        return
      }

      // For all other scenarios, start with registration and complete it
      const result = await patient_registration.start(
        db,
        organization,
        organization_employment,
      )

      // Complete registration
      await Promise.all([
        patients.update(db, {
          id: result.patient_id,
          ...demo,
          completed_registration: true,
        }),
        // Complete all registration steps
        db.insertInto('patient_workflow_steps_completed')
          .values(
            WORKFLOW_STEPS.registration.map((step) => ({
              patient_workflow_id: result.patient_workflow_id,
              workflow_step: workflowStepKey('registration', step),
            })),
          )
          .execute(),
        patient_workflows.completedWorkflow(db, {
          patient_workflow_id: result.patient_workflow_id,
        }),
        patient_encounters.updateOne(db, result.patient_encounter_id, {
          reason: 'seeking treatment',
        }),
      ])

      // Create triage and consultation workflows
      await patient_encounters.insertSeekingTreatmentForRegisteredPatient(
        db,
        organization,
        organization_employment,
        {
          patient_id: result.patient_id,
          encounter: {
            create: false,
            patient_encounter_id: result.patient_encounter_id,
            existing: await patient_encounters.getById(
              db,
              result.patient_encounter_id,
            ),
          },
        },
      )

      // Backdate the arrival time
      await db.updateTable('patient_encounters')
        .where('patient_encounters.id', '=', result.patient_encounter_id)
        .set({
          created_at: sql`created_at - interval '${
            sql.raw(String(arrived_ago))
          } minute'`,
        })
        .execute()

      const encounter = await patient_encounters.getById(
        db,
        result.patient_encounter_id,
      )

      // Scenario 2: Triage not started (awaiting triage)
      if (workflow === 'triage' && workflow_status === 'not started') {
        // Clear employment presence so this nurse can work with another patient
        await db.updateTable('employment_presence')
          .where('id', '=', exists(nonAdminId(organization_employment)))
          .set({ with_patient_id: null })
          .execute()

        console.log(`  ✓ Created patient awaiting triage`)
        return
      }

      // Scenario 3: Triage in progress
      if (workflow === 'triage' && workflow_status === 'in progress') {
        const triage_workflow = encounter.workflows.triage!
        const existing_patient_encounter_employee_id =
          encounter.all_employees_seen[0]?.patient_encounter_employee_id || null

        // Only start the workflow if it hasn't been started yet
        if (triage_workflow.status === 'not started') {
          await patient_workflows.start(db, {
            encounter,
            existing_patient_encounter_employee_id,
            seeing_as_employment_id: exists(
              nonAdminId(organization_employment),
            ),
            workflow_status: triage_workflow,
          })
        }

        // Set priority if provided
        if (triage_level !== 'Undetermined') {
          const { triage_procedure_id } = await patient_triage.insertProcedure(
            db,
            {
              patient_id: result.patient_id,
              patient_encounter_id: result.patient_encounter_id,
              patient_encounter_employee_id:
                existing_patient_encounter_employee_id!,
            },
          )

          await patient_triage.insertLevel(db, {
            patient_id: result.patient_id,
            patient_encounter_id: result.patient_encounter_id,
            patient_encounter_employee_id:
              existing_patient_encounter_employee_id!,
            triage_procedure_id,
            triage_level,
          })
        }

        // Clear employment presence so this nurse can work with another patient
        await db.updateTable('employment_presence')
          .where('id', '=', exists(nonAdminId(organization_employment)))
          .set({ with_patient_id: null })
          .execute()

        console.log(`  ✓ Created patient in triage (in progress)`)
        return
      }

      // For consultation scenarios, complete triage first
      if (workflow === 'consultation') {
        const triage_workflow = encounter.workflows.triage!
        const existing_patient_encounter_employee_id =
          encounter.all_employees_seen[0]?.patient_encounter_employee_id || null

        // Only start the workflow if it hasn't been started yet
        if (triage_workflow.status === 'not started') {
          await patient_workflows.start(db, {
            encounter,
            existing_patient_encounter_employee_id,
            seeing_as_employment_id: exists(
              nonAdminId(organization_employment),
            ),
            workflow_status: triage_workflow,
          })
        }

        // Set priority and complete triage
        if (triage_level !== 'Undetermined') {
          const { triage_procedure_id } = await patient_triage.insertProcedure(
            db,
            {
              patient_id: result.patient_id,
              patient_encounter_id: result.patient_encounter_id,
              patient_encounter_employee_id:
                existing_patient_encounter_employee_id!,
            },
          )

          await patient_triage.insertLevel(db, {
            patient_id: result.patient_id,
            patient_encounter_id: result.patient_encounter_id,
            patient_encounter_employee_id:
              existing_patient_encounter_employee_id!,
            triage_procedure_id,
            triage_level,
          })
        }

        // Complete triage
        await Promise.all([
          db.insertInto('patient_workflow_steps_completed')
            .values(
              WORKFLOW_STEPS.triage.map((step) => ({
                patient_workflow_id: triage_workflow.patient_workflow_id,
                workflow_step: workflowStepKey('triage', step),
              })),
            )
            .execute(),
          patient_workflows.completedWorkflow(db, {
            patient_workflow_id: triage_workflow.patient_workflow_id,
          }),
        ])

        // Scenario 4: Seeking treatment not started
        if (workflow_status === 'not started') {
          // Clear employment presence so this nurse can work with another patient
          await db.updateTable('employment_presence')
            .where('id', '=', exists(nonAdminId(organization_employment)))
            .set({ with_patient_id: null })
            .execute()

          console.log(`  ✓ Created patient awaiting seeking treatment`)
          return
        }

        // Scenario 5: Seeking treatment in progress
        if (workflow_status === 'in progress') {
          const updated_encounter = await patient_encounters.getById(
            db,
            result.patient_encounter_id,
          )
          const consultation_workflow = updated_encounter.workflows
            .consultation!

          await patient_workflows.start(db, {
            encounter: updated_encounter,
            existing_patient_encounter_employee_id,
            seeing_as_employment_id: exists(
              nonAdminId(organization_employment),
            ),
            workflow_status: consultation_workflow,
          })

          // Clear employment presence so this nurse can work with another patient
          await db.updateTable('employment_presence')
            .where('id', '=', exists(nonAdminId(organization_employment)))
            .set({ with_patient_id: null })
            .execute()

          console.log(`  ✓ Created patient in seeking treatment (in progress)`)
          return
        }
      }

      // Clear employment presence so this nurse can work with another patient
      await db.updateTable('employment_presence')
        .where('id', '=', exists(nonAdminId(organization_employment)))
        .set({ with_patient_id: null })
        .execute()

      console.log(`  ✓ Created patient scenario`)
    },
    { concurrency: 1 },
  )

  return { admin, nurses }
}

// Load the inventory with 100 random drugs random
async function addInventoryTransactions(admin: HW, _nurses: HW[]) {
  // const procurer = (await db.selectFrom('procurers')
  //   .where('name', '=', 'Regional Supplier')
  //   .selectAll()
  //   .executeTakeFirst()) || (
  //     await db.insertInto('procurers')
  //       .values({ name: 'Regional Supplier' })
  //       .returning('id')
  //       .executeTakeFirstOrThrow()
  //   )

  // const manufactured_medication_ids = await db.selectFrom(
  //   'manufactured_medications',
  // )
  //   .select('id')
  //   .orderBy('id', 'desc')
  //   .limit(200)
  //   .execute()

  // const manufactured_meds = await manufactured_medications.getByIds(
  //   db,
  //   manufactured_medication_ids.map(({ id }) => id),
  // )

  // for (const manufactured_medication of manufactured_meds) {
  //   const container_size = sample([10, 20, 40, 100])
  //   const number_of_containers = sample([40, 100, 200])

  //   await inventory.addOrganizationMedicine(
  //     db,
  //     '00000000-0000-0000-0000-000000000001',
  //     {
  //       created_by: admin.employee_id!,
  //       manufactured_medication_id: manufactured_medication.id,
  //       procured_from_id: procurer.id,
  //       quantity: number_of_containers * container_size,
  //       number_of_containers,
  //       container_size,
  //       strength: sample(manufactured_medication.strength_numerators),
  //       expiry_date: '2025-03-01',
  //       batch_number: '622',
  //     },
  //   )
  // }
}

// TODO make organizations, scenarios, etc. configurable. For now, hardcoding
async function addDummyData() {
  /*const { admin, nurses } = */
  await addPatientsToWaitingRoom({
    rural_clinic_organization_id: '00000000-0000-0000-0000-000000000001',
    _requesting_review_of_organization_id:
      '00000000-0000-0000-0000-000000000002',
  })

  // await addPatientsToWaitingRoom({
  //   rural_clinic_organization_id: '00000000-0000-0000-0000-000000000001',
  //   requesting_review_of_organization_id:
  //     '94f25f33-a472-4743-959d-403796ee9ad4',
  // })

  // await addInventoryTransactions(admin, nurses)
}

// function foo() {
//   const x = wm_scenarios.map(([sex, reason, department, workflow, workflow_status, priority, arrived_at_minutes_ago]) => {
//     const patient = randomPatientMandatoryRegistrationInformation('ZA', sex)
//     let target_time_to_treatment: string | number | null = null
//     if (isTriageLevel(priority)) {
//       const target_minutes = TARGET_TIME_TO_TREATMENT_MINUTES[priority] - arrived_at_minutes_ago
//       if (target_minutes <= 0) {
//         target_time_to_treatment = 'Immediately'
//       } else {

//         const d = new Date('2025-10-09T09:39:07.940Z')
//         d.setMinutes(d.getMinutes() + target_minutes)
//         target_time_to_treatment = timeInSimpleAmPm(parseDateTime(d, 'numeric'))
//       }
//     }

//     let provider: string | null = null
//     if (workflow_status === 'in progress') {
//       let specialty = department
//       if (department === 'resus') {
//         specialty = 'primary care'
//       }
//       provider = `${randomPatientMandatoryRegistrationInformation('ZA').name} (${specialty})`
//     }

//     const status = workflow_status === 'in progress'
//       ? `${capitalize(workflow)} In Progress`
//       : `Awaiting ${capitalize(workflow)}`

//     return {
//       patient: `${patient.name} / ${patient.sex}, ${patient.date_of_birth}`,
//       reason, status, priority,
//       provider,
//       location: department,
//       arrived_ago_display: timeAgoDisplay({
//         hours: 0,
//         minutes: arrived_at_minutes_ago,
//         seconds: 0,
//         milliseconds: 0,
//       }),

//       target_time_to_treatment,
//     }
//   })

//   console.log(JSON.stringify(x, null, 2))
// }

if (import.meta.main) {
  addDummyData()
}
