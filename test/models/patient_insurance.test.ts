import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { assertRejects } from 'std/assert/assert_rejects.ts'
import { afterAll } from 'std/testing/bdd.ts'
import * as patient_insurance from '../../db/models/patient_insurance.ts'
import db from '../../db/db.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { assert } from 'std/assert/assert.ts'
import {
  existingDurationEndDate,
  todayISOInJohannesburg,
} from '../../util/date.ts'
import randomDemographics from '../../mocks/randomDemographics.ts'

describeParallel('patient_insurance', () => {
  afterAll(() => db.destroy())

  const today = todayISOInJohannesburg()
  const thirty_days_ago = existingDurationEndDate(today, {
    duration: -30,
    duration_unit: 'days',
  })

  const three_hundred_and_thirty_five_days_in_future = existingDurationEndDate(
    today,
    {
      duration: 335,
      duration_unit: 'days',
    },
  )

  async function setup() {
    const patient = await db.insertInto('patients')
      .values({
        ...randomDemographics(),
        phone_number: `+1555${Math.random().toString().slice(2, 11)}`,
        completed_registration: false,
      })
      .returningAll()
      .executeTakeFirstOrThrow()

    return patient.id
  }

  describeParallel('getById', () => {
    itParallel('returns insurance for a patient with insurance', async () => {
      const patient_id = await setup()
      await db.insertInto('patient_insurance').values({
        patient_id,
        insurance_provider: 'Blue Cross',
        plan_name: 'Premium Plan',
        membership_number: '123456789',
        valid_from: thirty_days_ago,
        expire_date: three_hundred_and_thirty_five_days_in_future,
        is_dependent: false,
      }).execute()

      const [insurance] = await patient_insurance.getById(db, { patient_id })

      assert(insurance)
      assertEquals(insurance.insurance_provider, 'Blue Cross')
      assertEquals(insurance.plan_name, 'Premium Plan')
      assertEquals(insurance.membership_number, '123456789')
      assertEquals(insurance.valid_from, thirty_days_ago)
      assertEquals(
        insurance.expire_date,
        three_hundred_and_thirty_five_days_in_future,
      )
      assertEquals(insurance.is_dependent, false)
    })

    itParallel('returns undefined for patient without insurance', async () => {
      const patient_id = await setup()
      const [insurance] = await patient_insurance.getById(db, { patient_id })
      assertEquals(insurance, undefined)
    })

    itParallel('returns correct date formats', async () => {
      const patient_id = await setup()
      await db.insertInto('patient_insurance').values({
        patient_id,
        insurance_provider: 'Provider',
        plan_name: 'Plan',
        membership_number: '123',
        valid_from: thirty_days_ago,
        expire_date: three_hundred_and_thirty_five_days_in_future,
        is_dependent: true,
      }).execute()

      const [insurance] = await patient_insurance.getById(db, { patient_id })

      assert(insurance)
      assertEquals(insurance.valid_from, thirty_days_ago)
      assertEquals(
        insurance.expire_date,
        three_hundred_and_thirty_five_days_in_future,
      )
    })

    itParallel('handles null plan_name', async () => {
      const patient_id = await setup()
      await db.insertInto('patient_insurance').values({
        patient_id,
        insurance_provider: 'Provider',
        membership_number: '123',
        valid_from: thirty_days_ago,
        expire_date: three_hundred_and_thirty_five_days_in_future,
        is_dependent: false,
      }).execute()

      const [insurance] = await patient_insurance.getById(db, { patient_id })

      assert(insurance)
      assertEquals(insurance.plan_name, null)
    })
  })

  describeParallel('getCurrentInsurance', () => {
    itParallel('returns insurance that is currently valid', async () => {
      const patient_id = await setup()
      const valid_from = existingDurationEndDate(today, {
        duration: -30,
        duration_unit: 'days',
      })
      const expire_date = existingDurationEndDate(today, {
        duration: 30,
        duration_unit: 'days',
      })

      await db.insertInto('patient_insurance').values({
        patient_id,
        insurance_provider: 'Current Provider',
        plan_name: 'Current Plan',
        membership_number: '999',
        valid_from,
        expire_date,
        is_dependent: false,
      }).execute()

      const insurance = await patient_insurance.getCurrent(db, {
        patient_id,
      })

      assert(insurance)
      assertEquals(insurance.insurance_provider, 'Current Provider')
      assertEquals(insurance.plan_name, 'Current Plan')
    })

    itParallel('returns undefined for expired insurance', async () => {
      const patient_id = await setup()
      const valid_from = existingDurationEndDate(today, {
        duration: -60,
        duration_unit: 'days',
      })
      const expire_date = existingDurationEndDate(today, {
        duration: -1,
        duration_unit: 'days',
      })

      await db.insertInto('patient_insurance').values({
        patient_id,
        insurance_provider: 'Expired Provider',
        plan_name: 'Expired Plan',
        membership_number: '111',
        valid_from,
        expire_date,
        is_dependent: false,
      }).execute()

      const insurance = await patient_insurance.getCurrent(db, {
        patient_id,
      })
      assertEquals(insurance, undefined)
    })

    itParallel('returns undefined for future insurance', async () => {
      const patient_id = await setup()
      const valid_from = existingDurationEndDate(today, {
        duration: 1,
        duration_unit: 'days',
      })
      const expire_date = existingDurationEndDate(today, {
        duration: 365,
        duration_unit: 'days',
      })

      await db.insertInto('patient_insurance').values({
        patient_id,
        insurance_provider: 'Future Provider',
        plan_name: 'Future Plan',
        membership_number: '222',
        valid_from,
        expire_date,
        is_dependent: true,
      }).execute()

      const insurance = await patient_insurance.getCurrent(db, {
        patient_id,
      })
      assertEquals(insurance, undefined)
    })

    itParallel('returns insurance valid from today', async () => {
      const patient_id = await setup()
      const expire_date = existingDurationEndDate(today, {
        duration: 365,
        duration_unit: 'days',
      })

      await db.insertInto('patient_insurance').values({
        patient_id,
        insurance_provider: 'Today Provider',
        plan_name: 'Today Plan',
        membership_number: '333',
        valid_from: today,
        expire_date,
        is_dependent: false,
      }).execute()

      const insurance = await patient_insurance.getCurrent(db, {
        patient_id,
      })
      assert(insurance)
      assertEquals(insurance.insurance_provider, 'Today Provider')
    })

    itParallel('returns insurance expiring today', async () => {
      const patient_id = await setup()
      const valid_from = existingDurationEndDate(today, {
        duration: -1,
        duration_unit: 'years',
      })

      await db.insertInto('patient_insurance').values({
        patient_id,
        insurance_provider: 'Expires Today Provider',
        plan_name: 'Expires Today Plan',
        membership_number: '444',
        valid_from,
        expire_date: today,
        is_dependent: false,
      }).execute()

      const insurance = await patient_insurance.getCurrent(db, {
        patient_id,
      })
      assert(insurance)
      assertEquals(insurance.insurance_provider, 'Expires Today Provider')
    })
  })

  describeParallel('setCurrentInsurance', () => {
    itParallel('creates new insurance record with all fields', async () => {
      const patient_id = await setup()
      await patient_insurance.setCurrent(db, {
        patient_id,
        insurance_provider: 'Test Provider',
        plan_name: 'Test Plan',
        membership_number: '987654321',
        valid_from: thirty_days_ago,
        expire_date: three_hundred_and_thirty_five_days_in_future,
        is_dependent: true,
      })

      const [insurance] = await patient_insurance.getById(db, { patient_id })

      assert(insurance)
      assertEquals(insurance.insurance_provider, 'Test Provider')
      assertEquals(insurance.plan_name, 'Test Plan')
      assertEquals(insurance.membership_number, '987654321')
      assertEquals(insurance.is_dependent, true)
    })

    itParallel('rejects insurance with future valid_from date', async () => {
      const patient_id = await setup()
      const valid_from = existingDurationEndDate(today, {
        duration: 1,
        duration_unit: 'days',
      })

      const expire_date = existingDurationEndDate(today, {
        duration: 365,
        duration_unit: 'days',
      })

      await assertRejects(
        async () => {
          await patient_insurance.setCurrent(db, {
            patient_id,
            insurance_provider: 'Provider',
            plan_name: 'Plan',
            membership_number: '123',
            valid_from,
            expire_date,
            is_dependent: false,
          })
        },
        Error,
        'Insurance valid_from date must be in the past or today',
      )
    })

    itParallel('accepts insurance with today as valid_from', async () => {
      const patient_id = await setup()
      const expire_date = existingDurationEndDate(today, {
        duration: 365,
        duration_unit: 'days',
      })

      await patient_insurance.setCurrent(db, {
        patient_id,
        insurance_provider: 'Provider',
        plan_name: 'Plan',
        membership_number: '123',
        valid_from: today,
        expire_date,
        is_dependent: false,
      })

      const [insurance] = await patient_insurance.getById(db, { patient_id })
      assert(insurance)
      assertEquals(insurance.valid_from, today)
    })

    itParallel('rejects insurance with past expire_date', async () => {
      const patient_id = await setup()
      const valid_from = existingDurationEndDate(today, {
        duration: -365,
        duration_unit: 'days',
      })

      const expire_date = existingDurationEndDate(today, {
        duration: -1,
        duration_unit: 'days',
      })

      await assertRejects(
        async () => {
          await patient_insurance.setCurrent(db, {
            patient_id,
            insurance_provider: 'Provider',
            plan_name: 'Plan',
            membership_number: '123',
            valid_from,
            expire_date,
            is_dependent: false,
          })
        },
        Error,
        'Insurance expire_date must be in the future or today',
      )
    })

    itParallel('accepts insurance with today as expire_date', async () => {
      const patient_id = await setup()
      await patient_insurance.setCurrent(db, {
        patient_id,
        insurance_provider: 'Provider',
        plan_name: 'Plan',
        membership_number: '123',
        valid_from: thirty_days_ago,
        expire_date: today,
        is_dependent: false,
      })

      const [insurance] = await patient_insurance.getById(db, { patient_id })
      assert(insurance)
      assertEquals(insurance.expire_date, today)
    })

    itParallel('accepts valid date range', async () => {
      const patient_id = await setup()
      await patient_insurance.setCurrent(db, {
        patient_id,
        insurance_provider: 'Valid Provider',
        plan_name: 'Valid Plan',
        membership_number: '555',
        valid_from: thirty_days_ago,
        expire_date: three_hundred_and_thirty_five_days_in_future,
        is_dependent: false,
      })

      const [insurance] = await patient_insurance.getById(db, { patient_id })
      assert(insurance)
      assertEquals(insurance.insurance_provider, 'Valid Provider')
    })

    itParallel('handles is_dependent field correctly', async () => {
      const patient_id = await setup()
      await patient_insurance.setCurrent(db, {
        patient_id,
        insurance_provider: 'Dependent Provider',
        plan_name: 'Dependent Plan',
        membership_number: '666',
        valid_from: thirty_days_ago,
        expire_date: three_hundred_and_thirty_five_days_in_future,
        is_dependent: true,
      })

      const [insurance] = await patient_insurance.getById(db, { patient_id })
      assert(insurance)
      assertEquals(insurance.is_dependent, true)
    })

    itParallel('handles optional plan_name field', async () => {
      const patient_id = await setup()
      await patient_insurance.setCurrent(db, {
        patient_id,
        insurance_provider: 'Minimal Provider',
        membership_number: '777',
        valid_from: thirty_days_ago,
        expire_date: three_hundred_and_thirty_five_days_in_future,
        is_dependent: false,
      })

      const [insurance] = await patient_insurance.getById(db, { patient_id })
      assert(insurance)
      assertEquals(insurance.insurance_provider, 'Minimal Provider')
      assertEquals(insurance.plan_name, null)
    })
  })

  describeParallel('edge cases', () => {
    itParallel('handles very long insurance fields', async () => {
      const patient_id = await setup()
      const long_string = 'A'.repeat(255)

      await patient_insurance.setCurrent(db, {
        patient_id,
        insurance_provider: long_string,
        plan_name: long_string,
        membership_number: long_string,
        valid_from: thirty_days_ago,
        expire_date: three_hundred_and_thirty_five_days_in_future,
        is_dependent: false,
      })

      const [insurance] = await patient_insurance.getById(db, { patient_id })
      assert(insurance)
      assertEquals(insurance.insurance_provider, long_string)
      assertEquals(insurance.membership_number, long_string)
    })

    itParallel('handles special characters in insurance fields', async () => {
      const patient_id = await setup()
      await patient_insurance.setCurrent(db, {
        patient_id,
        insurance_provider: "O'Brien's Insurance & Co.",
        plan_name: 'Premium-Plus (Family)',
        membership_number: 'ABC-123-XYZ',
        valid_from: thirty_days_ago,
        expire_date: three_hundred_and_thirty_five_days_in_future,
        is_dependent: false,
      })

      const [insurance] = await patient_insurance.getById(db, { patient_id })
      assert(insurance)
      assertEquals(insurance.insurance_provider, "O'Brien's Insurance & Co.")
      assertEquals(insurance.plan_name, 'Premium-Plus (Family)')
      assertEquals(insurance.membership_number, 'ABC-123-XYZ')
    })

    itParallel('validates date range spanning exactly one year', async () => {
      const patient_id = await setup()
      const expire_date = existingDurationEndDate(today, {
        duration: 1,
        duration_unit: 'years',
      })

      await patient_insurance.setCurrent(db, {
        patient_id,
        insurance_provider: 'One Year Provider',
        plan_name: 'Annual Plan',
        membership_number: '888',
        valid_from: today,
        expire_date,
        is_dependent: false,
      })

      const [insurance] = await patient_insurance.getById(db, { patient_id })
      assert(insurance)
      assertEquals(insurance.insurance_provider, 'One Year Provider')
    })

    itParallel(
      'overwrites the existing current insurance if present',
      async () => {
        const patient_id = await setup()
        await patient_insurance.setCurrent(db, {
          patient_id,
          insurance_provider: 'One Year Provider',
          plan_name: 'Annual Plan',
          membership_number: '888',
          valid_from: thirty_days_ago,
          expire_date: three_hundred_and_thirty_five_days_in_future,
          is_dependent: false,
        })

        const insurances = await patient_insurance.getById(db, { patient_id })
        assertEquals(insurances.length, 1)
        assertEquals(insurances[0].insurance_provider, 'One Year Provider')

        await patient_insurance.setCurrent(db, {
          patient_id,
          insurance_provider: 'My new provider',
          plan_name: 'Annual Plan',
          membership_number: '888',
          valid_from: thirty_days_ago,
          expire_date: three_hundred_and_thirty_five_days_in_future,
          is_dependent: false,
        })

        const next_insurances = await patient_insurance.getById(db, {
          patient_id,
        })
        assertEquals(next_insurances.length, 1)
        assertEquals(next_insurances[0].insurance_provider, 'My new provider')
      },
    )
  })
})
