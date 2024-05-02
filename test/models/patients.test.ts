import { sql } from 'kysely'
import { describe } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import * as patients from '../../db/models/patients.ts'
import * as patient_encounters from '../../db/models/patient_encounters.ts'
import * as media from '../../db/models/media.ts'
import { assert } from 'std/assert/assert.ts'
import pick from '../../util/pick.ts'
import { itUsesTrxAnd } from '../web/utilities.ts'
import generateUUID from '../../util/uuid.ts'
import { randomPhoneNumber } from '../mocks.ts'
import sortBy from '../../util/sortBy.ts'

describe('db/models/patients.ts', { sanitizeResources: false }, () => {
  describe('getAllWithNames', () => {
    itUsesTrxAnd('finds patients by their name', async (trx) => {
      const insertedMedia = await media.insert(trx, {
        binary_data: new Uint8Array(),
        mime_type: 'image/jpeg',
      })

      const baseUUID = generateUUID()

      const test_patient1 = await patients.upsert(trx, {
        name: baseUUID + generateUUID(),
        conversation_state: 'initial_message',
      })

      const test_patient2 = await patients.upsert(trx, {
        name: baseUUID + generateUUID(),
        avatar_media_id: insertedMedia.id,
      })

      await patients.upsert(trx, {
        name: 'Other Foo',
      })

      const results = await patients.getAllWithNames(trx, baseUUID)
      assertEquals(
        results,
        sortBy([
          {
            id: test_patient1.id,
            avatar_url: null,
            name: test_patient1.name!,
            dob_formatted: null,
            description: null,
            gender: null,
            ethnicity: null,
            location: { longitude: null, latitude: null },
            national_id_number: null,
            nearest_organization: null,
            phone_number: null,
            last_visited: null,
            conversation_state: 'initial_message' as const,
            completed_intake: false,
            intake_steps_completed: [],
            actions: {
              view: `/app/patients/${test_patient1.id}`,
            },
          },
          {
            id: test_patient2.id,
            avatar_url: `/app/patients/${test_patient2.id}/avatar`,
            name: test_patient2.name!,
            dob_formatted: null,
            description: null,
            gender: null,
            ethnicity: null,
            location: { longitude: null, latitude: null },
            national_id_number: null,
            nearest_organization: null,
            phone_number: null,
            last_visited: null,
            conversation_state: 'initial_message' as const,
            completed_intake: false,
            intake_steps_completed: [],
            actions: {
              view: `/app/patients/${test_patient2.id}`,
            },
          },
        ], 'name'),
      )
    })

    itUsesTrxAnd(
      "gives a description formed by the patient's gender and date of birth",
      async (trx) => {
        const name = generateUUID()
        await patients.upsert(trx, {
          name,
          date_of_birth: '2021-03-01',
          gender: 'female',
        })

        const results = await patients.getAllWithNames(trx, name)
        assertEquals(results.length, 1)
        assertEquals(results[0].description, 'female, 01/03/2021')
      },
    )
  })

  describe('getWithOpenEncounter', () => {
    itUsesTrxAnd('finds patients without an open encounter', async (trx) => {
      const test_patient = await patients.upsert(trx, {
        name: 'Test Patient',
      })

      const results = await patients.getWithOpenEncounter(trx, {
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
          nearest_organization: null,
          phone_number: null,
          last_visited: null,
          conversation_state: 'initial_message',
          completed_intake: false,
          intake_steps_completed: [],
          actions: {
            view: `/app/patients/${test_patient.id}`,
          },
          open_encounter: null,
        },
      ])
    })

    itUsesTrxAnd('finds patients with an open encounter', async (trx) => {
      const encounter = await patient_encounters.upsert(
        trx,
        '00000000-0000-0000-0000-000000000001',
        {
          patient_name: 'Test Patient',
          reason: 'seeking treatment',
        },
      )
      const { patient_id } = encounter

      const results = await patients.getWithOpenEncounter(trx, {
        ids: [patient_id],
      })
      assertEquals(results, [
        {
          id: patient_id,
          avatar_url: null,
          name: 'Test Patient',
          dob_formatted: null,
          description: null,
          gender: null,
          ethnicity: null,
          location: { longitude: null, latitude: null },
          national_id_number: null,
          nearest_organization: null,
          phone_number: null,
          last_visited: null,
          conversation_state: 'initial_message',
          completed_intake: false,
          intake_steps_completed: [],
          actions: {
            view: `/app/patients/${patient_id}`,
          },
          open_encounter: {
            encounter_id: encounter.id,
            patient_id,
            reason: 'seeking treatment',
            providers: [],
            created_at: results[0].open_encounter!.created_at,
            closed_at: null,
            notes: null,
            appointment_id: null,
            waiting_room_id: encounter.waiting_room_id,
            waiting_room_organization_id:
              '00000000-0000-0000-0000-000000000001',
            steps_completed: [],
            examinations: [],
          },
        },
      ])
    })

    itUsesTrxAnd(
      'returns recommended examinations once date of birth is filled in',
      async (trx) => {
        const patient = await patients.upsert(trx, {
          name: 'Test Patient',
          date_of_birth: '1989-01-03',
          gender: 'male',
        })
        const encounter = await patient_encounters.upsert(
          trx,
          '00000000-0000-0000-0000-000000000001',
          {
            patient_id: patient.id,
            reason: 'seeking treatment',
          },
        )
        const { patient_id } = encounter

        const results = await patients.getWithOpenEncounter(trx, {
          ids: [patient_id],
        })
        assertEquals(results, [
          {
            id: patient_id,
            avatar_url: null,
            name: 'Test Patient',
            dob_formatted: '3 January 1989',
            description: 'male, 03/01/1989',
            gender: 'male',
            ethnicity: null,
            location: { longitude: null, latitude: null },
            national_id_number: null,
            nearest_organization: null,
            phone_number: null,
            last_visited: null,
            conversation_state: 'initial_message',
            completed_intake: false,
            intake_steps_completed: [],
            actions: {
              view: `/app/patients/${patient_id}`,
            },
            open_encounter: {
              encounter_id: encounter.id,
              patient_id,
              reason: 'seeking treatment',
              providers: [],
              created_at: results[0].open_encounter!.created_at,
              closed_at: null,
              notes: null,
              appointment_id: null,
              waiting_room_id: encounter.waiting_room_id,
              waiting_room_organization_id:
                '00000000-0000-0000-0000-000000000001',
              steps_completed: [],
              examinations: [
                {
                  completed: false,
                  examination_name: 'Head-to-toe Assessment',
                  recommended: true,
                  skipped: false,
                  ordered: false,
                },
                {
                  completed: false,
                  examination_name: "Men's Health Assessment",
                  recommended: true,
                  skipped: false,
                  ordered: false,
                },
              ],
            },
          },
        ])
      },
    )
  })

  describe('getAvatar', () => {
    itUsesTrxAnd(
      'gets the binary data and mime_type of the avatar',
      async (trx) => {
        const insertedMedia = await media.insert(trx, {
          binary_data: new Uint8Array([1, 2, 3]),
          mime_type: 'image/jpeg',
        })

        const test_patient = await patients.upsert(trx, {
          name: 'Test Patient 1',
          conversation_state: 'initial_message',
          avatar_media_id: insertedMedia.id,
        })

        const avatar = await patients.getAvatar(trx, {
          patient_id: test_patient.id,
        })

        assertEquals(avatar, {
          binary_data: new Uint8Array([1, 2, 3]),
          mime_type: 'image/jpeg',
        })
      },
    )
  })

  describe('getByPhoneNumber', () => {
    itUsesTrxAnd('reads out a formatted date of birth', async (trx) => {
      const phone_number = randomPhoneNumber()
      await patients.upsert(trx, {
        date_of_birth: '2021-01-01',
        phone_number,
      })
      const result = await patients.getByPhoneNumber(trx, {
        phone_number,
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

    itUsesTrxAnd('finds patient ages', async (trx) => {
      const testPatient1 = await patients.upsert(trx, {
        name: 'Test Patient 1',
        date_of_birth: today.toISOString().split('T')[0],
      })

      const yesterday = new Date(today.getTime() - 86400000)
      const testPatient2 = await patients.upsert(trx, {
        name: 'Test Patient 2',
        date_of_birth: yesterday.toISOString().split('T')[0],
      })

      const twentyDays = new Date(today.getTime() - (86400000 * 20))
      const testPatient3 = await patients.upsert(trx, {
        name: 'Test Patient 3',
        date_of_birth: twentyDays.toISOString().split('T')[0],
      })

      const threeWeeks = new Date(today.getTime() - (86400000 * 21))
      const testPatient4 = await patients.upsert(trx, {
        name: 'Test Patient 4',
        date_of_birth: threeWeeks.toISOString().split('T')[0],
      })

      const threeMonths = new Date(today)
      threeMonths.setMonth(today.getMonth() - 3)
      const testPatient5 = await patients.upsert(trx, {
        name: 'Test Patient 5',
        date_of_birth: threeMonths.toISOString().split('T')[0],
      })

      const twoYears = new Date(today)
      twoYears.setFullYear(today.getFullYear() - 2)
      const oneDayBelowTwoYears = new Date(twoYears.getTime() + 86400000)
      const testPatient6 = await patients.upsert(trx, {
        name: 'Test Patient 6',
        date_of_birth: oneDayBelowTwoYears.toISOString().split('T')[0],
      })

      const testPatient7 = await patients.upsert(trx, {
        name: 'Test Patient 7',
        date_of_birth: twoYears.toISOString().split('T')[0],
      })

      const patient_ages = await trx
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
      const testPatient8 = await patients.upsert(trx, {
        name: 'Test Patient 8',
        date_of_birth: oneDayBelowThreeMonths.toISOString().split('T')[0],
      })

      const patient_age = await trx
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
