import {
  completeAndProceedToNextStep,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import * as patient_findings from '../../../../../../../../db/models/patient_findings.ts'
import { postHandler } from '../../../../../../../../util/postHandler.ts'
import {
  YesNoGrid,
  YesNoQuestion,
} from '../../../../../../../../islands/form/inputs/yes_no.tsx'
import FormSection from '../../../../../../../../components/library/FormSection.tsx'
import { yes_no_not_sure } from '../../../../../../../../util/validators.ts'
import {
  COMMON_CONDITIONS,
  CommonConditionKey,
  commonConditionSnomedConceptId,
  positiveFindings,
} from '../../../../../../../../db/models/brief_history.ts'
import entries from '../../../../../../../../util/entries.ts'
import { forEach } from '../../../../../../../../util/inParallel.ts'
import { NO_QUALIFIER_SNOMED_CONCEPT_ID } from '../../../../../../../../db/models/patient_findings.ts'
import { inBackground } from '../../../../../../../../util/inBackground.ts'

const ConditionSchemaOptional = z.object(
  {
    presence: yes_no_not_sure.optional(),
  },
).optional()

const ConditionSchemaRequired = z.object(
  {
    presence: yes_no_not_sure,
  },
)

const TriageBriefHistorySchema = z.object(
  {
    diabetes: ConditionSchemaRequired,
    pregnancy: ConditionSchemaRequired,
    tuberculosis: ConditionSchemaOptional,
    hiv: ConditionSchemaOptional,
    asthma: ConditionSchemaOptional,
    copd: ConditionSchemaOptional,
    coronavirus: ConditionSchemaOptional,
    heart_disease: ConditionSchemaOptional,
    mental_disorder: ConditionSchemaOptional,
    epilepsy: ConditionSchemaOptional,
    arthritis: ConditionSchemaOptional,
    cancer: ConditionSchemaOptional,
  } satisfies {
    [k in CommonConditionKey]: unknown
  },
)

export const handler = postHandler(
  TriageBriefHistorySchema,
  (ctx: OpenEncounterWorkflowContext, form_values) => {
    const inserting_findings = forEach(
      entries(form_values),
      async ([condition_key, condition]) => {
        if (
          condition?.presence === undefined || condition.presence === 'not_sure'
        ) {
          return
        }
        const finding_snomed_concept_id = commonConditionSnomedConceptId(
          condition_key,
        )

        const qualifiers = condition.presence === 'yes' ? [] : [
          {
            snomed_concept_id: NO_QUALIFIER_SNOMED_CONCEPT_ID,
          },
        ]

        await patient_findings.insertOne(
          ctx.state.trx,
          {
            patient_id: ctx.state.patient.id,
            patient_encounter_id: ctx.state.encounter.patient_encounter_id,
            patient_encounter_employee_id: ctx.state.encounter_employee_presence
              .patient_encounter_employee_id,
            workflow_snomed_concept_id: ctx.state.workflow_snomed_concept_id,
            workflow_step_snomed_concept_id:
              ctx.state.workflow_step_snomed_concept_id,
            previously_completed_procedures:
              ctx.state.previously_completed_procedures,
            finding_snomed_concept_id,
            altered_record_id: null,
            qualifiers,
          },
        )
      },
    )

    return inBackground(
      inserting_findings,
      () => completeAndProceedToNextStep(ctx),
    )
  },
)

function BriefHistorySection() {
  return (
    <FormSection header='Confirm Pre-existing Conditions'>
      <YesNoGrid>
        {COMMON_CONDITIONS.map((condition) => (
          <YesNoQuestion
            key={condition.key}
            name={`${condition.key}.presence`}
            label={condition.label}
          />
        ))}
      </YesNoGrid>
    </FormSection>
  )
}

export async function TriageBriefHistoryPage(
  ctx: OpenEncounterWorkflowContext,
) {
  const { trx, encounter } = ctx.state
  const patient_id = encounter.patient.id

  const positive_findings = await positiveFindings(
    trx,
    { patient_id },
  )
  console.log(positive_findings)

  return <BriefHistorySection />
}

export default OpenEncounterWorkflowPage(TriageBriefHistoryPage)
