import { beforeEach, describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../db/db.ts'
import { resetInTest } from '../../db/meta.ts'
import * as patients from '../../db/models/patients.ts'
import * as media from '../../db/models/media.ts'
import { assert } from 'std/assert/assert.ts'

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
          href: `/app/patients/${test_patient1.id}`,
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
        },
        {
          id: test_patient2.id,
          href: `/app/patients/${test_patient2.id}`,
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
          href: `/app/patients/${test_patient.id}`,
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
})
