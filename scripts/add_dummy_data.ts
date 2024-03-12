import db from '../db/db.ts'
import * as patient_encounters from '../db/models/patient_encounters.ts'
import { addTestHealthWorker } from '../test/web/utilities.ts'
import { randomZimbabweanDemographics } from '../util/zimbabweanDemographics.ts'
import { EncounterReason } from '../db.d.ts'
import range from '../util/range.ts'
import shuffle from '../util/shuffle.ts'

// deno-lint-ignore no-unused-vars
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
    return 'emergency'
  } else if (gender === 'female') {
    return 'maternity'
  } else {
    return 'seeking treatment'
  }
}

/*
  Add 3 nurses and 25 patients at various stages of intake & consultation
*/

async function addDummyData() {
  const hw1 = await addTestHealthWorker(db, {
    scenario: 'approved-nurse',
    health_worker_attrs: {
      name: randomZimbabweanDemographics().name,
    },
  })
  const hw2 = await addTestHealthWorker(db, {
    scenario: 'approved-nurse',
    health_worker_attrs: {
      name: randomZimbabweanDemographics().name,
    },
  })
  const hw3 = await addTestHealthWorker(db, {
    scenario: 'approved-nurse',
    health_worker_attrs: {
      name: randomZimbabweanDemographics().name,
    },
  })
  const hws = [hw1, hw2, hw3]
  const patient_indexes = shuffle(range(0, 25)).slice(0, 3)

  for (let i = 0; i < 25; i++) {
    const demo = randomZimbabweanDemographics()
    const reason = randomReason(demo.gender)

    const hw_index = patient_indexes.indexOf(i)
    const health_worker = hw_index !== -1 ? hws[hw_index] : null

    await patient_encounters.upsert(db, 1, {
      patient_name: demo.name,
      reason,
      provider_ids: health_worker ? [health_worker.employee_id!] : [],
    })
  }
}

if (import.meta.main) {
  addDummyData()
}
