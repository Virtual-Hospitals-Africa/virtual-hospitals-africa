import db from '../db/db.ts'
import * as health_workers from '../db/models/health_workers.ts'
import * as media from '../db/models/media.ts'
import * as patients from '../db/models/patients.ts'
import * as patient_encounters from '../db/models/patient_encounters.ts'
import * as inventory from '../db/models/inventory.ts'
import { addTestHealthWorker } from '../test/web/utilities.ts'
import { randomZimbabweanDemographics } from '../util/zimbabweanDemographics.ts'
import { EncounterReason } from '../db.d.ts'
import { ENCOUNTER_STEPS } from '../shared/encounter.ts'
import { INTAKE_STEPS } from '../shared/intake.ts'
import range from '../util/range.ts'
import shuffle from '../util/shuffle.ts'
import { sql } from 'kysely/index.js'
import { searchManufacturedMedications } from '../db/models/drugs.ts'
import sample from '../util/sample.ts'

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

const scenarios: ['male' | 'female', EncounterReason][] = [
  ['female', 'maternity'],
  ['female', 'seeking treatment'],
  ['female', 'seeking treatment'],
  ['female', 'seeking treatment'],
  ['female', 'seeking treatment'],
  ['male', 'seeking treatment'],
  ['male', 'seeking treatment'],
  ['male', 'seeking treatment'],
  ['male', 'seeking treatment'],
]

type HW = Awaited<ReturnType<typeof addTestHealthWorker>>

async function addPatientsToWaitingRoom() {
  await db.deleteFrom('health_workers').execute()
  await db.deleteFrom('patients').execute()
  const avatars_used = new Set<string>()
  function randomAvatarNotYetUsed(gender: 'male' | 'female') {
    let random_avatar = randomAvatar(gender)
    while (avatars_used.has(random_avatar)) {
      random_avatar = randomAvatar(gender)
    }
    avatars_used.add(random_avatar)
    return random_avatar
  }

  const me = randomZimbabweanDemographics()
  await db.updateTable('health_workers')
    .where('health_workers.email', '=', 'will.weiss1230@gmail.com')
    .set({
      name: me.name,
      avatar_url: randomAvatarNotYetUsed(me.gender),
    })
    .execute()

  const num_patients = scenarios.length
  const num_nurses = 5
  const admin_demo = randomZimbabweanDemographics()
  const admin = await addTestHealthWorker(db, {
    scenario: 'admin',
    health_worker_attrs: {
      name: admin_demo.name,
      avatar_url: randomAvatarNotYetUsed(admin_demo.gender),
    },
  })
  const nurses: HW[] = await Promise.all(
    range(num_nurses).map(() => {
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

  for (let i = 0; i < num_patients; i++) {
    const [gender, reason] = scenarios[i]
    const demo = randomZimbabweanDemographics(gender)
    const random_avatar = randomAvatarNotYetUsed(gender)
    const file = Deno.readFileSync(`./static/${random_avatar}`)
    const inserted_media = await media.insert(db, {
      mime_type: 'image/png',
      binary_data: file,
    })

    const health_worker = nurses[num_patients - i - 1]

    const patient = await patients.upsert(db, {
      name: `${demo.first_name} ${demo.last_name}`,
      date_of_birth: randomDateOfBirth(),
      gender: demo.gender,
      avatar_media_id: inserted_media.id,
    })

    const patient_encounter = await patient_encounters.upsert(db, '00000000-0000-0000-0000-000000000001', {
      patient_id: patient.id,
      reason,
      provider_ids: health_worker ? [health_worker.employee_id!] : [],
    })

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

    if (health_worker) {
      await patient_encounters.removeFromWaitingRoomAndAddSelfAsProvider(db, {
        health_worker: await health_workers.getEmployed(db, {
          health_worker_id: health_worker.id,
        }),
        patient_id: patient.id,
        encounter_id: patient_encounter.id,
      })

      const in_intake = Math.random() < 0.2

      if (in_intake) {
        const on_intake_step = shuffle(INTAKE_STEPS)[0]
        const intake_steps_completed = INTAKE_STEPS.slice(
          0,
          INTAKE_STEPS.indexOf(on_intake_step),
        )
        if (intake_steps_completed.length > 0) {
          await db.insertInto('patient_intake')
            .values(intake_steps_completed.map((intake_step) => ({
              patient_id: patient.id,
              intake_step,
            })))
            .execute()
        }
      } else {
        await db.updateTable('patients')
          .where('patients.id', '=', patient.id)
          .set({ completed_intake: true })
          .execute()
        const on_encounter_step = shuffle(ENCOUNTER_STEPS)[0]
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
    }
  }
  return { admin, nurses }
}

// Load the inventory with 100 random drugs random
async function addInventoryTransactions(admin: HW, _nurses: HW[]) {
  const procurer = (await db.selectFrom('procurers')
    .where('name', '=', 'Regional Supplier')
    .selectAll()
    .executeTakeFirst()) || (
      await db.insertInto('procurers')
        .values({ name: 'Regional Supplier' })
        .returning('id')
        .executeTakeFirstOrThrow()
    )

  const max_manufactured_medication_id = await db.selectFrom(
    'manufactured_medications',
  )
    .select('id')
    .orderBy('id', 'desc')
    .executeTakeFirstOrThrow()

  const num_medications = 200
  const manufactured_medication_ids = shuffle(
    range(1, max_manufactured_medication_id.id + 1),
  ).slice(0, num_medications)

  const manufactured_medications = await searchManufacturedMedications(db, {
    ids: manufactured_medication_ids,
  })

  for (const manufactured_medication of manufactured_medications) {
    const container_size = sample([10, 20, 40, 100])
    const number_of_containers = sample([40, 100, 200])

    await inventory.addFacilityMedicine(db, 1, {
      created_by: admin.employee_id!,
      manufactured_medication_id: manufactured_medication.id,
      procured_from_id: procurer.id,
      quantity: number_of_containers * container_size,
      number_of_containers,
      container_size,
      strength: sample(manufactured_medication.strength_numerators),
      expiry_date: '2025-03-01',
      batch_number: '622',
    })
  }
}

async function addDummyData() {
  const { admin, nurses } = await addPatientsToWaitingRoom()
  await addInventoryTransactions(admin, nurses)
}

if (import.meta.main) {
  addDummyData()
}
