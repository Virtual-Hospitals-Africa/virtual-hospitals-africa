import { sql } from "kysely";
import { TrxOrDb } from "../../types.ts";

export interface TEWSScoreComponents {
  heart_rate: number;
  respiratory_rate: number;
  systolic_bp: number;
  temperature: number;
  consciousness: number;
  mobility: number;
  trauma: number;
}

export interface CategoricalFinding {
  snomed_concept_id: string;
  category: string;
  display_label: string;
  score_value: number;
}

export interface MeasurementScore {
  snomed_concept_id: string;
  score_value: number;
}

export interface TEWSScore {
  components: TEWSScoreComponents;
  total_score: number;
  categorical_findings: CategoricalFinding[];
  measurement_scores: MeasurementScore[];
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
    patient_id: string;
    patient_encounter_id: string;
    age_days: number | null;
    height_cm: number | null;
  },
): Promise<TEWSScore> {
  const result = await sql<string>`SELECT calculate_tews_score(${patient_id}, ${patient_encounter_id}, ${age_days}, ${height_cm})`.execute(trx);

  // deno-lint-ignore no-explicit-any
  const tewsResult = (result.rows[0] as any).calculate_tews_score;

  const parsedResult: TEWSScore = {
    components: tewsResult.components || {
      heart_rate: 0,
      respiratory_rate: 0,
      systolic_bp: 0,
      temperature: 0,
      consciousness: 0,
      mobility: 0,
      trauma: 0,
    },
    total_score: tewsResult.total_score || 0,
    categorical_findings: tewsResult.categorical_findings || [],
    measurement_scores: tewsResult.measurement_scores || [],
  };

  return parsedResult;
}