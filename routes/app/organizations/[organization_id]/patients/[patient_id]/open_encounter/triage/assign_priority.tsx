import {
  assertAllPriorStepsCompleted,
  completeAndProceedToNextStep,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import { postHandler } from '../../../../../../../../util/postHandler.ts'
import {
  ALL_VITAL_SNOMED_CONCEPT_IDS,
  ASESSMENTS_ORDERED,
  buildReferenceRanges,
  MEASUREMENTS_ORDERED,
  triageLevelFromTEWSTotal,
  VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS,
  vitalAssessmentFromSnomedConceptId,
  vitalMeasurementFromSnomedConceptId,
} from '../../../../../../../../shared/vitals.ts'
import { patient_vitals } from '../../../../../../../../db/models/patient_vitals.ts'
import {
  RecordValueMeasurement,
  RenderedFindingRelativeToHealthWorker,
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
      patient_id,
      patient_encounter_id,
    },
  }: OpenEncounterWorkflowContext,
) {
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
    priority: triageLevelFromTEWSTotal(score),
  }
}

async function sortedVitals(
  {
    state: { trx, patient, patient_id, patient_encounter_id, health_worker_id },
  }: OpenEncounterWorkflowContext,
): Promise<TriageAssignPriorityTableVital[]> {
  assert(completedPersonal(patient))

  const age_determination = patientAgeDetermination(patient)

  const vitals_this_encounter = await patient_vitals
    .getMostRecent(trx, {
      health_worker_id,
      patient_id,
      patient_encounter_id,
      snomed_concept_ids: ALL_VITAL_SNOMED_CONCEPT_IDS,
    })

  const previous_vitals = await patient_vitals
    .getMostRecent(trx, {
      health_worker_id,
      patient_id,
      excluding_patient_encounter_id: patient_encounter_id,
      snomed_concept_ids: vitals_this_encounter.map((v) =>
        v.finding_snomed_concept.snomed_concept_id
      ),
    })

  const unsorted_vitals = vitals_this_encounter.map(
    (finding) => {
      const previous =
        previous_vitals.find((v) =>
          v.finding_snomed_concept.snomed_concept_id ===
            finding.finding_snomed_concept.snomed_concept_id
        ) ?? null

      return {
        finding,
        previous,
      }
    },
  )

  const [measurements_unsorted, assessments_unsorted] = partition(
    unsorted_vitals,
    function isMeasurement(r): r is {
      finding: RenderedFindingRelativeToHealthWorker & {
        value: RecordValueMeasurement
      }
      previous:
        | null
        | (RenderedFindingRelativeToHealthWorker & {
          value: RecordValueMeasurement
        })
    } {
      if (r.finding.value?.type !== 'measurement') return false
      if (r.previous) {
        assert(r.previous.value?.type === 'measurement')
      }
      return true
    },
  )

  const measurements_unsorted_with_reference_ranges = measurements_unsorted.map(
    (m) => ({
      ...m,
      reference_ranges: buildReferenceRanges(
        m.finding.finding_snomed_concept.snomed_concept_id,
        age_determination,
        compact([m.finding.value.value, m.previous?.value.value]),
      ),
    }),
  )

  const assessments = sortBy(
    assessments_unsorted,
    (a) => -exists(a.finding.score),
    (a) =>
      ASESSMENTS_ORDERED.indexOf(
        vitalAssessmentFromSnomedConceptId(
          a.finding.finding_snomed_concept.snomed_concept_id,
        ),
      ),
  )

  const [tews_measurements_unsorted, other_measurements_unsorted] = partition(
    measurements_unsorted_with_reference_ranges,
    (m) => m.finding.score != null,
  )

  const tews_measurements = sortBy(
    tews_measurements_unsorted,
    (m) =>
      MEASUREMENTS_ORDERED.indexOf(
        vitalMeasurementFromSnomedConceptId(
          m.finding.finding_snomed_concept.snomed_concept_id,
        ),
      ),
  )

  const other_measurements = sortBy(
    other_measurements_unsorted,
    (m) =>
      m.finding.finding_snomed_concept.snomed_concept_id ===
          VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS.blood_pressure_diastolic
        ? 0
        : 1,
    (m) => m.finding.created_at,
    (m) => m.finding.displays.finding,
  )

  return [
    ...assessments,
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
