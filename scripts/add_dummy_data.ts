import db from '../db/db.ts'
import * as health_workers from '../db/models/health_workers.ts'
import * as media from '../db/models/media.ts'
import * as doctor_reviews from '../db/models/doctor_reviews.ts'
import * as patients from '../db/models/patients.ts'
import * as patient_encounters from '../db/models/patient_encounters.ts'
// import * as inventory from '../db/models/inventory.ts'
import { addTestHealthWorker } from '../test/web/utilities.ts'
import { randomZimbabweanDemographics } from '../util/zimbabweanDemographics.ts'
import { EncounterReason } from '../db.d.ts'
import { ENCOUNTER_STEPS } from '../shared/encounter.ts'
import range from '../util/range.ts'
import shuffle from '../util/shuffle.ts'
import { sql } from 'kysely/index.js'
// import manufactured_medications from '../db/models/manufactured_medications.ts'
// import sample from '../util/sample.ts'

function randomDateOfBirth() {
  const start = new Date(1950, 0, 1)
  const end = new Date(2005, 0, 1)
  const date = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  )
  return date.toISOString().slice(0, 10)
}

// deno-lint-ignore no-unused-vars
function randomReason(gender: 'female' | 'male'): EncounterReason {
  const reason_seed = Math.random()
  if (reason_seed < 0.85) {
    return 'seeking treatment'
  } else if (reason_seed < 0.9) {
    // return 'emergency'
    return 'seeking treatment'
  } else if (gender === 'female') {
    return 'maternity'
  } else {
    return 'seeking treatment'
  }
}

function randomAvatar(gender: 'male' | 'female') {
  return `/images/avatars/random/${gender}/${
    1 + Math.floor(Math.random() * 10)
  }.png`
}

type PatientScenario =
  | ['male' | 'female', EncounterReason]
  | ['male' | 'female', EncounterReason, 'review requested']

const patient_scenarios: PatientScenario[] = [
  ['female', 'maternity'],
  ['female', 'seeking treatment'],
  ['female', 'seeking treatment'],
  ['female', 'seeking treatment'],
  ['female', 'seeking treatment'],
  ['male', 'seeking treatment'],
  ['male', 'seeking treatment'],
  ['male', 'seeking treatment'],
  ['male', 'seeking treatment'],
  ['male', 'seeking treatment'],
  ['female', 'seeking treatment', 'review requested'],
]

type HW = Awaited<ReturnType<typeof addTestHealthWorker>>

async function addPatientsToWaitingRoom() {
  const avatars_used = new Set<string>()
  function randomAvatarNotYetUsed(gender: 'male' | 'female') {
    let random_avatar = randomAvatar(gender)
    while (avatars_used.has(random_avatar)) {
      random_avatar = randomAvatar(gender)
    }
    avatars_used.add(random_avatar)
    return random_avatar
  }

  const num_medical_staff = 5
  const admin_demo = randomZimbabweanDemographics()
  const admin = await addTestHealthWorker(db, {
    scenario: 'admin',
    health_worker_attrs: {
      name: admin_demo.name,
      avatar_url: randomAvatarNotYetUsed(admin_demo.gender),
    },
  })
  console.log('admin')
  const nurses: HW[] = await Promise.all(
    range(num_medical_staff).map(() => {
      const demo = randomZimbabweanDemographics()
      return addTestHealthWorker(db, {
        scenario: 'approved-nurse',
        health_worker_attrs: {
          name: demo.name,
          avatar_url: randomAvatarNotYetUsed(demo.gender),
        },
      })
    }),
  )

  // const doctors: HW[] = await Promise.all(
  //   range(num_medical_staff).map(() => {
  //     const demo = randomZimbabweanDemographics()
  //     return addTestHealthWorker(db, {
  //       scenario: 'doctor',
  //       organization_id: '00000000-0000-0000-0000-000000000002',
  //       health_worker_attrs: {
  //         name: demo.name,
  //         avatar_url: randomAvatarNotYetUsed(demo.gender),
  //       },
  //     })
  //   }),
  // )

  await Promise.all(
    patient_scenarios.map(async ([gender, reason, review_status], i) => {
      const demo = randomZimbabweanDemographics(gender)

      const random_avatar = randomAvatarNotYetUsed(gender)
      const file = Deno.readFileSync(`./static/${random_avatar}`)
      const inserted_media = await media.insert(db, {
        mime_type: 'image/png',
        binary_data: file,
      })

      const nurse = nurses[i % nurses.length]
      // const doctor = doctors[i % doctors.length]

      const patient = await patients.insert(db, {
        name: `${demo.first_name} ${demo.last_name}`,
        date_of_birth: randomDateOfBirth(),
        gender: demo.gender,
        avatar_media_id: inserted_media.id,
      })

      const patient_encounter = await patient_encounters.upsert(
        db,
        '00000000-0000-0000-0000-000000000001',
        {
          patient_id: patient.id,
          reason,
          provider_ids: nurse ? [nurse.employee_id!] : [],
        },
      )

      const arrived_ago = i === 0
        ? 0
        : i * 4 + (3 - Math.floor(Math.random() * 3))

      await db.updateTable('patient_encounters')
        .where('patient_encounters.id', '=', patient_encounter.id)
        .set({
          created_at: sql`created_at - interval '${
            sql.raw(String(arrived_ago))
          } minute'`,
        })
        .execute()

      await patient_encounters.removeFromWaitingRoomAndAddSelfAsProvider(db, {
        health_worker: await health_workers.getEmployed(db, {
          health_worker_id: nurse.id,
        }),
        patient_id: patient.id,
        encounter_id: patient_encounter.id,
      })

      const in_intake = Math.random() < 0.2

      if (!in_intake) {
        await db.updateTable('patients')
          .where('patients.id', '=', patient.id)
          .set({ completed_intake: true })
          .execute()
        const on_encounter_step = ENCOUNTER_STEPS[10]
        const encounter_steps_completed = ENCOUNTER_STEPS.slice(
          0,
          ENCOUNTER_STEPS.indexOf(on_encounter_step),
        )
        if (encounter_steps_completed.length > 0) {
          await db.insertInto('patient_encounter_steps')
            .values(encounter_steps_completed.map((encounter_step) => ({
              patient_encounter_id: patient_encounter.id,
              encounter_step,
            })))
            .execute()
        }
      }

      if (review_status === 'review requested') {
        await doctor_reviews.upsertRequest(db, {
          patient_id: patient.id,
          encounter_id: patient_encounter.id,
          requested_by: patient_encounter.providers[0].encounter_provider_id,
          organization_id: '00000000-0000-0000-0000-000000000002',
          doctor_id: null,
          requester_notes: 'Patient has lower back pain',
        })
      }
    }),
  )

  return { admin, nurses }
}

// Load the inventory with 100 random drugs random
// async function addInventoryTransactions(admin: HW, _nurses: HW[]) {
//   // const procurer = (await db.selectFrom('procurers')
//   //   .where('name', '=', 'Regional Supplier')
//   //   .selectAll()
//   //   .executeTakeFirst()) || (
//   //     await db.insertInto('procurers')
//   //       .values({ name: 'Regional Supplier' })
//   //       .returning('id')
//   //       .executeTakeFirstOrThrow()
//   //   )

//   // const manufactured_medication_ids = await db.selectFrom(
//   //   'manufactured_medications',
//   // )
//   //   .select('id')
//   //   .orderBy('id', 'desc')
//   //   .limit(200)
//   //   .execute()

//   // const manufactured_meds = await manufactured_medications.getByIds(
//   //   db,
//   //   manufactured_medication_ids.map(({ id }) => id),
//   // )

//   // for (const manufactured_medication of manufactured_meds) {
//   //   const container_size = sample([10, 20, 40, 100])
//   //   const number_of_containers = sample([40, 100, 200])

//   //   await inventory.addOrganizationMedicine(
//   //     db,
//   //     '00000000-0000-0000-0000-000000000001',
//   //     {
//   //       created_by: admin.employee_id!,
//   //       manufactured_medication_id: manufactured_medication.id,
//   //       procured_from_id: procurer.id,
//   //       quantity: number_of_containers * container_size,
//   //       number_of_containers,
//   //       container_size,
//   //       strength: sample(manufactured_medication.strength_numerators),
//   //       expiry_date: '2025-03-01',
//   //       batch_number: '622',
//   //     },
//   //   )
//   // }
// }

async function addDummyData() {
  /*const { admin, nurses } = */
  await addPatientsToWaitingRoom()
  // await addInventoryTransactions(admin, nurses)
}

if (import.meta.main) {
  addDummyData()
}
