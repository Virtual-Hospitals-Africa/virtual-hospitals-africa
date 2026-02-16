import { Sex, TrxOrDbOrQueryCreator, VitalMeasurementFormInputDefition } from '../../types.ts'
import { VITAL_MEASUREMENTS_UNITS, vitalMeasurementFromSnomedConceptId } from '../../shared/vitals.ts'
import { asText, now } from '../helpers.ts'

export interface MeasurementRequirement {
  readonly snomed_concept_id: string
  readonly is_required: boolean
  readonly clinical_rationale: string
  readonly medical_standard: string
  readonly frequency_recommendation?: string
}

export interface MeasurementRequirementsResult {
  readonly measurements: VitalMeasurementFormInputDefition[]
  readonly applied_requirements: MeasurementRequirement[]
  readonly audit_info: {
    readonly age_based_count: number
    readonly condition_based_count: number
    readonly total_requirements: number
  }
}

export const clinical_measurement_requirements = {
  /**
   * Determines required measurements for a patient based on age and medical conditions
   * Pure function that combines age-based and condition-based requirements
   */
  async determineMeasurementsForPatient(
    trx: TrxOrDbOrQueryCreator,
    {
      age_days,
      active_condition_snomed_codes,
    }: {
      patient_id: string
      age_days: number
      sex: Sex
      active_condition_snomed_codes: readonly string[]
      pregnancy_status?: boolean
    },
  ): Promise<MeasurementRequirementsResult> {
    const age_requirements = await getAgeMeasurementRequirements(
      trx,
      age_days,
    )

    const condition_requirements = await getConditionMeasurementRequirements(
      trx,
      active_condition_snomed_codes,
    )

    const all_requirements = [...age_requirements, ...condition_requirements]
    const merged_measurements = mergeMeasurementRequirements(all_requirements)

    return {
      measurements: merged_measurements,
      applied_requirements: all_requirements,
      audit_info: {
        age_based_count: age_requirements.length,
        condition_based_count: condition_requirements.length,
        total_requirements: all_requirements.length,
      },
    }
  },
}

async function getAgeMeasurementRequirements(
  trx: TrxOrDbOrQueryCreator,
  age_days: number,
): Promise<readonly MeasurementRequirement[]> {
  const requirements = await trx
    .selectFrom('age_measurement_requirements')
    .select((eb) => [
      asText(eb, 'required_measurement_snomed_concept_id').as(
        'snomed_concept_id',
      ),
      'is_required',
      'clinical_rationale',
      'medical_standard',
    ])
    .where('active', '=', true)
    .where((eb) =>
      eb.or([
        eb('age_min_days', 'is', null),
        eb('age_min_days', '<=', age_days),
      ])
    )
    .where((eb) =>
      eb.or([
        eb('age_max_days', 'is', null),
        eb('age_max_days', '>=', age_days),
      ])
    )
    .where('effective_date', '<=', now)
    .where((eb) =>
      eb.or([
        eb('expiration_date', 'is', null),
        eb('expiration_date', '>', now),
      ])
    )
    .execute()

  return requirements.map((requirement) => ({
    vital: vitalMeasurementFromSnomedConceptId(requirement.snomed_concept_id),
    ...requirement,
  }))
}

async function getConditionMeasurementRequirements(
  trx: TrxOrDbOrQueryCreator,
  condition_snomed_codes: readonly string[],
): Promise<readonly MeasurementRequirement[]> {
  if (condition_snomed_codes.length === 0) {
    return []
  }

  const requirements = await trx
    .selectFrom('condition_measurement_requirements')
    .select((eb) => [
      asText(eb, 'required_measurement_snomed_concept_id').as(
        'snomed_concept_id',
      ),
      'is_required',
      'clinical_rationale',
      'medical_standard',
      'frequency_recommendation',
    ])
    .where(
      'condition_snomed_concept_id',
      'in',
      condition_snomed_codes.map((code) => code),
    )
    .where('active', '=', true)
    .where('effective_date', '<=', now)
    .where((eb) =>
      eb.or([
        eb('expiration_date', 'is', null),
        eb('expiration_date', '>', now),
      ])
    )
    .execute()

  return requirements.map((req) => ({
    snomed_concept_id: req.snomed_concept_id,
    is_required: req.is_required,
    clinical_rationale: req.clinical_rationale,
    medical_standard: req.medical_standard,
    frequency_recommendation: req.frequency_recommendation || undefined,
  }))
}

function mergeMeasurementRequirements(
  requirements: readonly MeasurementRequirement[],
): VitalMeasurementFormInputDefition[] {
  // Group by SNOMED code to handle duplicates
  const requirements_map = new Map<string, MeasurementRequirement>()

  for (const requirement of requirements) {
    const existing = requirements_map.get(requirement.snomed_concept_id)

    if (!existing) {
      requirements_map.set(requirement.snomed_concept_id, requirement)
    } else {
      const should_replace = (requirement.frequency_recommendation &&
        !existing.frequency_recommendation) ||
        (requirement.medical_standard > existing.medical_standard)

      if (should_replace) {
        requirements_map.set(requirement.snomed_concept_id, requirement)
      }
    }
  }

  return Array.from(requirements_map.values()).map((requirement) => {
    const vital = vitalMeasurementFromSnomedConceptId(
      requirement.snomed_concept_id,
    )
    return {
      vital,
      snomed_concept_id: requirement.snomed_concept_id,
      required: true as const,
      units: VITAL_MEASUREMENTS_UNITS[vital],
    }
  })
}
