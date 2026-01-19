import {
  assertAllPriorStepsCompleted,
  completeAndProceedToNextStep,
  createProcedureIfNotAlreadyCompleted,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import { patient_measurements } from '../../../../../../../../db/models/patient_measurements.ts'
import { postHandler } from '../../../../../../../../backend/postHandler.ts'
import { positive_decimal } from '../../../../../../../../util/validators.ts'
import { VitalsMeasurementsForm } from '../../../../../../../../components/vitals/MeasurementsForm.tsx'
import {
  getScoreForAssessment,
  getScoreForMeasurement,
  measureVitalsInputDefinitions,
  triageLevelFromTEWSTotal,
  VITAL_ASSESSMENTS_EVALUATION_SNOMED_CONCEPTS,
  VITAL_MEASUREMENTS_SNOMED_CONCEPTS,
} from '../../../../../../../../shared/vitals.ts'
import { parseWithSchema, sExpressionZodValidator } from '../../../../../../../../shared/s_expression.ts'
import { pMap } from '../../../../../../../../util/inParallel.ts'
import { patient_findings } from '../../../../../../../../db/models/patient_findings.ts'
import keys from '../../../../../../../../util/keys.ts'
import entries from '../../../../../../../../util/entries.ts'
import { assert } from 'std/assert/assert.ts'
import { patient_vitals } from '../../../../../../../../db/models/patient_vitals.ts'
import { brief_history } from '../../../../../../../../db/models/brief_history.ts'
import { COMMON_CONDITIONS } from '../../../../../../../../shared/brief_history.ts'
import { patientAgeDetermination } from '../../../../../../../../shared/patient_age_determination.ts'
import { completedPersonal } from '../../../../../../../../shared/patient_registration.ts'
import { promiseProps } from '../../../../../../../../util/promiseProps.ts'
import { patient_evaluation_scores } from '../../../../../../../../db/models/patient_evaluation_scores.ts'
import { assertOr400 } from '../../../../../../../../util/assertOr.ts'
import { VitalAssessmentFormInputDefition, VitalMeasurementFormInputDefition } from '../../../../../../../../types.ts'
import { patient_triage } from '../../../../../../../../db/models/patient_triage.ts'
import { EVALUATION_ACTION, SEVERITY_SCORE } from '../../../../../../../../shared/snomed_concepts.ts'
import { inverseSExpression } from '../../../../../../../../shared/s_expression_inverse.ts'
import compact from '../../../../../../../../util/compact.ts'
import { events } from '../../../../../../../../db/models/events.ts'
import { comparator, defined_finding } from '../../../../../../../../shared/s_expression_schemas.ts'

export const TriageMeasureVitalsSchema = z.object({
  measurements: z.partialRecord(
    z.enum(keys(VITAL_MEASUREMENTS_SNOMED_CONCEPTS)),
    z.object({
      value: positive_decimal.optional(),
      units: z.string().min(1),
    }).strict().transform(({ value, units }) => value ? { value, units } : undefined),
  ).default({}),
  assessments: z.partialRecord(
    z.enum(keys(VITAL_ASSESSMENTS_EVALUATION_SNOMED_CONCEPTS)),
    z.object({
      s_expression: sExpressionZodValidator(defined_finding),
    }).strict(),
  ).default({}),
}).strict()

async function sharedVitalsDeterminations(ctx: OpenEncounterWorkflowContext) {
  assertAllPriorStepsCompleted(ctx, {
    attempting_to_complete_workflow: false,
  })

  const { trx, health_worker, patient, encounter } = ctx.state
  assert(completedPersonal(patient))

  const age_determination = patientAgeDetermination(patient)
  const patient_id = patient.id
  const { diabetes } = await brief_history.renderedMostRecentFindings(
    trx,
    {
      patient_id,
      encounter,
      health_worker_id: health_worker.id,
      conditions: COMMON_CONDITIONS.filter((condition) => condition.key === 'diabetes'),
    },
  )

  const { measurements, assessments } = measureVitalsInputDefinitions({
    age_determination,
    has_diabetes: diabetes?.existence === 'Yes',
  })

  return { age_determination, measurements, assessments }
}

export const handler = postHandler(
  TriageMeasureVitalsSchema,
  async (ctx: OpenEncounterWorkflowContext, form_values) => {
    console.log('got here', form_values)
    const {
      trx,
      health_worker_id,
      patient_id,
      patient_encounter_id,
      patient_encounter_employee_id,
    } = ctx.state

    const {
      procedure: { procedure_id },
      shared: { age_determination, measurements, assessments },
      previous_measurements_this_encounter,
      previous_assessments_this_encounter,
    } = await promiseProps({
      procedure: createProcedureIfNotAlreadyCompleted(ctx),
      shared: sharedVitalsDeterminations(ctx),
      previous_measurements_this_encounter: patient_vitals
        .getMostRecentMeasurements(
          trx,
          {
            patient_id,
            patient_encounter_id,
            health_worker_id,
            snomed_concept_ids: Object.values(
              VITAL_MEASUREMENTS_SNOMED_CONCEPTS,
            ).map((concept) => concept.id),
          },
        ),
      previous_assessments_this_encounter: patient_vitals
        .getMostRecentAssessments(
          trx,
          {
            patient_id,
            patient_encounter_id,
            health_worker_id,
            snomed_concept_ids: Object.values(
              VITAL_ASSESSMENTS_EVALUATION_SNOMED_CONCEPTS,
            ).map((concept) => concept.id),
          },
        ),
    })

    // Assert all required measurements are present or were already measured this encounter
    for (const { vital, units, snomed_concept_id } of measurements) {
      const form_input = form_values.measurements[vital]
      if (form_input) {
        assertOr400(
          form_input.units === units,
          `Expected units to be ${units}. Received ${form_input.units}.`,
        )
        continue
      }

      const measured_previously = previous_measurements_this_encounter.some(
        (v) => v.specific_snomed_concept.snomed_concept_id === snomed_concept_id,
      )
      assertOr400(
        measured_previously,
        `Missing required measurement: ${vital}`,
      )
    }

    // Assert all required assessments are present or were already measured this encounter
    for (
      const { vital, options, evaluation_snomed_concept_id } of assessments
    ) {
      const form_input = form_values.assessments[vital]
      if (form_input) {
        const option_s_expressions = options.map((o) => o.s_expression)
        const normal_form = inverseSExpression(form_input.s_expression)
        assert(form_input.s_expression)
        assertOr400(
          option_s_expressions.includes(
            normal_form,
          ),
          `Expected s_expression to be one of ${option_s_expressions}. Received ${normal_form}.`,
        )
        continue
      }

      const assessed_previously = previous_assessments_this_encounter.some(
        (finding) =>
          finding.evaluations.some((evaluation) =>
            evaluation.specific_snomed_concept.snomed_concept_id ===
              evaluation_snomed_concept_id
          ),
      )
      assertOr400(
        assessed_previously,
        `Missing required assessment: ${vital}`,
      )
    }

    const [inserted_measurements, inserted_assessments] = await Promise.all([
      pMap(
        entries(form_values.measurements),
        async ([vital, measurement]) => {
          if (!measurement) return

          const snomed_concept = VITAL_MEASUREMENTS_SNOMED_CONCEPTS[vital]
          const measurement_comparison = parseWithSchema(
            `(= (measurement ${snomed_concept.s_expression} ${measurement.units}) ${measurement.value})`,
            comparator,
          )
          const result = await patient_measurements.insertOneNested(trx, {
            patient_id,
            patient_encounter_id,
            patient_encounter_employee_id,
            procedure_id,
            measurement_comparison,
          })

          const score = getScoreForMeasurement(
            age_determination,
            vital,
            measurement_comparison.right,
          )
          if (score != null) {
            await patient_evaluation_scores.insertOneNested(trx, {
              score,
              patient_id,
              patient_encounter_id,
              by_system: true,
              evaluates_record_id: result.measurement_id,
              evaluation: `(evaluation ${EVALUATION_ACTION.s_expression} ${SEVERITY_SCORE.s_expression})`,
            })
          }
          return result.measurement_id
        },
      ),
      pMap(
        entries(form_values.assessments),
        async ([vital, assessment]) => {
          if (!assessment) return
          assert(assessment.s_expression)

          const result = await patient_findings.insertOneNested(trx, {
            patient_id,
            patient_encounter_id,
            patient_encounter_employee_id,
            procedure_id,
            finding: assessment.s_expression,
          })

          const score = getScoreForAssessment(
            age_determination,
            vital,
            assessment.s_expression,
          )
          if (score != null) {
            const evaluation_snomed_concept = VITAL_ASSESSMENTS_EVALUATION_SNOMED_CONCEPTS[vital]

            await patient_evaluation_scores.insertOneNested(trx, {
              score,
              patient_id,
              patient_encounter_id,
              by_system: true,
              evaluates_record_id: result.finding_id,
              evaluation: `(evaluation ${EVALUATION_ACTION.s_expression} ${evaluation_snomed_concept.s_expression})`,
            })
          }
          return result.finding_id
        },
      ),
    ])

    const all_inserted = compact([...inserted_measurements, ...inserted_assessments]).map((id) => ({
      id,
      existence: 'Yes' as const,
    }))

    const { total_score } = await patient_evaluation_scores
      .totalTEWSEncounterScore(trx, { patient_encounter_id })

    const score_evaluation = await patient_evaluation_scores.insertOneNested(
      trx,
      {
        score: total_score,
        patient_id,
        patient_encounter_id,
        by_system: true,
        evaluates_record_id: procedure_id,
        evaluation: `(evaluation ${EVALUATION_ACTION.s_expression} ${SEVERITY_SCORE.s_expression})`,
      },
    )

    await patient_triage.insertLevel(trx, {
      patient_id,
      patient_encounter_id,
      procedure_id,
      by_system: true,
      evaluates_record_id: score_evaluation.evaluation_id,
      triage_level: triageLevelFromTEWSTotal(total_score, age_determination),
    })

    await events.insert(trx, {
      type: 'ProcedureCompleted',
      data: {
        patient_id,
        patient_encounter_id,
        procedure_id,
        findings: all_inserted,
      },
    })

    // await additional_tasks.insertTasksIfNotAlreadyIdentified(trx, {
    //   patient_id,
    //   patient_encounter_id,
    // })

    return completeAndProceedToNextStep(ctx)
  },
)

export async function TriageMeasureVitalsPage(
  ctx: OpenEncounterWorkflowContext,
) {
  const { measurements, assessments } = await sharedVitalsDeterminations(ctx)

  const most_recent_patient_measurements = await patient_vitals
    .getMostRecentMeasurements(
      ctx.state.trx,
      {
        patient_id: ctx.state.patient.id,
        health_worker_id: ctx.state.health_worker.id,
        snomed_concept_ids: measurements.map((m) => m.snomed_concept_id),
      },
    )

  const most_recent_patient_assessments = await patient_vitals
    .getMostRecentAssessments(
      ctx.state.trx,
      {
        patient_id: ctx.state.patient.id,
        health_worker_id: ctx.state.health_worker.id,
        snomed_concept_ids: assessments.map((m) => m.evaluation_snomed_concept_id),
      },
    )

  function notRequiredIfMeasurementAlreadyDoneThisEncounter<
    Def extends VitalMeasurementFormInputDefition,
  >(
    def: Def,
  ): Def {
    if (!def.required) return def
    const already_done_this_encounter = most_recent_patient_measurements.some(
      (v) =>
        v.specific_snomed_concept.snomed_concept_id === def.snomed_concept_id &&
        v.patient_encounter_id === ctx.state.encounter.patient_encounter_id,
    )
    return {
      ...def,
      required: !already_done_this_encounter,
    }
  }

  function notRequiredIfAssessmentAlreadyDoneThisEncounter<
    Def extends VitalAssessmentFormInputDefition,
  >(
    def: Def,
  ): Def {
    if (!def.required) return def

    const already_done_this_encounter = most_recent_patient_assessments.some(
      (v) =>
        v.evaluations.some((e) =>
          e.specific_snomed_concept.snomed_concept_id ===
            def.evaluation_snomed_concept_id
        ) &&
        v.patient_encounter_id === ctx.state.encounter.patient_encounter_id,
    )
    return {
      ...def,
      required: !already_done_this_encounter,
    }
  }

  return (
    <VitalsMeasurementsForm
      vital_measurements_for_this_encounter={measurements.map(
        notRequiredIfMeasurementAlreadyDoneThisEncounter,
      )}
      triage_assessments={assessments.map(
        notRequiredIfAssessmentAlreadyDoneThisEncounter,
      )}
      most_recent_patient_vitals={[
        ...most_recent_patient_measurements,
        ...most_recent_patient_assessments,
      ]}
      organization_id={ctx.state.organization.id}
    />
  )
}

export default OpenEncounterWorkflowPage(TriageMeasureVitalsPage)
