import { TrxOrDb } from '../../types.ts'

export type PatientInsurance = {
  insurance_provider?: string | null
  plan_name?: string | null
  membership_number?: string | null
  valid_from?: Date | null
  expire_date?: Date | null
  is_dependent?: boolean | null
  has_no_insurance?: boolean | null
}

export async function getById(
  trx: TrxOrDb,
  { patient_id }: { patient_id: string },
): Promise<PatientInsurance> {
  const result = await trx
    .selectFrom('patient_insurance')
    .select([
      'insurance_provider',
      'plan_name',
      'membership_number',
      'valid_from',
      'expire_date',
      'is_dependent',
      'has_no_insurance',
    ])
    .where('patient_insurance.patient_id', '=', patient_id)
    .executeTakeFirst()

  return {
    insurance_provider: result?.insurance_provider ?? undefined,
    plan_name: result?.plan_name ?? undefined,
    membership_number: result?.membership_number ?? undefined,
    valid_from: result?.valid_from ?? undefined,
    expire_date: result?.expire_date ?? undefined,
    is_dependent: result?.is_dependent ?? undefined,
    has_no_insurance: result?.has_no_insurance ?? undefined,
  }
}

export function setInsurance(
  trx: TrxOrDb,
  {
    patient_id,
    has_no_insurance,
    insurance_provider,
    plan_name,
    membership_number,
    valid_from,
    expire_date,
    is_dependent,
  }: {
    patient_id: string
    has_no_insurance?: boolean
    insurance_provider?: string
    plan_name?: string
    membership_number?: string
    valid_from?: string
    expire_date?: string
    is_dependent?: boolean
  },
) {
  return trx
    .insertInto('patient_insurance')
    .values({
      patient_id,
      has_no_insurance,
      insurance_provider,
      plan_name,
      membership_number,
      valid_from,
      expire_date,
      is_dependent,
    })
    .onConflict((oc) =>
      oc.column('patient_id').doUpdateSet({
        has_no_insurance,
        insurance_provider,
        plan_name,
        membership_number,
        valid_from,
        expire_date,
        is_dependent,
      })
    )
    .executeTakeFirstOrThrow()
}