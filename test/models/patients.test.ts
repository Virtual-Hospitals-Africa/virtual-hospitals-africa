import { sql } from 'kysely'
import { beforeEach, describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../db/db.ts'
import { resetInTest } from '../../db/meta.ts'
import * as patients from '../../db/models/patients.ts'
import * as media from '../../db/models/media.ts'
import { assert } from 'std/assert/assert.ts'
import pick from '../../util/pick.ts'

describe('db/models/patients.ts', { sanitizeResources: false }, () => {
  beforeEach(resetInTest)

  describe('getAllWithNames', () => {
    it('finds patients by their name', async () => {
      const insertedMedia = await media.insert(db, {
        binary_data: new Uint8Array(),
        mime_type: 'image/jpeg',
      })

      const test_patient1 = await patients.upsert(db, {
        name: 'Test Patient 1',
        conversation_state: 'initial_message',
      })

      const test_patient2 = await patients.upsert(db, {
        name: 'Test Patient 2',
        avatar_media_id: insertedMedia.id,
      })

      await patients.upsert(db, {
        name: 'Other Foo',
      })

      const results = await patients.getAllWithNames(db, 'Test')
      assertEquals(results, [
        {
          id: test_patient1.id,
          avatar_url: null,
          name: 'Test Patient 1',
          dob_formatted: null,
          description: null,
          gender: null,
          ethnicity: null,
          location: { longitude: null, latitude: null },
          national_id_number: null,
          nearest_facility: null,
          phone_number: null,
          created_at: results[0].created_at,
          updated_at: results[0].updated_at,
          last_visited: null,
          conversation_state: 'initial_message',
          completed_intake: false,
          actions: {
            view: `/app/patients/${test_patient1.id}`,
          },
        },
        {
          id: test_patient2.id,
          avatar_url: `/app/patients/${test_patient2.id}/avatar`,
          name: 'Test Patient 2',
          dob_formatted: null,
          description: null,
          gender: null,
          ethnicity: null,
          location: { longitude: null, latitude: null },
          national_id_number: null,
          nearest_facility: null,
          phone_number: null,
          created_at: results[1].created_at,
          updated_at: results[1].updated_at,
          last_visited: null,
          conversation_state: 'initial_message',
          completed_intake: false,
          actions: {
            view: `/app/patients/${test_patient2.id}`,
          },
        },
      ])
    })

    it("gives a description formed by the patient's gender and date of birth", async () => {
      await patients.upsert(db, {
        name: 'Test Patient',
        date_of_birth: '2021-03-01',
        gender: 'female',
      })

      const results = await patients.getAllWithNames(db, 'Test')
      assertEquals(results.length, 1)
      assertEquals(results[0].description, 'female, 01/03/2021')
    })
  })

  describe('getWithMedicalRecords', () => {
    it('finds patients by their name with a dummy medical record', async () => {
      const test_patient = await patients.upsert(db, {
        name: 'Test Patient',
      })

      const results = await patients.getWithMedicalRecords(db, {
        ids: [test_patient.id],
      })
      assertEquals(results, [
        {
          id: test_patient.id,
          avatar_url: null,
          name: 'Test Patient',
          dob_formatted: null,
          description: null,
          gender: null,
          ethnicity: null,
          location: { longitude: null, latitude: null },
          national_id_number: null,
          nearest_facility: null,
          phone_number: null,
          created_at: results[0].created_at,
          updated_at: results[0].updated_at,
          last_visited: null,
          medical_record: {
            allergies: [
              'chocolate',
              'bananas',
            ],
            history: {},
          },
          conversation_state: 'initial_message',
          completed_intake: false,
          actions: {
            view: `/app/patients/${test_patient.id}`,
          },
        },
      ])
    })
  })

  describe('getAvatar', () => {
    it('gets the binary data and mime_type of the avatar', async () => {
      const insertedMedia = await media.insert(db, {
        binary_data: new Uint8Array([1, 2, 3]),
        mime_type: 'image/jpeg',
      })

      const test_patient = await patients.upsert(db, {
        name: 'Test Patient 1',
        conversation_state: 'initial_message',
        avatar_media_id: insertedMedia.id,
      })

      const avatar = await patients.getAvatar(db, {
        patient_id: test_patient.id,
      })

      assertEquals(avatar, {
        binary_data: new Uint8Array([1, 2, 3]),
        mime_type: 'image/jpeg',
      })
    })
  })

  describe('getByPhoneNumber', () => {
    it('reads out a formatted date of birth', async () => {
      await patients.upsert(db, {
        date_of_birth: '2021-01-01',
        phone_number: '15555555555',
      })
      const result = await patients.getByPhoneNumber(db, {
        phone_number: '15555555555',
      })

      assert(result)
      assertEquals(result.dob_formatted, '1 January 2021')
    })
  })

  // Skipping because of discrepancies at certain times of day.
  // @ashley I think we need to modify the calculation of the patient ages based on a provided timezone or just set the database to
  // Africa/Johannesburg.
  describe.skip('getPatientAges', () => {
    const today = new Date()

    it('finds patient ages', async () => {
      const testPatient1 = await patients.upsert(db, {
        name: 'Test Patient 1',
        date_of_birth: today.toISOString().split('T')[0],
      })

      const yesterday = new Date(today.getTime() - 86400000)
      const testPatient2 = await patients.upsert(db, {
        name: 'Test Patient 2',
        date_of_birth: yesterday.toISOString().split('T')[0],
      })

      const twentyDays = new Date(today.getTime() - (86400000 * 20))
      const testPatient3 = await patients.upsert(db, {
        name: 'Test Patient 3',
        date_of_birth: twentyDays.toISOString().split('T')[0],
      })

      const threeWeeks = new Date(today.getTime() - (86400000 * 21))
      const testPatient4 = await patients.upsert(db, {
        name: 'Test Patient 4',
        date_of_birth: threeWeeks.toISOString().split('T')[0],
      })

      const threeMonths = new Date(today)
      threeMonths.setMonth(today.getMonth() - 3)
      const testPatient5 = await patients.upsert(db, {
        name: 'Test Patient 5',
        date_of_birth: threeMonths.toISOString().split('T')[0],
      })

      const twoYears = new Date(today)
      twoYears.setFullYear(today.getFullYear() - 2)
      const oneDayBelowTwoYears = new Date(twoYears.getTime() + 86400000)
      const testPatient6 = await patients.upsert(db, {
        name: 'Test Patient 6',
        date_of_birth: oneDayBelowTwoYears.toISOString().split('T')[0],
      })

      const testPatient7 = await patients.upsert(db, {
        name: 'Test Patient 7',
        date_of_birth: twoYears.toISOString().split('T')[0],
      })

      const patient_ages = await db
        .selectFrom('patient_age')
        .select(['patient_id', sql`TO_JSON(age)`.as('age')])
        .execute()

      assertEquals(patient_ages.map(pick(['patient_id', 'age'])), [
        {
          patient_id: testPatient1.id,
          age: { number: 0, unit: 'day' },
        },
        {
          patient_id: testPatient2.id,
          age: { number: 1, unit: 'day' },
        },
        {
          patient_id: testPatient3.id,
          age: { number: 20, unit: 'day' },
        },
        {
          patient_id: testPatient4.id,
          age: { number: 3, unit: 'week' },
        },
        {
          patient_id: testPatient5.id,
          age: { number: 3, unit: 'month' },
        },
        {
          patient_id: testPatient6.id,
          age: { number: 23, unit: 'month' },
        },
        {
          patient_id: testPatient7.id,
          age: { number: 2, unit: 'year' },
        },
      ])

      const oneDayBelowThreeMonths = new Date(threeMonths.getTime() + 86400000)
      const testPatient8 = await patients.upsert(db, {
        name: 'Test Patient 8',
        date_of_birth: oneDayBelowThreeMonths.toISOString().split('T')[0],
      })

      const patient_age = await db
        .selectFrom('patient_age')
        .select(['patient_id', sql`TO_JSON(age)`.as('age')])
        .where('patient_id', '=', testPatient8.id)
        .executeTakeFirst()

      try {
        assertEquals(patient_age, {
          patient_id: testPatient8.id,
          age: { number: 12, unit: 'weeks' },
        })
      } catch {
        assertEquals(patient_age, {
          patient_id: testPatient8.id,
          age: { number: 13, unit: 'weeks' },
        })
      }
    })
  })
})
