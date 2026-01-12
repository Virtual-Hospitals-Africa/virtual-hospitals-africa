import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<unknown>) {
  // Create unified SATS triage scoring rules table
  await db.schema
    .createTable('sats_triage_scoring_rules')
    .addColumn('id', 'uuid', (col) => col.primaryKey())
    .addColumn('scoring_system', 'varchar(50)', (col) => col.notNull())
    // For categorical assessments (AVPU, mobility_assessment, trauma_presence)
    .addColumn(
      'assessment_option_id',
      'uuid',
      (col) => col.references('sats_triage_assessment_options.id').onDelete('cascade'),
    )
    // For quantitative measurements (HR, RR, BP, Temp)
    .addColumn('specific_snomed_concept_id', 'bigint')
    .addColumn('value_min', 'decimal(10, 2)')
    .addColumn('value_max', 'decimal(10, 2)')
    // Age/height stratification (applies to both types)
    .addColumn('age_min_days', 'integer')
    .addColumn('age_max_days', 'integer')
    .addColumn('height_min_cm', 'integer')
    .addColumn('height_max_cm', 'integer')
    .addColumn('score_value', 'integer', (col) => col.notNull())
    .addColumn(
      'created_at',
      'timestamptz',
      (col) => col.notNull().defaultTo(sql`now()`),
    )
    .addColumn(
      'updated_at',
      'timestamptz',
      (col) => col.notNull().defaultTo(sql`now()`),
    )
    // Check constraint: must be either categorical OR quantitative
    // Categorical: has assessment_option_id, no finding/values
    // Quantitative: has specific_snomed_concept_id, at least one value bound (min or max)
    .addCheckConstraint(
      'scoring_rule_type_check',
      sql`(
        (assessment_option_id IS NOT NULL
         AND specific_snomed_concept_id IS NULL
         AND value_min IS NULL
         AND value_max IS NULL)
        OR
        (assessment_option_id IS NULL
         AND specific_snomed_concept_id IS NOT NULL
         AND (value_min IS NOT NULL OR value_max IS NOT NULL))
      )`,
    )
    .execute()

  await sql`
    CREATE OR REPLACE FUNCTION calculate_tews_score(
        p_patient_id UUID,
        p_patient_encounter_id UUID,
        p_age_days INT,
        p_height_cm INT
    )
    RETURNS jsonb
    AS $$
    DECLARE
        result jsonb;
    BEGIN
        WITH recent_categorical_findings AS (
            SELECT DISTINCT ON (assessment.category)
                records.value_snomed_concept_id AS snomed_concept_id,
                assessment.assessment_snomed_concept_id,
                assessment.category
            FROM patient_records AS records
            JOIN patient_findings AS findings ON records.id = findings.id
            JOIN sats_triage_assessments AS assessment ON records.snomed_concept_id = assessment.assessment_snomed_concept_id
            JOIN sats_triage_assessment_options AS opt
                ON opt.assessment_snomed_concept_id = assessment.assessment_snomed_concept_id
                AND records.value_snomed_concept_id = opt.option_snomed_concept_id
            WHERE records.patient_id = p_patient_id
              AND records.patient_encounter_id = p_patient_encounter_id
              AND assessment.category IN ('consciousness', 'mobility', 'trauma')
            ORDER BY assessment.category, records.created_at DESC
        ),
        categorical_scores AS (
            SELECT DISTINCT ON (rcf.category)
                rcf.snomed_concept_id,
                rcf.category,
                opt.display_label,
                COALESCE(rule.score_value, 0) AS score_value
            FROM recent_categorical_findings AS rcf
            JOIN sats_triage_assessment_options AS opt
                ON rcf.snomed_concept_id = opt.option_snomed_concept_id
                AND rcf.assessment_snomed_concept_id = opt.assessment_snomed_concept_id
            LEFT JOIN sats_triage_scoring_rules AS rule
                ON opt.id = rule.assessment_option_id
                AND rule.scoring_system = 'TEWS'
                AND (
                    (p_age_days IS NULL AND rule.age_min_days IS NULL AND rule.age_max_days IS NULL)
                    OR
                    (p_age_days IS NOT NULL AND (
                        (rule.age_min_days IS NULL AND rule.age_max_days IS NULL)
                        OR
                        (rule.age_min_days <= p_age_days AND (rule.age_max_days IS NULL OR rule.age_max_days >= p_age_days))
                    ))
                )
                AND (
                    (p_height_cm IS NULL AND rule.height_min_cm IS NULL AND rule.height_max_cm IS NULL)
                    OR
                    (p_height_cm IS NOT NULL AND (
                        (rule.height_min_cm IS NULL AND rule.height_max_cm IS NULL)
                        OR
                        (rule.height_min_cm <= p_height_cm AND (rule.height_max_cm IS NULL OR rule.height_max_cm >= p_height_cm))
                    ))
                )
            ORDER BY rcf.category, rule.score_value DESC
        ),
        recent_quantitative_measurements AS (
            SELECT DISTINCT ON (findings.specific_snomed_concept_id)
                findings.specific_snomed_concept_id,
                meas.value::float
            FROM patient_records AS records
            JOIN patient_findings AS findings ON records.id = findings.id
            JOIN patient_measurements AS meas ON findings.id = meas.id
            WHERE records.patient_id = p_patient_id
              AND records.patient_encounter_id = p_patient_encounter_id
              AND findings.specific_snomed_concept_id IN ('8499008', '86290005', '271649006', '386725007') -- heart_rate, resp_rate, blood_pressure_systolic, temp
            ORDER BY findings.specific_snomed_concept_id, records.created_at DESC
        ),
        quantitative_scores AS (
            SELECT DISTINCT ON (rqm.specific_snomed_concept_id)
                rqm.specific_snomed_concept_id,
                COALESCE(rule.score_value, 0) AS score_value
            FROM recent_quantitative_measurements AS rqm
            LEFT JOIN sats_triage_scoring_rules AS rule
                ON rqm.specific_snomed_concept_id = rule.specific_snomed_concept_id
                AND rule.scoring_system = 'TEWS'
                AND (rule.value_min IS NULL OR rqm.value >= rule.value_min)
                AND (rule.value_max IS NULL OR rqm.value <= rule.value_max)
                AND (
                    (p_age_days IS NULL AND rule.age_min_days IS NULL AND rule.age_max_days IS NULL)
                    OR
                    (p_age_days IS NOT NULL AND (
                        (rule.age_min_days IS NULL AND rule.age_max_days IS NULL)
                        OR
                        (rule.age_min_days <= p_age_days AND (rule.age_max_days IS NULL OR rule.age_max_days >= p_age_days))
                    ))
                )
                AND (
                    (p_height_cm IS NULL AND rule.height_min_cm IS NULL AND rule.height_max_cm IS NULL)
                    OR
                    (p_height_cm IS NOT NULL AND (
                        (rule.height_min_cm IS NULL AND rule.height_max_cm IS NULL)
                        OR
                        (rule.height_min_cm <= p_height_cm AND (rule.height_max_cm IS NULL OR rule.height_max_cm >= p_height_cm))
                    ))
                )
            ORDER BY rqm.specific_snomed_concept_id, rule.score_value DESC
        ),
        all_components AS (
            SELECT 'consciousness' as component, score_value FROM categorical_scores WHERE category = 'consciousness'
            UNION ALL
            SELECT 'mobility_assessment' as component, score_value FROM categorical_scores WHERE category = 'mobility'
            UNION ALL
            SELECT 'trauma_presence' as component, score_value FROM categorical_scores WHERE category = 'trauma'
            UNION ALL
            SELECT 'heart_rate' as component, score_value FROM quantitative_scores WHERE specific_snomed_concept_id = '8499008'
            UNION ALL
            SELECT 'respiratory_rate' as component, score_value FROM quantitative_scores WHERE specific_snomed_concept_id = '86290005'
            UNION ALL
            SELECT 'blood_pressure_systolic' as component, score_value FROM quantitative_scores WHERE specific_snomed_concept_id = '271649006'
            UNION ALL
            SELECT 'temperature' as component, score_value FROM quantitative_scores WHERE specific_snomed_concept_id = '386725007'
        )
        SELECT jsonb_build_object(
            'components', jsonb_object_agg(component, score_value),
            'total_score', SUM(score_value),
            'categorical_findings', (SELECT jsonb_agg(jsonb_build_object('snomed_concept_id', snomed_concept_id, 'category', category, 'display_label', display_label, 'score_value', score_value)) FROM categorical_scores),
            'measurement_scores', (SELECT jsonb_agg(jsonb_build_object('specific_snomed_concept_id', specific_snomed_concept_id, 'score_value', score_value)) FROM quantitative_scores)
        )
        INTO result
        FROM all_components;

        RETURN COALESCE(result, '{}'::jsonb);
    END;
    $$ LANGUAGE plpgsql;
  `.execute(db)
}

export async function down(db: Kysely<unknown>) {
  await sql`DROP FUNCTION IF EXISTS calculate_tews_score(UUID, UUID, INT, INT);`
    .execute(db)
  await db.schema.dropTable('sats_triage_scoring_rules').execute()
}
