import { beforeEach, describe, it } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import { resetInTest } from '../../db/reset.ts'
import * as patient_measurements from '../../db/models/patient_measurements.ts'
import * as patient_encounters from '../../db/models/patient_encounters.ts'
import * as patients from '../../db/models/patients.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { addTestHealthWorker } from '../web/utilities.ts'

describe(
  'db/models/patient_measurements.ts',
  { sanitizeResources: false },
  () => {
    beforeEach(resetInTest)

    describe('add', () => {
      it('can add height and weight in cm and kg', async () => {
        const nurse = await addTestHealthWorker({ scenario: 'approved-nurse' })
        const patient = await patients.upsert(db, { name: 'Test Patient' })
        const encounter = await patient_encounters.create(db, 1, {
          patient_id: patient.id,
          reason: 'seeking treatment',
          employment_ids: [nurse.employee_id!],
        })
        assertEquals(encounter.provider_ids.length, 1)
        await patient_measurements.add(db, {
          patient_id: patient.id,
          encounter_id: encounter.id,
          encounter_provider_id: encounter.provider_ids[0],
          measurements: {
            height: [170.3, 'cm'],
            weight: [70.4, 'kg'],
          },
        })
      })
    })

    // describe('getVitals', () => {
    //   it('can get vitals for a patient across time', async () => {
    //     const nurse = await addTestHealthWorker({ scenario: 'approved-nurse' })
    //     const patient = await patients.upsert(db, { name: 'Test Patient' })
    //     const encounter = await patient_encounters.create(db, 1, {
    //       patient_id: patient.id,
    //       reason: 'seeking treatment',
    //       employment_ids: [nurse.employee_id!],
    //     })
    //     assertEquals(encounter.provider_ids.length, 1)
    //     await patient_measurements.add(db, {
    //       patient_id: patient.id,
    //       encounter_id: encounter.id,
    //       encounter_provider_id: encounter.provider_ids[0],
    //       measurements: {
    //         height: [170.3, 'cm'],
    //         weight: [70.4, 'kg'],
    //       }
    //     })
    //     const vitals = await patient_measurements.getVitals(db, {
    //       patient_id: patient.id,
    //     })
    //     assertEquals(vitals, [
    //       {
    //         encounter,
    //         measurements: {
    //           height: [170.3, 'cm'],
    //           weight: [70.4, 'kg'],
    //         }
    //       }
    //     ])
    //   })
    // })
  },
)
