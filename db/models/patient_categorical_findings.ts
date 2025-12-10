import { TrxOrDb } from '../../types.ts'
import generateUUID from '../../util/uuid.ts'
import { blankSelection } from '../helpers.ts'

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
 * Insert a single categorical finding
 */
export function insert(
  trx: TrxOrDb,
  {
    patient_id,
    patient_encounter_id,
    patient_encounter_employee_id,
    procedure_id,
    finding_snomed_concept_id,
  }: {
    patient_id: string
    patient_encounter_id: string
    patient_encounter_employee_id: string
    procedure_id: string
    finding_snomed_concept_id: string
  },
) {
  const finding_id = generateUUID()

  return trx
    .with('inserting_record', (qb) =>
      qb.insertInto('patient_records').values({
        id: finding_id,
        patient_id,
        patient_encounter_id,
        snomed_concept_id: finding_snomed_concept_id,
      })
    )
    .with('inserting_finding', (qb) =>
      qb.insertInto('patient_findings').values({
        id: finding_id,
        patient_encounter_employee_id,
        procedure_id,
      })
    )
    .with('inserting_categorical_finding', (qb) =>
      qb.insertInto('patient_categorical_findings').values({
        id: finding_id,
      })
    )
    .selectFrom('inserting_categorical_finding')
    .selectAll()
}

/**
 * Insert multiple categorical findings with a shared procedure
 * Similar to patient_measurements.insertMany but for categorical assessments
 */
export async function insertMany(
  trx: TrxOrDb,
  {
    input_assessments,
    patient_id,
    patient_encounter_id,
    patient_encounter_employee_id,
    procedure,
  }: {
    input_assessments: CategoricalAssessment[]
    patient_id: string
    patient_encounter_id: string
    patient_encounter_employee_id: string
    procedure: {
      id?: string
      create_from_snomed_concept_id: string
    }
  },
) {
  const procedure_id = procedure.id || generateUUID()

  // Generate finding IDs if not provided
  const assessments_with_ids = input_assessments.map((a) => ({
    ...a,
    finding_id: a.finding_id || generateUUID(),
  }))

  return trx
    .with('inserting_procedure_record', (qb) =>
      procedure.id
        ? blankSelection(qb)
        : qb.insertInto('patient_records').values({
            id: procedure_id,
            patient_id,
            patient_encounter_id,
            snomed_concept_id: procedure.create_from_snomed_concept_id,
          })
    )
    .with('inserting_procedure', (qb) =>
      procedure.id
        ? blankSelection(qb)
        : qb.insertInto('patient_procedures').values({
            id: procedure_id,
            patient_encounter_employee_id,
          })
    )
    .with('inserting_finding_records', (qb) =>
      assessments_with_ids.length
        ? qb.insertInto('patient_records').values(
            assessments_with_ids.map((a) => ({
              id: a.finding_id,
              patient_id,
              patient_encounter_id,
              snomed_concept_id: a.option_snomed_concept_id,
            }))
          )
        : blankSelection(qb)
    )
    .with('inserting_findings', (qb) =>
      assessments_with_ids.length
        ? qb.insertInto('patient_findings').values(
            assessments_with_ids.map((a) => ({
              id: a.finding_id,
              procedure_id,
              patient_encounter_employee_id,
            }))
          )
        : blankSelection(qb)
    )
    .with('inserting_categorical_findings', (qb) =>
      assessments_with_ids.length
        ? qb.insertInto('patient_categorical_findings').values(
            assessments_with_ids.map((a) => ({
              id: a.finding_id,
            }))
          ).returning('id')
        : blankSelection(qb)
    )
    .selectFrom('inserting_categorical_findings')
    .selectAll()
    .execute()

  return { procedure_id, inserted_count: assessments_with_ids.length }
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
