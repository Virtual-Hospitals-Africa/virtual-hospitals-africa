import db from '../db/db.ts'
import * as health_workers from '../db/models/health_workers.ts'
import * as media from '../db/models/media.ts'
import * as patients from '../db/models/patients.ts'
import * as patient_encounters from '../db/models/patient_encounters.ts'
import { addTestHealthWorker } from '../test/web/utilities.ts'
import { randomZimbabweanDemographics } from '../util/zimbabweanDemographics.ts'
import { EncounterReason } from '../db.d.ts'
import { ENCOUNTER_STEPS } from '../shared/encounter.ts'
import { INTAKE_STEPS } from '../shared/intake.ts'
import range from '../util/range.ts'
import shuffle from '../util/shuffle.ts'
import { sql } from 'kysely/index.js'

function randomDateOfBirth() {
  const start = new Date(1950, 0, 1)
  const end = new Date(2005, 0, 1)
  const date = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  )
  return date.toISOString().slice(0, 10)
}

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

/*
  Add 3 nurses and 10 patients
  at various stages of intake & consultation
*/
async function addDummyData() {
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

  const num_patients = 8
  const num_nurses = 5
  const nurses: Awaited<ReturnType<typeof addTestHealthWorker>>[] = []
  async function addNurse() {
    const demo = randomZimbabweanDemographics()
    nurses.push(
      await addTestHealthWorker(db, {
        scenario: 'approved-nurse',
        health_worker_attrs: {
          name: demo.name,
          avatar_url: randomAvatarNotYetUsed(demo.gender),
        },
      }),
    )
  }
  await Promise.all(range(num_nurses).map(addNurse))

  for (let i = 0; i < num_patients; i++) {
    const demo = randomZimbabweanDemographics()
    const random_avatar = randomAvatarNotYetUsed(demo.gender)
    const file = Deno.readFileSync(`./static/${random_avatar}`)
    const inserted_media = await media.insert(db, {
      mime_type: 'image/png',
      binary_data: file,
    })

    const reason = randomReason(demo.gender)

    const health_worker = nurses[num_patients - i - 1]

    const patient = await patients.upsert(db, {
      name: `${demo.first_name} ${demo.last_name}`,
      date_of_birth: randomDateOfBirth(),
      gender: demo.gender,
      avatar_media_id: inserted_media.id,
    })

    const patient_encounter = await patient_encounters.upsert(db, 1, {
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
}

if (import.meta.main) {
  addDummyData()
}
