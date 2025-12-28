import {
assertAllPriorStepsCompleted,
  completeAndProceedToNextStep,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import { postHandler } from '../../../../../../../../util/postHandler.ts'
import { ALL_VITAL_SNOMED_CONCEPT_IDS, ASESSMENTS_ORDERED, buildReferenceRanges, MEASUREMENTS_ORDERED, VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS, vitalAssessmentFromSnomedConceptId, vitalMeasurementFromSnomedConceptId } from '../../../../../../../../shared/vitals.ts'
import { patient_vitals } from '../../../../../../../../db/models/patient_vitals.ts'
import matching from '../../../../../../../../util/matching.ts'
import { TriageAssignPriorityTableVital } from '../../../../../../../../types.ts'
import { TriageAssignPriorityTable } from '../../../../../../../../components/triage/AssignPriorityTable.tsx'
import { patientAgeDetermination } from '../../../../../../../../shared/patient_age_determination.ts'
import assert from 'assert'
import { completedPersonal } from '../../../../../../../../shared/patient_registration.ts'
import sortBy from '../../../../../../../../util/sortBy.ts'
import partition from '../../../../../../../../util/partition.ts'

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
  const { trx, health_worker_id, patient, patient_id, patient_encounter_id } = ctx.state
  
  assertAllPriorStepsCompleted(ctx, {
    attempting_to_complete_workflow: false,
  })

  assert(completedPersonal(patient))
  // const findings_with_a_triage_level: RenderedFindingRelativeToHealthWorker[] = await patient_findings.getByIds(
  //   trx,
  //   patient_triage_level.distinctIds(
  //     trx,
  //     {
  //       patient_id: ctx.state.patient.id,
  //       patient_encounter_id: ctx.state.encounter.patient_encounter_id,
  //       s_expression: '(evaluation (evaluates (finding)))'
  //     }
  //   )
  // ).then(findings =>
  //   hydrateIntermediateRecords(trx, {
  //     records: findings,
  //     health_worker_id,
  //     encounter,
  //   })
  // )

  // findings_with_a_triage_level.forEach(finding => assertHasProperty(finding, 'priority'))

  // console.log({ findings_with_a_triage_level })

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

  const unsorted_vitals: TriageAssignPriorityTableVital[] = vitals_this_encounter.map(
    (current) => {
      const previous = previous_vitals.find(matching({
        finding_snomed_concept_id: current.finding_snomed_concept_id,
      })) ?? null
      const reference_ranges = typeof current.value === 'number'
        ? buildReferenceRanges(
          current.finding_snomed_concept_id,
          age_determination,
          typeof previous?.value === 'number'
            ? [current.value, previous.value]
            : [current.value]
        )
        : null

      return {
        current,
        previous,
        reference_ranges
      }
    },
  )

  const [measurements_unsorted, assessments_unsorted] = partition(unsorted_vitals, function isMeasurement({ current }) {
    return typeof current.value === 'number'
  })

  const assessments = sortBy(assessments_unsorted, 
    a => ASESSMENTS_ORDERED.indexOf(vitalAssessmentFromSnomedConceptId(a.current.finding_snomed_concept_id)))

  const [tews_measurements_unsorted, other_measurements_unsorted] = partition(measurements_unsorted, m => m.current.score != null)

  const tews_measurements = sortBy(tews_measurements_unsorted, 
    m => MEASUREMENTS_ORDERED.indexOf(vitalMeasurementFromSnomedConceptId(m.current.finding_snomed_concept_id)))

  const other_measurements = sortBy(
    other_measurements_unsorted,
    m => m.current.finding_snomed_concept_id === VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS.blood_pressure_diastolic ? 0 : 1,
    m => m.current.created_at,
    m => m.current.finding_display,
  )
  
  const vitals = [
    ...assessments,
    ...tews_measurements,
    ...other_measurements,
  ]

  return <TriageAssignPriorityTable vitals={vitals} />
}

export default OpenEncounterWorkflowPage(TriageAssignPriorityPage)
