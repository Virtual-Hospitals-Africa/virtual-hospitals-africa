import { sql } from 'kysely'
import { afterAll, describe } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import * as patients from '../../db/models/patients.ts'
import * as media from '../../db/models/media.ts'
import pick from '../../util/pick.ts'

import generateUUID from '../../util/uuid.ts'
import sortBy from '../../util/sortBy.ts'
import db from '../../db/db.ts'
import { itUsesTrxAnd } from '../_helpers/transaction.ts'

describe('db/models/patients.ts', () => {
  afterAll(() => db.destroy())

  describe('findAllWithNames', () => {
    itUsesTrxAnd(
      "finds patients by their name, omitting those who haven't completed registration by default",
      async (trx) => {
        const inserted_media = await media.insert(trx, {
          binary_data: new Uint8Array(),
          mime_type: 'image/jpeg',
        })

        const baseUUID = generateUUID()

        const test_patient1 = await patients.insert(trx, {
          name: baseUUID + generateUUID(),
          gender: 'female',
          date_of_birth: '1980-01-01',
          completed_registration: true,
        })

        const test_patient2 = await patients.insert(trx, {
          name: baseUUID + generateUUID(),
          gender: 'female',
          date_of_birth: '1980-01-01',
          completed_registration: true,
          avatar_media_id: inserted_media.id,
        })

        await patients.insert(trx, {
          name: 'Other With non-matching name',
          gender: 'female',
          date_of_birth: '1980-01-01',
          completed_registration: true,
        })

        await patients.insert(trx, {
          name: 'Other with incomplete registration',
        })

        const results = await patients.findAllWithNames(trx, {
          search: baseUUID,
        })

        assertEquals(
          results,
          sortBy([
            {
              id: test_patient1.id,
              avatar_url: null,
              name: test_patient1.name!,
              names: {
                full: '',
                first: '',
                surname: '',
                preferred: '',
              },
              dob_formatted: '1 January 1980',
              date_of_birth: '1980-01-01',
              address: null,
              age_display: '45 years',
              age_years: 45,
              description: 'female, 01/01/1980',
              gender: 'woman' as const,
              sex: 'female' as const,
              preferred_language_code_iso_639_2_b: null,
              primary_doctor: null,
              ethnicity: null,
              location: null,
              national_id_number: null,
              nearest_organization: null,
              phone_number: null,
              last_visited: null,
              completed_registration: true,
              actions: {
                view: `/app/patients/${test_patient1.id}`,
              },
            },
            {
              id: test_patient2.id,
              avatar_url: `/app/patients/${test_patient2.id}/avatar`,
              name: test_patient2.name!,
              names: {
                full: '',
                first: '',
                surname: '',
                preferred: '',
              },
              dob_formatted: '1 January 1980',
              date_of_birth: '1980-01-01',
              address: null,
              age_display: '45 years',
              age_years: 45,
              description: 'female, 01/01/1980',
              gender: 'woman' as const,
              sex: 'female' as const,
              preferred_language_code_iso_639_2_b: null,
              primary_doctor: null,
              ethnicity: null,
              location: null,
              national_id_number: null,
              nearest_organization: null,
              phone_number: null,
              last_visited: null,
              completed_registration: true,
              actions: {
                view: `/app/patients/${test_patient2.id}`,
              },
            },
          ], 'name'),
        )
      },
    )
  })

  describe('getAvatar', () => {
    itUsesTrxAnd(
      'gets the binary data and mime_type of the avatar',
      async (trx) => {
        const inserted_media = await media.insert(trx, {
          binary_data: new Uint8Array([1, 2, 3]),
          mime_type: 'image/jpeg',
        })

        const test_patient = await patients.insert(trx, {
          name: 'Test Patient 1',
          avatar_media_id: inserted_media.id,
        })

        const avatar = await patients.getAvatar(trx, {
          patient_id: test_patient.id,
        })

        assertEquals(avatar?.mime_type, 'image/jpeg')
        assertEquals(avatar?.binary_data.length, 3)
        assertEquals(avatar?.binary_data[0], 1)
        assertEquals(avatar?.binary_data[1], 2)
        assertEquals(avatar?.binary_data[2], 3)
      },
    )
  })

  // Skipping because of discrepancies at certain times of day.
  // @ashley I think we need to modify the calculation of the patient ages based on a provided timezone or just set the database to
  // Africa/Johannesburg.
  describe.skip('getPatientAges', () => {
    const today = new Date()

    itUsesTrxAnd('finds patient ages', async (trx) => {
      const testPatient1 = await patients.insert(trx, {
        name: 'Test Patient 1',
        date_of_birth: today.toISOString().split('T')[0],
      })

      const yesterday = new Date(today.getTime() - 86400000)
      const testPatient2 = await patients.insert(trx, {
        name: 'Test Patient 2',
        date_of_birth: yesterday.toISOString().split('T')[0],
      })

      const twentyDays = new Date(today.getTime() - (86400000 * 20))
      const testPatient3 = await patients.insert(trx, {
        name: 'Test Patient 3',
        date_of_birth: twentyDays.toISOString().split('T')[0],
      })

      const threeWeeks = new Date(today.getTime() - (86400000 * 21))
      const testPatient4 = await patients.insert(trx, {
        name: 'Test Patient 4',
        date_of_birth: threeWeeks.toISOString().split('T')[0],
      })

      const threeMonths = new Date(today)
      threeMonths.setMonth(today.getMonth() - 3)
      const testPatient5 = await patients.insert(trx, {
        name: 'Test Patient 5',
        date_of_birth: threeMonths.toISOString().split('T')[0],
      })

      const twoYears = new Date(today)
      twoYears.setFullYear(today.getFullYear() - 2)
      const oneDayBelowTwoYears = new Date(twoYears.getTime() + 86400000)
      const testPatient6 = await patients.insert(trx, {
        name: 'Test Patient 6',
        date_of_birth: oneDayBelowTwoYears.toISOString().split('T')[0],
      })

      const testPatient7 = await patients.insert(trx, {
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
      const testPatient8 = await patients.insert(trx, {
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
