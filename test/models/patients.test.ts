import { sql } from 'kysely'
import { afterAll, describe } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import * as patients from '../../db/models/patients.ts'
import pick from '../../util/pick.ts'
import db from '../../db/db.ts'
import { itUsesTrxAnd } from '../_helpers/transaction.ts'

describe('db/models/patients.ts', () => {
  afterAll(() => db.destroy())

  // Skipping because of discrepancies at certain times of day.
  // @ashley I think we need to modify the calculation of the patient ages based on a provided timezone or just set the database to
  // Africa/Johannesburg.
  describe.skip('getPatientAges', () => {
    const today = new Date()

    itUsesTrxAnd('finds patient ages', async (trx) => {
      const test_patient1 = await patients.insert(trx, {
        name: 'Test Patient 1',
        date_of_birth: today.toISOString().split('T')[0],
      })

      const yesterday = new Date(today.getTime() - 86400000)
      const test_patient2 = await patients.insert(trx, {
        name: 'Test Patient 2',
        date_of_birth: yesterday.toISOString().split('T')[0],
      })

      const twenty_days = new Date(today.getTime() - (86400000 * 20))
      const test_patient3 = await patients.insert(trx, {
        name: 'Test Patient 3',
        date_of_birth: twenty_days.toISOString().split('T')[0],
      })

      const three_weeks = new Date(today.getTime() - (86400000 * 21))
      const test_patient4 = await patients.insert(trx, {
        name: 'Test Patient 4',
        date_of_birth: three_weeks.toISOString().split('T')[0],
      })

      const three_months = new Date(today)
      three_months.setMonth(today.getMonth() - 3)
      const test_patient5 = await patients.insert(trx, {
        name: 'Test Patient 5',
        date_of_birth: three_months.toISOString().split('T')[0],
      })

      const two_years = new Date(today)
      two_years.setFullYear(today.getFullYear() - 2)
      const one_day_below_two_years = new Date(two_years.getTime() + 86400000)
      const test_patient6 = await patients.insert(trx, {
        name: 'Test Patient 6',
        date_of_birth: one_day_below_two_years.toISOString().split('T')[0],
      })

      const test_patient7 = await patients.insert(trx, {
        name: 'Test Patient 7',
        date_of_birth: two_years.toISOString().split('T')[0],
      })

      const patient_ages = await trx
        .selectFrom('patient_age')
        .select(['patient_id', sql`TO_JSON(age)`.as('age')])
        .execute()

      assertEquals(patient_ages.map(pick(['patient_id', 'age'])), [
        {
          patient_id: test_patient1.id,
          age: { number: 0, unit: 'day' },
        },
        {
          patient_id: test_patient2.id,
          age: { number: 1, unit: 'day' },
        },
        {
          patient_id: test_patient3.id,
          age: { number: 20, unit: 'day' },
        },
        {
          patient_id: test_patient4.id,
          age: { number: 3, unit: 'week' },
        },
        {
          patient_id: test_patient5.id,
          age: { number: 3, unit: 'month' },
        },
        {
          patient_id: test_patient6.id,
          age: { number: 23, unit: 'month' },
        },
        {
          patient_id: test_patient7.id,
          age: { number: 2, unit: 'year' },
        },
      ])

      const one_day_below_three_months = new Date(
        three_months.getTime() + 86400000,
      )
      const test_patient8 = await patients.insert(trx, {
        name: 'Test Patient 8',
        date_of_birth: one_day_below_three_months.toISOString().split('T')[0],
      })

      const patient_age = await trx
        .selectFrom('patient_age')
        .select(['patient_id', sql`TO_JSON(age)`.as('age')])
        .where('patient_id', '=', test_patient8.id)
        .executeTakeFirst()

      try {
        assertEquals(patient_age, {
          patient_id: test_patient8.id,
          age: { number: 12, unit: 'weeks' },
        })
      } catch {
        assertEquals(patient_age, {
          patient_id: test_patient8.id,
          age: { number: 13, unit: 'weeks' },
        })
      }
    })
  })
})
