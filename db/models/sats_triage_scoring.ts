import { sql } from 'kysely'
import { TrxOrDb } from '../../types.ts'

export type TEWSScoreComponents = {
  heart_rate: number
  respiratory_rate: number
  blood_pressure_systolic: number
  temperature: number
  consciousness: number
  mobility_assessment: number
  trauma_presence: number
}

export type CategoricalFinding = {
  snomed_concept_id: string
  category: string
  display_label: string
  score_value: number
}

export type MeasurementScore = {
  finding_snomed_concept_id: string
  score_value: number
}

export type TEWSScore = {
  components: TEWSScoreComponents
  total_score: number
  categorical_findings: CategoricalFinding[]
  measurement_scores: MeasurementScore[]
}

/**
 * Calculate complete TEWS score from database for a patient encounter
 * using the calculate_tews_score SQL function.
 */
export async function calculateTEWSFromDatabase(
  trx: TrxOrDb,
  {
    patient_id,
    patient_encounter_id,
    age_days,
    height_cm,
  }: {
    patient_id: string
    patient_encounter_id: string
    age_days: number | null
    height_cm: number | null
  },
): Promise<TEWSScore> {
  const result = await sql<
    string
  >`SELECT calculate_tews_score(${patient_id}, ${patient_encounter_id}, ${age_days}, ${height_cm})`
    .execute(trx)

  // deno-lint-ignore no-explicit-any
  const { calculate_tews_score } = result.rows[0] as any

  return {
    components: calculate_tews_score.components || {
      heart_rate: 0,
      respiratory_rate: 0,
      blood_pressure_systolic: 0,
      temperature: 0,
      consciousness: 0,
      mobility_assessment: 0,
      trauma_presence: 0,
    },
    total_score: calculate_tews_score.total_score || 0,
    categorical_findings: calculate_tews_score.categorical_findings || [],
    measurement_scores: calculate_tews_score.measurement_scores || [],
  }
}
