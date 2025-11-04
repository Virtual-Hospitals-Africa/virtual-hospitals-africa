import {
  completeAndProceedToNextStep,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z, ZodEnum } from 'zod'
import * as patient_conditions from '../../../../../../../../db/models/patient_conditions.ts'
import { postHandler } from '../../../../../../../../util/postHandler.ts'
import {
  YesNoGrid,
  YesNoQuestion,
} from '../../../../../../../../islands/form/inputs/yes_no.tsx'
import FormSection from '../../../../../../../../components/library/FormSection.tsx'
import { yes_no_not_sure } from '../../../../../../../../util/validators.ts'

const COMMON_CONDITIONS = [
  { id: 'diabetes' as const, label: 'Diabetes' },
  { id: 'hypertension' as const, label: 'Hypertension' },
  { id: 'pregnancy' as const, label: 'Pregnancy' },
  { id: 'tuberculosis' as const, label: 'Tuberculosis' },
  { id: 'hiv' as const, label: 'Human Immunodeficiency Virus' },
  { id: 'asthma' as const, label: 'Asthma' },
  { id: 'copd' as const, label: 'Chronic Obstructive Pulmonary Disease' },
  { id: 'coronavirus' as const, label: 'Coronavirus' },
  { id: 'heart_disease' as const, label: 'Heart Disease' },
  { id: 'mental_disorder' as const, label: 'Mental Disorder' },
  { id: 'epilepsy' as const, label: 'Epilepsy' },
  { id: 'arthritis' as const, label: 'Arthritis' },
  { id: 'cancer' as const, label: 'Cancer' },
]

type CommonConditionKey = (typeof COMMON_CONDITIONS)[number]['id']

const TriageConfirmConditionsSchema = z.object(
  {
    diabetes: yes_no_not_sure,
    hypertension: yes_no_not_sure,
    pregnancy: yes_no_not_sure,
    tuberculosis: yes_no_not_sure,
    hiv: yes_no_not_sure,
    asthma: yes_no_not_sure,
    copd: yes_no_not_sure,
    coronavirus: yes_no_not_sure,
    heart_disease: yes_no_not_sure,
    mental_disorder: yes_no_not_sure,
    epilepsy: yes_no_not_sure,
    arthritis: yes_no_not_sure,
    cancer: yes_no_not_sure,
  } satisfies {
    [k in CommonConditionKey]: ZodEnum<['yes', 'no', 'not_sure']>
  },
)

export const handler = postHandler(
  TriageConfirmConditionsSchema,
  (ctx: OpenEncounterWorkflowContext, _form_values) => {
    // TODO: Implement condition saving logic

    return completeAndProceedToNextStep(ctx)
  },
)

function ConfirmConditionsSection() {
  return (
    <FormSection header='Confirm Pre-existing Conditions'>
      <YesNoGrid>
        {COMMON_CONDITIONS.map((condition, index) => (
          <YesNoQuestion
            key={condition.id}
            name={`condition_${condition.id}`}
            label={condition.label}
            isLast={index === COMMON_CONDITIONS.length - 1}
          />
        ))}
      </YesNoGrid>
    </FormSection>
  )
}

export async function TriageConfirmConditionsPage(
  ctx: OpenEncounterWorkflowContext,
) {
  const { trx, encounter } = ctx.state
  const patient_id = encounter.patient.id

  const _pre_existing_conditions = await patient_conditions
    .getPreExistingConditions(
      trx,
      { patient_id },
    )

  return <ConfirmConditionsSection />
}

export default OpenEncounterWorkflowPage(TriageConfirmConditionsPage)
