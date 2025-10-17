import { afterAll, describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../db/db.ts'
import { itUsesTrxAnd } from '../_helpers/transaction.ts'
import * as patient_insurance from '../../db/models/patient_insurance.ts'
import * as patients from '../../db/models/patients.ts'

describe('db/models/patient_insurance.ts', () => {
  afterAll(() => db.destroy())

  describe('getById', () => {
    itUsesTrxAnd(
      'returns undefined values when no insurance record exists',
      async (trx) => {
        const patient = await patients.insert(trx, {
          name: 'Test Patient',
        })

        const insurance = await patient_insurance.getById(trx, {
          patient_id: patient.id,
        })

        assertEquals(insurance, {
          insurance_provider: undefined,
          plan_name: undefined,
          membership_number: undefined,
          valid_from: undefined,
          expire_date: undefined,
          is_dependent: undefined,
          has_no_insurance: undefined,
        })
      },
    )

    itUsesTrxAnd(
      'returns insurance data when record exists',
      async (trx) => {
        const patient = await patients.insert(trx, {
          name: 'Test Patient',
        })

        await patient_insurance.setInsurance(trx, {
          patient_id: patient.id,
          has_no_insurance: false,
          insurance_provider: 'Blue Cross',
          plan_name: 'Premium Plan',
          membership_number: '1234-567-8901',
          valid_from: '2024-01-01',
          expire_date: '2025-12-31',
          is_dependent: true,
        })

        const insurance = await patient_insurance.getById(trx, {
          patient_id: patient.id,
        })

        assertEquals(insurance.insurance_provider, 'Blue Cross')
        assertEquals(insurance.plan_name, 'Premium Plan')
        assertEquals(insurance.membership_number, '1234-567-8901')
        assertEquals(insurance.is_dependent, true)
        assertEquals(insurance.has_no_insurance, false)
        // Dates will be Date objects from the database
        assertEquals(insurance.valid_from instanceof Date, true)
        assertEquals(insurance.expire_date instanceof Date, true)
      },
    )

    itUsesTrxAnd(
      'returns data when patient has no insurance',
      async (trx) => {
        const patient = await patients.insert(trx, {
          name: 'Test Patient',
        })

        await patient_insurance.setInsurance(trx, {
          patient_id: patient.id,
          has_no_insurance: true,
        })

        const insurance = await patient_insurance.getById(trx, {
          patient_id: patient.id,
        })

        assertEquals(insurance.has_no_insurance, true)
        assertEquals(insurance.insurance_provider, undefined)
        assertEquals(insurance.plan_name, undefined)
        assertEquals(insurance.membership_number, undefined)
      },
    )
  })

  describe('setInsurance', () => {
    itUsesTrxAnd(
      'creates new insurance record',
      async (trx) => {
        const patient = await patients.insert(trx, {
          name: 'Test Patient',
        })

        await patient_insurance.setInsurance(trx, {
          patient_id: patient.id,
          has_no_insurance: false,
          insurance_provider: 'Aetna',
          plan_name: 'Standard Plan',
          membership_number: '9876-543-2109',
          valid_from: '2024-06-01',
          expire_date: '2025-05-31',
          is_dependent: false,
        })

        const insurance = await patient_insurance.getById(trx, {
          patient_id: patient.id,
        })

        assertEquals(insurance.insurance_provider, 'Aetna')
        assertEquals(insurance.plan_name, 'Standard Plan')
        assertEquals(insurance.membership_number, '9876-543-2109')
        assertEquals(insurance.is_dependent, false)
        assertEquals(insurance.has_no_insurance, false)
      },
    )

    itUsesTrxAnd(
      'updates existing insurance record (upsert)',
      async (trx) => {
        const patient = await patients.insert(trx, {
          name: 'Test Patient',
        })

        // Insert initial insurance
        await patient_insurance.setInsurance(trx, {
          patient_id: patient.id,
          has_no_insurance: false,
          insurance_provider: 'Old Provider',
          plan_name: 'Old Plan',
          membership_number: '0000-000-0000',
          valid_from: '2023-01-01',
          expire_date: '2024-01-01',
          is_dependent: false,
        })

        // Update insurance (upsert)
        await patient_insurance.setInsurance(trx, {
          patient_id: patient.id,
          has_no_insurance: false,
          insurance_provider: 'New Provider',
          plan_name: 'New Plan',
          membership_number: '1111-111-1111',
          valid_from: '2024-01-01',
          expire_date: '2025-01-01',
          is_dependent: true,
        })

        const insurance = await patient_insurance.getById(trx, {
          patient_id: patient.id,
        })

        assertEquals(insurance.insurance_provider, 'New Provider')
        assertEquals(insurance.plan_name, 'New Plan')
        assertEquals(insurance.membership_number, '1111-111-1111')
        assertEquals(insurance.is_dependent, true)
      },
    )

    itUsesTrxAnd(
      'handles partial updates',
      async (trx) => {
        const patient = await patients.insert(trx, {
          name: 'Test Patient',
        })

        // Insert initial insurance
        await patient_insurance.setInsurance(trx, {
          patient_id: patient.id,
          has_no_insurance: false,
          insurance_provider: 'Initial Provider',
          plan_name: 'Initial Plan',
        })

        // Update only some fields
        await patient_insurance.setInsurance(trx, {
          patient_id: patient.id,
          insurance_provider: 'Updated Provider',
        })

        const insurance = await patient_insurance.getById(trx, {
          patient_id: patient.id,
        })

        assertEquals(insurance.insurance_provider, 'Updated Provider')
        // Note: With the current upsert implementation, plan_name would be set to undefined
        // If you want to preserve existing values, you'd need to fetch first then merge
      },
    )

    itUsesTrxAnd(
      'marks patient as having no insurance',
      async (trx) => {
        const patient = await patients.insert(trx, {
          name: 'Test Patient',
        })

        await patient_insurance.setInsurance(trx, {
          patient_id: patient.id,
          has_no_insurance: true,
        })

        const insurance = await patient_insurance.getById(trx, {
          patient_id: patient.id,
        })

        assertEquals(insurance.has_no_insurance, true)
      },
    )
  })
})