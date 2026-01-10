import {
  assertAllPriorStepsCompleted,
  completeAndProceedToNextStep,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import { postHandler } from '../../../../../../../../backend/postHandler.ts'
import {
  buildReferenceRanges,
  MEASUREMENTS_ORDERED,
  triageLevelFromTEWSTotal,
  VITAL_ASSESSMENTS_EVALUATION_SNOMED_CONCEPT_IDS,
  VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS,
  vitalAssessmentOrder,
  vitalMeasurementFromSnomedConceptId,
} from '../../../../../../../../shared/vitals.ts'
import { patient_vitals } from '../../../../../../../../db/models/patient_vitals.ts'
import {
  TriageAssignPriorityTableVital,
  WithTriageLevelFinding,
} from '../../../../../../../../types.ts'
import { TriageAssignPriorityTable } from '../../../../../../../../components/triage/AssignPriorityTable.tsx'
import { patientAgeDetermination } from '../../../../../../../../shared/patient_age_determination.ts'
import { assert } from 'std/assert/assert.ts'
import { completedPersonal } from '../../../../../../../../shared/patient_registration.ts'
import sortBy from '../../../../../../../../util/sortBy.ts'
import partition from '../../../../../../../../util/partition.ts'
import compact from '../../../../../../../../util/compact.ts'
import { patient_findings } from '../../../../../../../../db/models/patient_findings.ts'
import { hydrateIntermediateRecords } from '../../../../../../../../db/models/patient_record_providers.ts'
import { patient_triage_level } from '../../../../../../../../db/models/patient_triage.ts'
import { assertAllNotNull } from '../../../../../../../../util/assertAll.ts'
import { promiseProps } from '../../../../../../../../util/promiseProps.ts'
import { exists } from '../../../../../../../../util/exists.ts'
import { patient_evaluation_scores } from '../../../../../../../../db/models/patient_evaluation_scores.ts'
import sumBy from '../../../../../../../../util/sumBy.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { ORDERED_PRIORITIES } from '../../../../../../../../shared/priorities.ts'
import { intersection } from '../../../../../../../../util/intersection.ts'

const TriageAssignPrioritySchema = z.object({})

export const handler = postHandler(
  TriageAssignPrioritySchema,
  // deno-lint-ignore require-await
  async (ctx: OpenEncounterWorkflowContext, _form_values) => {
    return completeAndProceedToNextStep(ctx)
  },
)

async function withTriageLevelFindings(
  {
    state: {
      trx,
      encounter,
      patient_id,
      patient_encounter_id,
      health_worker_id,
    },
  }: OpenEncounterWorkflowContext,
): Promise<WithTriageLevelFinding[]> {
  const findings = await patient_findings.getByIds(
    trx,
    patient_triage_level.distinctIds(
      trx,
      {
        patient_id,
        patient_encounter_id,
        s_expression: '(evaluation (evaluates (finding)))',
      },
      'evaluates_record_id',
    ),
  )

  assertAllNotNull(findings, 'priority')

  return hydrateIntermediateRecords(trx, {
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
): Promise<TriageAssignPriorityTableVital[]> {
  assert(completedPersonal(patient))

  const age_determination = patientAgeDetermination(patient)

  const this_encounter_vitals = await patient_vitals
    .getMostRecent(trx, {
      health_worker_id,
      patient_id,
      patient_encounter_id,
      measurement_snomed_concept_ids: Object.values(
        VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS,
      ),
      assessment_snomed_concept_ids: Object.values(
        VITAL_ASSESSMENTS_EVALUATION_SNOMED_CONCEPT_IDS,
      ),
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
        const previous =
          previous_vitals.measurements.find((m) =>
            m.specific_snomed_concept.snomed_concept_id ===
              finding.specific_snomed_concept.snomed_concept_id
          ) ?? null

        return {
          finding,
          previous,
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
      Object.values(VITAL_ASSESSMENTS_EVALUATION_SNOMED_CONCEPT_IDS),
    )
    const previous = previous_vitals.assessments.find((a) => {
      a.evaluations.some((e) =>
        evaluation_snomed_concept_ids.includes(
          e.root_snomed_concept.snomed_concept_id,
        )
      )
    }) ?? null
    return { finding, previous }
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
          VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS.blood_pressure_diastolic
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

  const { vitals, total_score, with_triage_level_findings } =
    await promiseProps({
      vitals: sortedVitals(ctx),
      total_score: totalScore(ctx),
      with_triage_level_findings: withTriageLevelFindings(ctx),
    })

  assertEquals(
    total_score.score,
    sumBy(vitals, (vital) => vital.finding.score || 0),
  )
  assert(
    ORDERED_PRIORITIES.indexOf(priority) <=
      ORDERED_PRIORITIES.indexOf(total_score.priority),
  )

  with_triage_level_findings.forEach((f) => {
    console.log(f)
    console.log(f.evaluations[0])
  })
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
