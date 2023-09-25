import { afterEach, beforeEach, describe, it } from 'std/testing/bdd.ts'
import { assert, assertEquals } from 'std/testing/asserts.ts'
import db from '../../db/db.ts'
import { resetInTest } from '../../db/reset.ts'
import * as employment from '../../db/models/employment.ts'
import * as health_workers from '../../db/models/health_workers.ts'
import omit from '../../util/omit.ts'
import { Profession } from '../../types.ts'

// import * as fs from 'fs';

describe('db/models/employment.ts', () => {

    beforeEach(resetInTest)
    afterEach(() => db.destroy())

    it('should add an employee', async () => {

        await health_workers.upsert(db, {
            name: 'Previous Worker 1',
            email: 'previous1@worker.com',
            avatar_url: 'avatar_url',
            gcal_appointments_calendar_id: 'gcal_appointments_calendar_id',
            gcal_availability_calendar_id: 'gcal_availability_calendar_id',
        })

    // await employment.add(db, [``
    //     {
    //         health_worker_id: 1,
    //         facility_id: 1,
    //         profession: 'doctor',
    //     },
    //     {
    //         health_worker_id: 2,
    //         facility_id: 1,
    //         profession: 'doctor',
    //     },
    //     {
    //         health_worker_id: 3,
    //         facility_id: 2,
    //         profession: 'admin',
    //     }

    // ])

    // const facility_id = 1
    // const result =
    //     await employment.getEmployeeAndInviteeByFacility(db, {facility_id}).then(
    //         (result) => {
    //             assertEquals(result.length, 2, result.toLocaleString())
    //         }
    //     )
    // console.log(result)
    // assert(result)
    })
})
