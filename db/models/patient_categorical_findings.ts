import { TrxOrDb } from '../../types.ts'
import generateUUID from '../../util/uuid.ts'

export interface CategoricalAssessment {
  finding_id: string
  option_snomed_concept_id: string | number
}

export interface AssessmentOption {
  id: string
  assessment_snomed_id: string
  option_snomed_concept_id: string
  display_label: string
  display_order: number
  ordinal_value: number
}

export interface AssessmentType {
  assessment_snomed_id: string
  name: string
  category: string
  display_order: number
  required_for_triage: boolean
}

export interface AssessmentForForm extends AssessmentType {
  finding_id: string
  options: AssessmentOption[]
}

/**
 * Get all assessment options for a specific assessment type
 */
export async function getAssessmentOptions(
  trx: TrxOrDb,
  { assessment_snomed_concept_id }: { assessment_snomed_concept_id: string },
): Promise<AssessmentOption[]> {
  return await trx
    .selectFrom('sats_triage_assessment_options')
    .where('assessment_snomed_id', '=', assessment_snomed_concept_id)
    .orderBy('display_order', 'asc')
    .selectAll()
    .execute()
}

/**
 * Get all assessments required for triage with their options
 */
export async function getTriageAssessmentsWithOptions(
  trx: TrxOrDb,
): Promise<AssessmentForForm[]> {
  const assessments = await trx
    .selectFrom('sats_triage_assessments')
    .where('required_for_triage', '=', true)
    .orderBy('display_order', 'asc')
    .selectAll()
    .execute()

  // Get options for each assessment
  const assessments_with_options: AssessmentForForm[] = []
  for (const assessment of assessments) {
    const options = await getAssessmentOptions(trx, {
      assessment_snomed_concept_id: assessment.assessment_snomed_id.toString(),
    })
    assessments_with_options.push({
      ...assessment,
      assessment_snomed_id: assessment.assessment_snomed_id.toString(),
      finding_id: generateUUID(), // Generate server-side like measurements
      options,
    })
  }

  return assessments_with_options
}

/**
 * Get display label for a categorical finding by its SNOMED concept ID
 */
export async function getDisplayLabelBySnomedId(
  trx: TrxOrDb,
  { option_snomed_concept_id }: { option_snomed_concept_id: string },
): Promise<string | null> {
  const option = await trx
    .selectFrom('sats_triage_assessment_options')
    .where('option_snomed_concept_id', '=', option_snomed_concept_id)
    .select('display_label')
    .executeTakeFirst()

  return option?.display_label || null
}
