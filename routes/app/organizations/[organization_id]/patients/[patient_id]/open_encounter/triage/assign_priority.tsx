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
  VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS,
  vitalAssessmentFromSnomedConceptId,
  vitalMeasurementFromSnomedConceptId,
} from '../../../../../../../../shared/vitals.ts'
import { patient_vitals } from '../../../../../../../../db/models/patient_vitals.ts'
import matching from '../../../../../../../../util/matching.ts'
import {
  RenderedFindingRelativeToHealthWorker,
  TriageAssignPriorityTableVital,
} from '../../../../../../../../types.ts'
import { TriageAssignPriorityTable } from '../../../../../../../../components/triage/AssignPriorityTable.tsx'
import { patientAgeDetermination } from '../../../../../../../../shared/patient_age_determination.ts'
import { assert } from 'std/assert/assert.ts'
import { completedPersonal } from '../../../../../../../../shared/patient_registration.ts'
import sortBy from '../../../../../../../../util/sortBy.ts'
import partition from '../../../../../../../../util/partition.ts'
import { positive_decimal } from '../../../../../../../../util/validators.ts'
import compact from '../../../../../../../../util/compact.ts'
import { patient_findings } from '../../../../../../../../db/models/patient_findings.ts'
import { hydrateIntermediateRecords } from '../../../../../../../../db/models/patient_record_providers.ts'
import { patient_triage_level } from '../../../../../../../../db/models/patient_triage.ts'
import { assertAllNotNull } from '../../../../../../../../util/assertAll.ts'

const TriageAssignPrioritySchema = z.object({})

export const handler = postHandler(
  TriageAssignPrioritySchema,
  // deno-lint-ignore require-await
  async (ctx: OpenEncounterWorkflowContext, _form_values) => {
    return completeAndProceedToNextStep(ctx)
  },
)

export async function TriageAssignPriorityPage(
  ctx: OpenEncounterWorkflowContext,
) {
  const {
    trx,
    encounter,
    health_worker_id,
    patient,
    patient_id,
    patient_encounter_id,
  } = ctx.state

  assertAllPriorStepsCompleted(ctx, {
    attempting_to_complete_workflow: false,
  })

  assert(completedPersonal(patient))
  const with_triage_level_findings: RenderedFindingRelativeToHealthWorker[] =
    await patient_findings.getByIds(
      trx,
      patient_triage_level.distinctIds(
        trx,
        {
          patient_id: ctx.state.patient.id,
          patient_encounter_id: ctx.state.encounter.patient_encounter_id,
          s_expression: '(evaluation (evaluates (finding)))',
        },
        'evaluates_record_id',
      ),
    ).then((findings) =>
      hydrateIntermediateRecords(trx, {
        records: findings,
        health_worker_id,
        encounter,
      })
    )

  assertAllNotNull(with_triage_level_findings, 'priority')

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
        v.finding_snomed_concept_id
      ),
    })

  const unsorted_vitals: TriageAssignPriorityTableVital[] =
    vitals_this_encounter.map(
      (finding) => {
        const previous = previous_vitals.find(matching({
          finding_snomed_concept_id: finding.finding_snomed_concept_id,
        })) ?? null
        const reference_ranges = buildReferenceRanges(
          finding.finding_snomed_concept_id,
          age_determination,
          compact([finding.value, previous?.value]),
        )

        return {
          finding,
          previous,
          reference_ranges,
        }
      },
    )

  const [measurements_unsorted, assessments_unsorted] = partition(
    unsorted_vitals,
    function isMeasurement({ finding }) {
      return positive_decimal.safeParse(finding.value).success
    },
  )

  const assessments = sortBy(
    assessments_unsorted,
    (a) =>
      ASESSMENTS_ORDERED.indexOf(
        vitalAssessmentFromSnomedConceptId(a.finding.finding_snomed_concept_id),
      ),
  )

  const [tews_measurements_unsorted, other_measurements_unsorted] = partition(
    measurements_unsorted,
    (m) => m.finding.score != null,
  )

  const tews_measurements = sortBy(
    tews_measurements_unsorted,
    (m) =>
      MEASUREMENTS_ORDERED.indexOf(
        vitalMeasurementFromSnomedConceptId(
          m.finding.finding_snomed_concept_id,
        ),
      ),
  )

  const other_measurements = sortBy(
    other_measurements_unsorted,
    (m) =>
      m.finding.finding_snomed_concept_id ===
          VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS.blood_pressure_diastolic
        ? 0
        : 1,
    (m) => m.finding.created_at,
    (m) => m.finding.finding_display,
  )

  const vitals = [
    ...assessments,
    ...tews_measurements,
    ...other_measurements,
  ]

  return (
    <TriageAssignPriorityTable
      vitals={vitals}
      with_triage_level_findings={with_triage_level_findings}
    />
  )
}

export default OpenEncounterWorkflowPage(TriageAssignPriorityPage)
