import { assert } from 'std/assert/assert.ts'
import { Profession } from '../db.d.ts'
import { Maybe } from '../types.ts'

type HealthWorkerDisplay = {
  display_name: string
  description: string
}

export default function healthWorkerDisplay(health_worker: {
  health_worker_name: string
  profession: Profession | 'regulator'
  specialty: Maybe<string>
}): HealthWorkerDisplay {
  switch (health_worker.profession) {
    case 'doctor': {
      assert(health_worker.specialty)
      return {
        display_name: 'Dr. ' + health_worker.health_worker_name,
        description: health_worker.specialty,
      }
    }
    case 'nurse': {
      assert(health_worker.specialty)
      return {
        display_name: health_worker.health_worker_name,
        description: health_worker.specialty + ' nurse',
      }
    }
    default: {
      return {
        display_name: health_worker.health_worker_name,
        description: health_worker.profession,
      }
    }
  }
}
