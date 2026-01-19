import { assertAllPriorStepsCompleted, completeAndProceedToNextStep, OpenEncounterWorkflowContext, OpenEncounterWorkflowPage } from '../_middleware.tsx'
import { z } from 'zod'
import { postHandler } from '../../../../../../../../backend/postHandler.ts'
import {
  buildReferenceRanges,
  MEASUREMENTS_ORDERED,
  triageLevelFromTEWSTotal,
  VITAL_ASSESSMENTS_EVALUATION_SNOMED_CONCEPTS,
  VITAL_MEASUREMENTS_SNOMED_CONCEPTS,
  vitalAssessmentOrder,
  vitalMeasurementFromSnomedConceptId,
} from '../../../../../../../../shared/vitals.ts'
import { patient_vitals } from '../../../../../../../../db/models/patient_vitals.ts'
import { RenderedFindingRelativeToHealthWorker, TriageAssignPriorityTableRow } from '../../../../../../../../types.ts'
import { TriageAssignPriorityTable } from '../../../../../../../../components/triage/AssignPriorityTable.tsx'
import { patientAgeDetermination } from '../../../../../../../../shared/patient_age_determination.ts'
import { assert } from 'std/assert/assert.ts'
import { completedPersonal } from '../../../../../../../../shared/patient_registration.ts'
import sortBy from '../../../../../../../../util/sortBy.ts'
import partition from '../../../../../../../../util/partition.ts'
import compact from '../../../../../../../../util/compact.ts'
import { patient_findings } from '../../../../../../../../db/models/patient_findings.ts'
import { patient_record_providers } from '../../../../../../../../db/models/patient_record_providers.ts'

import { promiseProps } from '../../../../../../../../util/promiseProps.ts'
import { exists } from '../../../../../../../../util/exists.ts'
import { patient_evaluation_scores } from '../../../../../../../../db/models/patient_evaluation_scores.ts'
import { intersection } from '../../../../../../../../util/intersection.ts'
import { patient_procedures } from '../../../../../../../../db/models/patient_procedures.ts'
import { WORKFLOW_STEP_SNOMED_CONCEPTS } from '../../../../../../../../shared/workflow.ts'

const TriageAssignPrioritySchema = z.object({})

export const handler = postHandler(
  TriageAssignPrioritySchema,
  // deno-lint-ignore require-await
  async (ctx: OpenEncounterWorkflowContext, _form_values) => {
    return completeAndProceedToNextStep(ctx)
  },
)

async function findingsFromWarningSignsOrAdditionalTasksAndInvestigations(
  {
    state: {
      trx,
      encounter,
      patient_id,
      patient_encounter_id,
      health_worker_id,
    },
  }: OpenEncounterWorkflowContext,
): Promise<RenderedFindingRelativeToHealthWorker[]> {
  const findings = await patient_findings.findAll(
    trx,
    {
      patient_id,
      patient_encounter_id,
      procedure_id: patient_procedures.distinctIds(
        trx,
        {
          patient_id,
          patient_encounter_id,
          specific_snomed_concept_id: [
            WORKFLOW_STEP_SNOMED_CONCEPTS.triage!.warning_signs.id,
            WORKFLOW_STEP_SNOMED_CONCEPTS.triage!.additional_tasks_and_investigations.id,
          ],
        },
      ),
    },
  )

  return patient_record_providers.hydrateIntermediateRecords(trx, {
    records: findings,
    health_worker_id,
    encounter,
  })
}

async function totalScore(
  {
    state: {
      trx,
      patient,
      patient_id,
      patient_encounter_id,
    },
  }: OpenEncounterWorkflowContext,
) {
  assert(completedPersonal(patient))
  const age_determination = patientAgeDetermination(patient)

  const { score } = await patient_evaluation_scores.findFirst(
    trx,
    {
      patient_id,
      patient_encounter_id,
      s_expression: '(evaluation (evaluates (procedure)))',
    },
  )

  return {
    score,
    priority: triageLevelFromTEWSTotal(score, age_determination),
  }
}

async function sortedVitals(
  {
    state: { trx, patient, patient_id, patient_encounter_id, health_worker_id },
  }: OpenEncounterWorkflowContext,
): Promise<TriageAssignPriorityTableRow[]> {
  assert(completedPersonal(patient))

  const age_determination = patientAgeDetermination(patient)

  const this_encounter_vitals = await patient_vitals
    .getMostRecent(trx, {
      health_worker_id,
      patient_id,
      patient_encounter_id,
      measurement_snomed_concept_ids: Object.values(
        VITAL_MEASUREMENTS_SNOMED_CONCEPTS,
      ).map((concept) => concept.id),
      assessment_snomed_concept_ids: Object.values(
        VITAL_ASSESSMENTS_EVALUATION_SNOMED_CONCEPTS,
      ).map((concept) => concept.id),
    })

  const previous_vitals = await patient_vitals
    .getMostRecent(trx, {
      health_worker_id,
      patient_id,
      excluding_patient_encounter_id: patient_encounter_id,
      measurement_snomed_concept_ids: this_encounter_vitals.measurements.map((
        v,
      ) => v.specific_snomed_concept.snomed_concept_id),
      assessment_snomed_concept_ids: this_encounter_vitals.assessments.flatMap((
        v,
      ) => v.evaluations.map((e) => e.root_snomed_concept.snomed_concept_id)),
    })

  const measurements_unsorted_with_reference_ranges = this_encounter_vitals
    .measurements.map(
      (finding) => {
        const previous = previous_vitals.measurements.find((m) =>
          m.specific_snomed_concept.snomed_concept_id ===
            finding.specific_snomed_concept.snomed_concept_id
        ) ?? null

        return {
          finding,
          previous,
          type: 'measurement' as const,
          reference_ranges: buildReferenceRanges(
            finding.specific_snomed_concept.snomed_concept_id,
            age_determination,
            compact([finding.value.value, previous?.value.value]),
          ),
        }
      },
    )

  const assessments_sorted = sortBy(
    this_encounter_vitals.assessments,
    (a) => -exists(a.score),
    vitalAssessmentOrder,
  ).map((finding) => {
    const evaluation_snomed_concept_ids = intersection(
      finding.evaluations.map((e) => e.root_snomed_concept.snomed_concept_id),
      Object.values(VITAL_ASSESSMENTS_EVALUATION_SNOMED_CONCEPTS).map((concept) => concept.id),
    )
    const previous = previous_vitals.assessments.find((a) => {
      a.evaluations.some((e) =>
        evaluation_snomed_concept_ids.includes(
          e.root_snomed_concept.snomed_concept_id,
        )
      )
    }) ?? null
    return { finding, previous, type: 'assessment' as const }
  })

  const [tews_measurements_unsorted, other_measurements_unsorted] = partition(
    measurements_unsorted_with_reference_ranges,
    (m) => m.finding.score != null,
  )

  const tews_measurements = sortBy(
    tews_measurements_unsorted,
    (m) =>
      MEASUREMENTS_ORDERED.indexOf(
        vitalMeasurementFromSnomedConceptId(
          m.finding.specific_snomed_concept.snomed_concept_id,
        ),
      ),
  )

  const other_measurements = sortBy(
    other_measurements_unsorted,
    (m) =>
      m.finding.specific_snomed_concept.snomed_concept_id ===
          VITAL_MEASUREMENTS_SNOMED_CONCEPTS.blood_pressure_diastolic.id
        ? 0
        : 1,
    (m) => m.finding.created_at,
    (m) => m.finding.displays.finding,
  )

  return [
    ...assessments_sorted,
    ...tews_measurements,
    ...other_measurements,
  ]
}

export async function TriageAssignPriorityPage(
  ctx: OpenEncounterWorkflowContext,
) {
  assertAllPriorStepsCompleted(ctx, {
    attempting_to_complete_workflow: false,
  })

  const priority = exists(ctx.state.encounter.priority).name

  const { vitals, total_score, with_triage_level_findings } = await promiseProps({
    vitals: sortedVitals(ctx),
    total_score: totalScore(ctx),
    with_triage_level_findings: findingsFromWarningSignsOrAdditionalTasksAndInvestigations(ctx),
  })

  // TODO: need this back on
  // assertEquals(
  //   total_score.score,
  //   sumBy(vitals, (vital) => vital.finding.score || 0),
  // )
  // assert(
  //   ORDERED_PRIORITIES.indexOf(priority) <=
  //     ORDERED_PRIORITIES.indexOf(total_score.priority),
  // )

  return (
    <TriageAssignPriorityTable
      with_triage_level_findings={with_triage_level_findings}
      vitals={vitals}
      priority={priority}
      total_score={total_score.score}
    />
  )
}

export default OpenEncounterWorkflowPage(TriageAssignPriorityPage)
