import { TrxOrDb } from '../../types.ts'
import { VITALS_SNOMED_CODE } from '../../shared/vitals.ts'

export interface PatientClinicalContext {
  readonly patient_id: string
  readonly age_days: number
  readonly gender?: 'male' | 'female'
  readonly active_condition_snomed_codes: readonly string[]
  readonly pregnancy_status?: boolean
}

export async function buildPatientClinicalContext(
  trx: TrxOrDb,
  patient_id: string,
): Promise<PatientClinicalContext> {
  const patient = await trx
    .selectFrom('patients')
    .leftJoin('patient_age', 'patients.id', 'patient_age.patient_id')
    .where('patients.id', '=', patient_id)
    .select([
      'patients.id',
      'patients.gender',
      'patients.date_of_birth',
      'patient_age.age_years',
      'patient_age.age_number',
      'patient_age.age_unit',
    ])
    .executeTakeFirstOrThrow()

  const age_days = calculateAgeDays(patient)

  const active_conditions = await getActiveConditions(trx, patient_id)

  const pregnancy_status = active_conditions.includes('77386006')

  return {
    patient_id,
    age_days,
    gender: patient.gender as 'male' | 'female' | undefined,
    active_condition_snomed_codes: active_conditions,
    pregnancy_status,
  }
}

function calculateAgeDays(patient: {
  date_of_birth?: Date | null
  age_years?: string | number | null
  age_number?: number | null
  age_unit?: string | null
}): number {
  if (patient.date_of_birth) {
    const today = new Date()
    const birth = new Date(patient.date_of_birth)
    const diffTime = today.getTime() - birth.getTime()
    return Math.floor(diffTime / (1000 * 60 * 60 * 24))
  }

  if (patient.age_years !== null && patient.age_years !== undefined) {
    const years = typeof patient.age_years === 'string'
      ? parseInt(patient.age_years, 10)
      : patient.age_years
    return years * 365
  }

  if (
    patient.age_number !== null && patient.age_number !== undefined &&
    patient.age_unit
  ) {
    switch (patient.age_unit.toLowerCase()) {
      case 'year':
      case 'years':
        return patient.age_number * 365
      case 'month':
      case 'months':
        return patient.age_number * 30 // TODO: approximation, should fix 
      case 'week':
      case 'weeks':
        return patient.age_number * 7
      case 'day':
      case 'days':
        return patient.age_number
      default:
        return patient.age_number * 365 
    }
  }

  return 0
}

/**
 * Gets active medical conditions for a patient
 * Returns SNOMED concept IDs as strings
 * TODO: Implement condition lookup once Will explains me how we deal with existing conditions
 */
async function getActiveConditions(
  trx: TrxOrDb,
  patient_id: string,
): Promise<readonly string[]> {
  // For now, return empty array
  // This allows the rest of the system to work with age-based requirements
  try {
    const condition_records = await trx
      .selectFrom('patient_records')
      .leftJoin('patient_findings', 'patient_records.id', 'patient_findings.id')
      .where('patient_records.patient_id', '=', patient_id)
      .where('patient_findings.id', 'is not', null)
      .where(
        'patient_records.snomed_concept_id',
        'not in',
        Object.values(VITALS_SNOMED_CODE),
      )
      .select(['patient_records.snomed_concept_id'])
      .distinct()
      .limit(100)
      .execute()

    return condition_records.map((c) => c.snomed_concept_id.toString())
  } catch (error) {
    console.warn('Could not fetch patient conditions:', error)
    return []
  }
}

export async function buildPatientClinicalContextBatch(
  trx: TrxOrDb,
  patient_ids: readonly string[],
): Promise<Map<string, PatientClinicalContext>> {
  if (patient_ids.length === 0) {
    return new Map()
  }

  // Get all patients at once
  const patients = await trx
    .selectFrom('patients')
    .leftJoin('patient_age', 'patients.id', 'patient_age.patient_id')
    .where('patients.id', 'in', patient_ids as string[])
    .select([
      'patients.id',
      'patients.gender',
      'patients.date_of_birth',
      'patient_age.age_years',
      'patient_age.age_number',
      'patient_age.age_unit',
    ])
    .execute()

  const conditions_map = new Map<string, string[]>()

  console.info(
    'Batch condition lookup not implemented yet, using age-based requirements only',
  )

  const context_map = new Map<string, PatientClinicalContext>()

  for (const patient of patients) {
    const age_days = calculateAgeDays(patient)
    const active_conditions = conditions_map.get(patient.id) || []
    const pregnancy_status = active_conditions.includes('77386006')

    context_map.set(patient.id, {
      patient_id: patient.id,
      age_days,
      gender: patient.gender as 'male' | 'female' | undefined,
      active_condition_snomed_codes: active_conditions,
      pregnancy_status,
    })
  }

  return context_map
}
