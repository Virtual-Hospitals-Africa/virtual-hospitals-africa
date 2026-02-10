import {
  assertAllPriorStepsCompleted,
  completeAndProceedToNextStep,
  completedProcedure,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import { patient_findings } from '../../../../../../../../db/models/patient_findings.ts'
import { postHandler } from '../../../../../../../../backend/postHandler.ts'
import { YesNoGrid, YesNoQuestion } from '../../../../../../../../islands/form/inputs/yes_no.tsx'
import { yes_no_unknown } from '../../../../../../../../util/validators.ts'
import { brief_history } from '../../../../../../../../db/models/brief_history.ts'
import entries from '../../../../../../../../util/entries.ts'
import { Existence, Maybe, MostRecentBriefHistoryFindings, RenderedBriefHistoryRelativeToHealthWorker, Sex } from '../../../../../../../../types.ts'
import { MostRecentRecord } from '../../../../../../../../islands/MostRecentRecord.tsx'
import { assert } from 'std/assert/assert.ts'
import { completedPersonal } from '../../../../../../../../shared/patient_registration.ts'
import { COMMON_CONDITIONS, CommonCondition, CommonConditionKey, commonConditionSnomedConcept } from '../../../../../../../../shared/brief_history.ts'
import { SELF_REPORTED_QUALIFIER, STATUS_ATTRIBUTE } from '../../../../../../../../shared/snomed_concepts.ts'
import { markEnteredInError } from '../../../../../../../../db/models/patient_records_base.ts'
import { promiseProps } from '../../../../../../../../util/promiseProps.ts'
import { exists } from '../../../../../../../../util/exists.ts'
import { events } from '../../../../../../../../db/models/events.ts'

const ConditionSchemaOptional = z.object(
  {
    existence: yes_no_unknown.optional(),
  },
).optional()

const ConditionSchemaRequired = z.object(
  {
    existence: yes_no_unknown,
  },
)

export const TriageBriefHistorySchema = z.object(
  {
    diabetes: ConditionSchemaRequired,
    pregnancy: ConditionSchemaRequired,
    tuberculosis: ConditionSchemaOptional,
    hiv: ConditionSchemaOptional,
    asthma: ConditionSchemaOptional,
    copd: ConditionSchemaOptional,
    covid19: ConditionSchemaOptional,
    heart_disease: ConditionSchemaOptional,
    mental_disorder: ConditionSchemaOptional,
    epilepsy: ConditionSchemaOptional,
    arthritis: ConditionSchemaOptional,
    cancer: ConditionSchemaOptional,
  } satisfies {
    [k in CommonConditionKey]: unknown
  },
)

function MostRecentRecords({ state }: OpenEncounterWorkflowContext) {
  const { trx, encounter, patient_id, health_worker_id } = state
  return brief_history.renderedMostRecentRecords(trx, {
    encounter,
    patient_id,
    health_worker_id,
    conditions: COMMON_CONDITIONS,
  })
}

function selfReportedStatusSExpression(
  condition_snomed_concept: { s_expression: string },
  existence: Existence,
): string {
  return `
    (finding 
      ${STATUS_ATTRIBUTE.s_expression}
      ${condition_snomed_concept.s_expression}
      ${patient_findings.QUALIFIERS_BY_EXISTENCE[existence].s_expression}
      (qualifier ${SELF_REPORTED_QUALIFIER.s_expression}))
  `.trim()
}

export const handler = postHandler(
  TriageBriefHistorySchema,
  async (ctx: OpenEncounterWorkflowContext, form_values) => {
    const {
      trx,
      patient_id,
      patient_encounter_id,
      patient_encounter_employee_id,
      employment_id,
      workflow_step_snomed_concept,
    } = ctx.state

    const completed_procedure = completedProcedure(ctx)
    const most_recent_findings = await MostRecentRecords(ctx)

    const findings_to_insert: string[] = []
    const altered_record_ids: string[] = []

    for (const [condition_key, condition] of entries(form_values)) {
      if (condition?.existence === undefined) continue

      const condition_snomed_concept = commonConditionSnomedConcept(condition_key)
      const prior_matching_finding = most_recent_findings[condition_key]

      if (
        prior_matching_finding?.existence === 'Yes' &&
        condition.existence === 'Yes'
      ) {
        continue
      }

      if (prior_matching_finding?.patient_encounter_id === patient_encounter_id) {
        altered_record_ids.push(prior_matching_finding.id)
      }

      findings_to_insert.push(
        selfReportedStatusSExpression(condition_snomed_concept, condition.existence),
      )
    }

    const { response } = await promiseProps({
      response: completeAndProceedToNextStep(ctx),
      _insert: insertFindings(),
      _mark_altered: markAlteredRecords(),
    })

    return response

    function insertFindings() {
      if (!findings_to_insert.length) {
        assert(
          completed_procedure,
          'Your first time submitting brief history there must be findings to insert',
        )
        return
      }

      return patient_findings.insertMany(trx, {
        patient_id,
        employment_id,
        patient_encounter_id,
        patient_encounter_employee_id,
        findings: findings_to_insert,
        procedure: completed_procedure || {
          create_with_specific_snomed_concept_id: exists(workflow_step_snomed_concept?.id),
        },
      })
    }

    function markAlteredRecords() {
      if (!completed_procedure) {
        assert(
          !altered_record_ids.length,
          'With no previously completed procedure, there cannot be record alterations',
        )
        return
      }

      return markEnteredInError(trx, {
        patient_id,
        employment_id,
        patient_encounter_id,
        altered_record_ids,
        ...completed_procedure,
      })
    }
  },
)

function CommonConditionRow(
  { condition, most_recent_finding, sex, organization_id }: {
    condition: CommonCondition
    most_recent_finding: Maybe<RenderedBriefHistoryRelativeToHealthWorker>
    sex: Sex
    organization_id: string
  },
) {
  const value: Existence | undefined = !most_recent_finding && condition.key === 'pregnancy' && sex === 'male' ? 'No' : most_recent_finding?.existence

  return (
    <YesNoQuestion
      name={`${condition.key}.existence`}
      required={condition.required}
      value={value}
      label={condition.label}
      most_recent_finding={
        <MostRecentRecord
          record={most_recent_finding}
          organization_id={organization_id}
        />
      }
    />
  )
}

function BriefHistorySection(
  { most_recent_findings, sex, organization_id }: {
    most_recent_findings: MostRecentBriefHistoryFindings
    sex: Sex
    organization_id: string
  },
) {
  return (
    <YesNoGrid title='Condition'>
      {COMMON_CONDITIONS.map((condition) => (
        <CommonConditionRow
          key={condition.key}
          condition={condition}
          sex={sex}
          organization_id={organization_id}
          most_recent_finding={most_recent_findings[condition.key]}
        />
      ))}
    </YesNoGrid>
  )
}

export async function TriageBriefHistoryPage(
  ctx: OpenEncounterWorkflowContext,
) {
  assertAllPriorStepsCompleted(ctx, {
    attempting_to_complete_workflow: false,
  })

  const { trx, encounter, patient_encounter_id, organization_employment } = ctx.state
  const { patient } = encounter
  await events.allProcessedForEncounter(trx, { patient_encounter_id })

  assert(completedPersonal(patient))

  return (
    <BriefHistorySection
      most_recent_findings={await MostRecentRecords(ctx)}
      sex={patient.sex}
      organization_id={organization_employment.id}
    />
  )
}

export default OpenEncounterWorkflowPage(TriageBriefHistoryPage)
