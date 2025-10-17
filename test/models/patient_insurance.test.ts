import { assertEquals, assertExists } from 'std/assert/mod.ts'
import { assertRejects } from 'std/assert/assert_rejects.ts'
import { afterEach, beforeEach, describe, it } from 'std/testing/bdd.ts'
import * as patient_insurance from '../../db/models/patient_insurance.ts'
import db from '../../db/db.ts'

describe('patient_insurance', () => {
  let patient_id: string

  beforeEach(async () => {
    const patient = await db.insertInto('patients')
      .values({
        name: 'Test Patient',
        phone_number: `+1555${Math.random().toString().slice(2, 11)}`,
        completed_registration: false,
      })
      .returningAll()
      .executeTakeFirstOrThrow()
    
    patient_id = patient.id
  })

  afterEach(async () => {
    if (patient_id) {
      await db.deleteFrom('patient_insurance')
        .where('patient_id', '=', patient_id)
        .execute()
      await db.deleteFrom('patients')
        .where('id', '=', patient_id)
        .execute()
    }
  })

  describe('getById', () => {
    it('returns insurance for a patient with insurance', async () => {
      await db.insertInto('patient_insurance').values({
        patient_id,
        insurance_provider: 'Blue Cross',
        plan_name: 'Premium Plan',
        membership_number: '123456789',
        valid_from: '2025-01-01',
        expire_date: '2026-01-01',
        is_dependent: false,
      }).execute()

      const insurance = await patient_insurance.getById(db, { patient_id })

      assertExists(insurance)
      assertEquals(insurance!.insurance_provider, 'Blue Cross')
      assertEquals(insurance!.plan_name, 'Premium Plan')
      assertEquals(insurance!.membership_number, '123456789')
      assertEquals(insurance!.valid_from, '2025-01-01')
      assertEquals(insurance!.expire_date, '2026-01-01')
      assertEquals(insurance!.is_dependent, false)
    })

    it('returns undefined for patient without insurance', async () => {
      const insurance = await patient_insurance.getById(db, { patient_id })
      assertEquals(insurance, undefined)
    })

    it('returns correct date formats', async () => {
      await db.insertInto('patient_insurance').values({
        patient_id,
        insurance_provider: 'Provider',
        plan_name: 'Plan',
        membership_number: '123',
        valid_from: '2025-06-15',
        expire_date: '2026-12-31',
        is_dependent: true,
      }).execute()

      const insurance = await patient_insurance.getById(db, { patient_id })

      assertExists(insurance)
      assertEquals(insurance!.valid_from, '2025-06-15')
      assertEquals(insurance!.expire_date, '2026-12-31')
    })

    it('handles null plan_name', async () => {
      await db.insertInto('patient_insurance').values({
        patient_id,
        insurance_provider: 'Provider',
        membership_number: '123',
        valid_from: '2025-01-01',
        expire_date: '2026-01-01',
        is_dependent: false,
      }).execute()

      const insurance = await patient_insurance.getById(db, { patient_id })

      assertExists(insurance)
      assertEquals(insurance!.plan_name, null)
    })
  })

  describe('getCurrentInsurance', () => {
    it('returns insurance that is currently valid', async () => {
      const now = new Date()
      const validFrom = new Date(now)
      validFrom.setDate(now.getDate() - 30)
      const expireDate = new Date(now)
      expireDate.setDate(now.getDate() + 30)

      await db.insertInto('patient_insurance').values({
        patient_id,
        insurance_provider: 'Current Provider',
        plan_name: 'Current Plan',
        membership_number: '999',
        valid_from: validFrom.toISOString().split('T')[0],
        expire_date: expireDate.toISOString().split('T')[0],
        is_dependent: false,
      }).execute()

      const insurance = await patient_insurance.getCurrentInsurance(db, { patient_id })

      assertExists(insurance)
      assertEquals(insurance!.insurance_provider, 'Current Provider')
      assertEquals(insurance!.plan_name, 'Current Plan')
    })

    it('returns undefined for expired insurance', async () => {
      const now = new Date()
      const validFrom = new Date(now)
      validFrom.setDate(now.getDate() - 60)
      const expireDate = new Date(now)
      expireDate.setDate(now.getDate() - 30)

      await db.insertInto('patient_insurance').values({
        patient_id,
        insurance_provider: 'Expired Provider',
        plan_name: 'Expired Plan',
        membership_number: '111',
        valid_from: validFrom.toISOString().split('T')[0],
        expire_date: expireDate.toISOString().split('T')[0],
        is_dependent: false,
      }).execute()

      const insurance = await patient_insurance.getCurrentInsurance(db, { patient_id })
      assertEquals(insurance, undefined)
    })

    it('returns undefined for future insurance', async () => {
      const now = new Date()
      const validFrom = new Date(now)
      validFrom.setDate(now.getDate() + 30)
      const expireDate = new Date(now)
      expireDate.setDate(now.getDate() + 365)

      await db.insertInto('patient_insurance').values({
        patient_id,
        insurance_provider: 'Future Provider',
        plan_name: 'Future Plan',
        membership_number: '222',
        valid_from: validFrom.toISOString().split('T')[0],
        expire_date: expireDate.toISOString().split('T')[0],
        is_dependent: true,
      }).execute()

      const insurance = await patient_insurance.getCurrentInsurance(db, { patient_id })
      assertEquals(insurance, undefined)
    })

    it('returns insurance valid from today', async () => {
      const now = new Date()
      const today = now.toISOString().split('T')[0]
      const expireDate = new Date(now)
      expireDate.setDate(now.getDate() + 365)

      await db.insertInto('patient_insurance').values({
        patient_id,
        insurance_provider: 'Today Provider',
        plan_name: 'Today Plan',
        membership_number: '333',
        valid_from: today,
        expire_date: expireDate.toISOString().split('T')[0],
        is_dependent: false,
      }).execute()

      const insurance = await patient_insurance.getCurrentInsurance(db, { patient_id })
      assertExists(insurance)
      assertEquals(insurance!.insurance_provider, 'Today Provider')
    })

    it('returns insurance expiring today', async () => {
      const now = new Date()
      const validFrom = new Date(now)
      validFrom.setDate(now.getDate() - 365)
      const today = now.toISOString().split('T')[0]

      await db.insertInto('patient_insurance').values({
        patient_id,
        insurance_provider: 'Expires Today Provider',
        plan_name: 'Expires Today Plan',
        membership_number: '444',
        valid_from: validFrom.toISOString().split('T')[0],
        expire_date: today,
        is_dependent: false,
      }).execute()

      const insurance = await patient_insurance.getCurrentInsurance(db, { patient_id })
      assertExists(insurance)
      assertEquals(insurance!.insurance_provider, 'Expires Today Provider')
    })
  })

  describe('setCurrentInsurance', () => {
    it('creates new insurance record with all fields', async () => {
      const now = new Date()
      const validFrom = now.toISOString().split('T')[0]
      const expireDate = new Date(now)
      expireDate.setDate(now.getDate() + 365)
      const expireDateStr = expireDate.toISOString().split('T')[0]

      await patient_insurance.setCurrentInsurance(db, {
        patient_id,
        insurance_provider: 'Test Provider',
        plan_name: 'Test Plan',
        membership_number: '987654321',
        valid_from: validFrom,
        expire_date: expireDateStr,
        is_dependent: true,
      })

      const insurance = await patient_insurance.getById(db, { patient_id })

      assertExists(insurance)
      assertEquals(insurance!.insurance_provider, 'Test Provider')
      assertEquals(insurance!.plan_name, 'Test Plan')
      assertEquals(insurance!.membership_number, '987654321')
      assertEquals(insurance!.is_dependent, true)
    })

    it('rejects insurance with future valid_from date', async () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 1)
      const futureDateStr = futureDate.toISOString().split('T')[0]
      const expireDate = new Date()
      expireDate.setDate(expireDate.getDate() + 365)

      await assertRejects(
        async () => {
          await patient_insurance.setCurrentInsurance(db, {
            patient_id,
            insurance_provider: 'Provider',
            plan_name: 'Plan',
            membership_number: '123',
            valid_from: futureDateStr,
            expire_date: expireDate.toISOString().split('T')[0],
            is_dependent: false,
          })
        },
        Error,
        'Insurance valid_from date must be in the past or today',
      )
    })

    it('accepts insurance with today as valid_from', async () => {
      const today = new Date().toISOString().split('T')[0]
      const expireDate = new Date()
      expireDate.setDate(expireDate.getDate() + 365)

      await patient_insurance.setCurrentInsurance(db, {
        patient_id,
        insurance_provider: 'Provider',
        plan_name: 'Plan',
        membership_number: '123',
        valid_from: today,
        expire_date: expireDate.toISOString().split('T')[0],
        is_dependent: false,
      })

      const insurance = await patient_insurance.getById(db, { patient_id })
      assertExists(insurance)
      assertEquals(insurance!.valid_from, today)
    })

    it('rejects insurance with past expire_date', async () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)
      const pastDateStr = pastDate.toISOString().split('T')[0]
      const validFrom = new Date()
      validFrom.setDate(validFrom.getDate() - 365)

      await assertRejects(
        async () => {
          await patient_insurance.setCurrentInsurance(db, {
            patient_id,
            insurance_provider: 'Provider',
            plan_name: 'Plan',
            membership_number: '123',
            valid_from: validFrom.toISOString().split('T')[0],
            expire_date: pastDateStr,
            is_dependent: false,
          })
        },
        Error,
        'Insurance expire_date must be in the future or today',
      )
    })

    it('accepts insurance with today as expire_date', async () => {
      const today = new Date().toISOString().split('T')[0]
      const validFrom = new Date()
      validFrom.setDate(validFrom.getDate() - 365)

      await patient_insurance.setCurrentInsurance(db, {
        patient_id,
        insurance_provider: 'Provider',
        plan_name: 'Plan',
        membership_number: '123',
        valid_from: validFrom.toISOString().split('T')[0],
        expire_date: today,
        is_dependent: false,
      })

      const insurance = await patient_insurance.getById(db, { patient_id })
      assertExists(insurance)
      assertEquals(insurance!.expire_date, today)
    })

    it('rejects insurance where valid_from is after expire_date', async () => {
      const now = new Date()
      const validFrom = new Date(now)
      validFrom.setDate(now.getDate() - 30)
      const expireDate = new Date(now)
      expireDate.setDate(now.getDate() - 60)

      await assertRejects(
        async () => {
          await patient_insurance.setCurrentInsurance(db, {
            patient_id,
            insurance_provider: 'Provider',
            plan_name: 'Plan',
            membership_number: '123',
            valid_from: validFrom.toISOString().split('T')[0],
            expire_date: expireDate.toISOString().split('T')[0],
            is_dependent: false,
          })
        },
        Error,
        'Insurance valid_from must be before expire_date',
      )
    })

    it('accepts valid date range', async () => {
      const now = new Date()
      const validFrom = new Date(now)
      validFrom.setDate(now.getDate() - 30)
      const expireDate = new Date(now)
      expireDate.setDate(now.getDate() + 335)

      await patient_insurance.setCurrentInsurance(db, {
        patient_id,
        insurance_provider: 'Valid Provider',
        plan_name: 'Valid Plan',
        membership_number: '555',
        valid_from: validFrom.toISOString().split('T')[0],
        expire_date: expireDate.toISOString().split('T')[0],
        is_dependent: false,
      })

      const insurance = await patient_insurance.getById(db, { patient_id })
      assertExists(insurance)
      assertEquals(insurance!.insurance_provider, 'Valid Provider')
    })

    it('handles is_dependent field correctly', async () => {
      const now = new Date()
      const validFrom = now.toISOString().split('T')[0]
      const expireDate = new Date(now)
      expireDate.setDate(now.getDate() + 365)

      await patient_insurance.setCurrentInsurance(db, {
        patient_id,
        insurance_provider: 'Dependent Provider',
        plan_name: 'Dependent Plan',
        membership_number: '666',
        valid_from: validFrom,
        expire_date: expireDate.toISOString().split('T')[0],
        is_dependent: true,
      })

      const insurance = await patient_insurance.getById(db, { patient_id })
      assertExists(insurance)
      assertEquals(insurance!.is_dependent, true)
    })

    it('handles optional plan_name field', async () => {
      const now = new Date()
      const validFrom = now.toISOString().split('T')[0]
      const expireDate = new Date(now)
      expireDate.setDate(now.getDate() + 365)

      await patient_insurance.setCurrentInsurance(db, {
        patient_id,
        insurance_provider: 'Minimal Provider',
        membership_number: '777',
        valid_from: validFrom,
        expire_date: expireDate.toISOString().split('T')[0],
        is_dependent: false,
      })

      const insurance = await patient_insurance.getById(db, { patient_id })
      assertExists(insurance)
      assertEquals(insurance!.insurance_provider, 'Minimal Provider')
      assertEquals(insurance!.plan_name, null)
    })

    it('enforces unique patient_id constraint', async () => {
      const now = new Date()
      const validFrom = now.toISOString().split('T')[0]
      const expireDate = new Date(now)
      expireDate.setDate(now.getDate() + 365)

      // Insert first insurance
      await patient_insurance.setCurrentInsurance(db, {
        patient_id,
        insurance_provider: 'First Provider',
        plan_name: 'First Plan',
        membership_number: '111',
        valid_from: validFrom,
        expire_date: expireDate.toISOString().split('T')[0],
        is_dependent: false,
      })

      // Try to insert second insurance for same patient should fail
      await assertRejects(
        async () => {
          await patient_insurance.setCurrentInsurance(db, {
            patient_id,
            insurance_provider: 'Second Provider',
            plan_name: 'Second Plan',
            membership_number: '222',
            valid_from: validFrom,
            expire_date: expireDate.toISOString().split('T')[0],
            is_dependent: false,
          })
        },
      )
    })
  })

  describe('edge cases', () => {
    it('handles very long insurance fields', async () => {
      const now = new Date()
      const validFrom = now.toISOString().split('T')[0]
      const expireDate = new Date(now)
      expireDate.setDate(now.getDate() + 365)
      const longString = 'A'.repeat(255)
      
      await patient_insurance.setCurrentInsurance(db, {
        patient_id,
        insurance_provider: longString,
        plan_name: longString,
        membership_number: longString,
        valid_from: validFrom,
        expire_date: expireDate.toISOString().split('T')[0],
        is_dependent: false,
      })

      const insurance = await patient_insurance.getById(db, { patient_id })
      assertExists(insurance)
      assertEquals(insurance!.insurance_provider, longString)
      assertEquals(insurance!.membership_number, longString)
    })

    it('handles special characters in insurance fields', async () => {
      const now = new Date()
      const validFrom = now.toISOString().split('T')[0]
      const expireDate = new Date(now)
      expireDate.setDate(now.getDate() + 365)

      await patient_insurance.setCurrentInsurance(db, {
        patient_id,
        insurance_provider: "O'Brien's Insurance & Co.",
        plan_name: 'Premium-Plus (Family)',
        membership_number: 'ABC-123-XYZ',
        valid_from: validFrom,
        expire_date: expireDate.toISOString().split('T')[0],
        is_dependent: false,
      })

      const insurance = await patient_insurance.getById(db, { patient_id })
      assertExists(insurance)
      assertEquals(insurance!.insurance_provider, "O'Brien's Insurance & Co.")
      assertEquals(insurance!.plan_name, 'Premium-Plus (Family)')
      assertEquals(insurance!.membership_number, 'ABC-123-XYZ')
    })

    it('validates date range spanning exactly one year', async () => {
      const now = new Date()
      const validFrom = now.toISOString().split('T')[0]
      const expireDate = new Date(now)
      expireDate.setFullYear(now.getFullYear() + 1)

      await patient_insurance.setCurrentInsurance(db, {
        patient_id,
        insurance_provider: 'One Year Provider',
        plan_name: 'Annual Plan',
        membership_number: '888',
        valid_from: validFrom,
        expire_date: expireDate.toISOString().split('T')[0],
        is_dependent: false,
      })

      const insurance = await patient_insurance.getById(db, { patient_id })
      assertExists(insurance)
      assertEquals(insurance!.insurance_provider, 'One Year Provider')
    })
  })
})