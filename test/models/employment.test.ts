import { afterEach, beforeEach, describe, it } from 'std/testing/bdd.ts'
import { assert, assertEquals } from 'std/testing/asserts.ts'
import db from '../../db/db.ts'
import { resetInTest } from '../../db/reset.ts'
import * as employment from '../../db/models/employment.ts'
import * as health_workers from '../../db/models/health_workers.ts'
import { Profession } from '../../types.ts'

describe('db/models/employment.ts', () => {
  beforeEach(resetInTest)
  afterEach(() => db.destroy())

  it('should add an employee', async () => {
    const prev_worker_1 = await health_workers.upsert(db, {
      name: 'Previous Worker 1',
      email: 'previous1@worker.com',
      avatar_url: 'avatar_url',
      gcal_appointments_calendar_id: 'gcal_appointments_calendar_id',
      gcal_availability_calendar_id: 'gcal_availability_calendar_id',
    })
    const prev_worker_1_id = prev_worker_1.id
    assert(prev_worker_1)

    const prev_worker_2 = await health_workers.upsert(db, {
      name: 'Previous Worker 2',
      email: 'previous2@worker.com',
      avatar_url: 'avatar_url',
      gcal_appointments_calendar_id: 'gcal_appointments_calendar_id',
      gcal_availability_calendar_id: 'gcal_availability_calendar_id',
    })
    const prev_worker_2_id = prev_worker_2.id
    assert(prev_worker_2)

    const prev_worker_3 = await health_workers.upsert(db, {
      name: 'Previous Worker 3',
      email: 'previous3@worker.com',
      avatar_url: 'avatar_url',
      gcal_appointments_calendar_id: 'gcal_appointments_calendar_id',
      gcal_availability_calendar_id: 'gcal_availability_calendar_id',
    })
    assert(prev_worker_3)

    await employment.add(db, [
      {
        health_worker_id: prev_worker_1.id,
        facility_id: 3,
        profession: 'doctor',
      },
      {
        health_worker_id: prev_worker_2.id,
        facility_id: 3,
        profession: 'doctor',
      },
      {
        health_worker_id: prev_worker_1.id,
        facility_id: 3,
        profession: 'admin',
      },
      {
        health_worker_id: prev_worker_2.id,
        facility_id: 3,
        profession: 'nurse',
      },
      {
        health_worker_id: prev_worker_3.id,
        facility_id: 4,
        profession: 'doctor',
      },
    ])

    const professions_info: Map<number, Profession[]> = new Map<number, Profession[]>([
      [prev_worker_1_id, ['admin', 'doctor']],
      [prev_worker_2_id, ['doctor', 'nurse']],
    ])

    const facility_id = 3
    const result = await employment.getEmployeeAndInviteeByFacility(db, {
      facility_id,
    })

    assert(result, 'Result doesn\'t exist')
    assertEquals(result.length, 2, result.toLocaleString())

    for (const resultValue of result) {
      const expected_professions = professions_info.get(
        resultValue.health_worker_id,
      )

      assertEquals(
        resultValue.professions,
        expected_professions
      )
    }
  })
})
