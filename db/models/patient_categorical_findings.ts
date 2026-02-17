import { VitalAssessment } from '../../shared/vitals.ts'
import { TrxOrDbOrQueryCreator } from '../../types.ts'
import { asText, jsonArrayFrom } from '../helpers.ts'

export type CategoricalAssessment = {
  value_snomed_concept_id: string | number
}

export type AssessmentOption = {
  option_snomed_concept_id: string
  display_label: string
  display_order: number
  ordinal_value: number
}

export type AssessmentType = {
  vital: VitalAssessment
  assessment_snomed_concept_id: string
  category: string
  display_order: number
  required_for_triage: boolean
}

export interface AssessmentForForm extends AssessmentType {
  options: AssessmentOption[]
}

export const patient_categorical_findings = {
  /**
   * Get all assessment options for a specific assessment type
   */
  getAssessmentOptions(
    trx: TrxOrDbOrQueryCreator,
    { assessment_snomed_concept_id }: { assessment_snomed_concept_id: string },
  ): Promise<AssessmentOption[]> {
    return trx
      .selectFrom('sats_triage_assessment_options')
      .where('assessment_snomed_concept_id', '=', assessment_snomed_concept_id)
      .orderBy('display_order', 'asc')
      .selectAll()
      .execute()
  },
  getTriageAssessmentsWithOptions(
    trx: TrxOrDbOrQueryCreator,
  ): Promise<AssessmentForForm[]> {
    return trx
      .selectFrom('sats_triage_assessments')
      .where('required_for_triage', '=', true)
      .orderBy('sats_triage_assessments.display_order', 'asc')
      .select((eb) => [
        asText(eb, 'sats_triage_assessments.assessment_snomed_concept_id').as(
          'assessment_snomed_concept_id',
        ),
        'sats_triage_assessments.category',
        'sats_triage_assessments.vital',
        'sats_triage_assessments.display_order',
        'sats_triage_assessments.required_for_triage',
        jsonArrayFrom(
          eb.selectFrom('sats_triage_assessment_options')
            .whereRef(
              'sats_triage_assessment_options.assessment_snomed_concept_id',
              '=',
              'sats_triage_assessments.assessment_snomed_concept_id',
            )
            .select([
              'sats_triage_assessment_options.option_snomed_concept_id',
              'sats_triage_assessment_options.display_label',
              'sats_triage_assessment_options.display_order',
              'sats_triage_assessment_options.ordinal_value',
            ]),
        ).as('options'),
      ])
      .execute()
  },
  async getDisplayLabelBySnomedId(
    trx: TrxOrDbOrQueryCreator,
    { option_snomed_concept_id }: { option_snomed_concept_id: string },
  ): Promise<string | null> {
    const option = await trx
      .selectFrom('sats_triage_assessment_options')
      .where('option_snomed_concept_id', '=', option_snomed_concept_id)
      .select('display_label')
      .executeTakeFirst()

    return option?.display_label || null
  },
}
