import {
  assertAllPriorStepsCompleted,
  completeAndProceedToNextStep,
  createProcedureIfNotAlreadyCompleted,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import { patient_findings } from '../../../../../../../../db/models/patient_findings.ts'
import { postHandler } from '../../../../../../../../util/postHandler.ts'
import {
  YesNoGrid,
  YesNoQuestion,
} from '../../../../../../../../islands/form/inputs/yes_no.tsx'
import FormSection from '../../../../../../../../components/library/FormSection.tsx'
import { yes_no_unknown } from '../../../../../../../../util/validators.ts'
import {
  renderedMostRecentFindings,
} from '../../../../../../../../db/models/brief_history.ts'
import entries from '../../../../../../../../util/entries.ts'
import { forEach } from '../../../../../../../../util/inParallel.ts'
import { inBackground } from '../../../../../../../../util/inBackground.ts'
import {
  Existence,
  MostRecentBriefHistoryFindings,
  RenderedFindingRelativeToHealthWorker,
  Sex,
} from '../../../../../../../../types.ts'
import { MostRecentFinding } from '../../../../../../../../components/library/MostRecentFinding.tsx'
import { assert } from 'std/assert/assert.ts'
import { completedPersonal } from '../../../../../../../../shared/patient_registration.ts'
import {
  COMMON_CONDITIONS,
  CommonConditionKey,
  commonConditionSnomedConceptId,
} from '../../../../../../../../shared/brief_history.ts'
import { parseFindingExpression } from '../../../../../../../../shared/s_expression.ts'

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
  async (ctx: OpenEncounterWorkflowContext, form_values) => {
    const { trx, encounter, health_worker } = ctx.state
    const { patient } = encounter
    const patient_id = patient.id

    const { procedure_id } = await createProcedureIfNotAlreadyCompleted(ctx)

    const most_recent_findings = await renderedMostRecentFindings(
      trx,
      { patient_id, encounter, health_worker_id: health_worker.id },
    )

    const inserting_findings = forEach(
      entries(form_values),
      ([condition_key, condition]) => {
        if (!condition) return Promise.resolve()
        if (condition.existence === undefined) return Promise.resolve()

        const condition_snomed_concept_id = commonConditionSnomedConceptId(
          condition_key,
        )

        const existing_finding = most_recent_findings[condition_key]

        if (
          condition.existence === 'Yes' && existing_finding?.existence === 'Yes'
        ) {
          return Promise.resolve()
        }

        if (
          existing_finding &&
          existing_finding.patient_encounter_id ===
            encounter.patient_encounter_id &&
          existing_finding.existence
        ) {
          return Promise.resolve()
        }

        return patient_findings.insertOneNested(
          ctx.state.trx,
          {
            patient_id: ctx.state.patient.id,
            patient_encounter_id: ctx.state.encounter.patient_encounter_id,
            patient_encounter_employee_id: ctx.state.encounter_employee_presence
              .patient_encounter_employee_id,
            procedure_id,
            finding: parseFindingExpression(`
              (finding ${patient_findings.STATUS_ATTRIBUTE_SNOMED_CONCEPT_ID} ${
              patient_findings.QUALIFIERS_BY_EXISTENCE[condition.existence]
            }
                (qualifier ${patient_findings.SELF_REPORTED_QUALIFIER_SNOMED_CONCEPT_ID})
                (qualifier ${condition_snomed_concept_id}))
            `),
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

function CommonConditionRow(
  { condition, most_recent_finding, sex, organization_id }: {
    condition: (typeof COMMON_CONDITIONS)[number]
    most_recent_finding: RenderedFindingRelativeToHealthWorker | null
    sex: Sex
    organization_id: string
  },
) {
  const value: Existence | undefined =
    !most_recent_finding && condition.key === 'pregnancy' && sex === 'male'
      ? 'No'
      : most_recent_finding?.existence

  return (
    <YesNoQuestion
      name={`${condition.key}.existence`}
      required={condition.required}
      value={value}
      label={condition.label}
      most_recent_finding={
        <MostRecentFinding
          finding={most_recent_finding}
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
    <FormSection header='Confirm Pre-existing Conditions'>
      <YesNoGrid>
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
    </FormSection>
  )
}

export async function TriageBriefHistoryPage(
  ctx: OpenEncounterWorkflowContext,
) {
  assertAllPriorStepsCompleted(ctx)
  const { trx, encounter, health_worker, organization_employment } = ctx.state
  const { patient } = encounter
  const patient_id = patient.id

  const most_recent_findings = await renderedMostRecentFindings(
    trx,
    { patient_id, encounter, health_worker_id: health_worker.id },
  )

  assert(completedPersonal(patient))

  return (
    <BriefHistorySection
      most_recent_findings={most_recent_findings}
      sex={patient.sex}
      organization_id={organization_employment.id}
    />
  )
}

export default OpenEncounterWorkflowPage(TriageBriefHistoryPage)
