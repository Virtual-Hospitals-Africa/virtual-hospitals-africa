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
import {
  Existence,
  Maybe,
  MostRecentBriefHistoryFindings,
  RenderedBriefHistoryRelativeToHealthWorker,
  Sex,
} from '../../../../../../../../types.ts'
import { MostRecentFinding } from '../../../../../../../../components/library/MostRecentFinding.tsx'
import { assert } from 'std/assert/assert.ts'
import { completedPersonal } from '../../../../../../../../shared/patient_registration.ts'
import {
  COMMON_CONDITIONS,
  CommonCondition,
  CommonConditionKey,
  commonConditionSnomedConceptId,
} from '../../../../../../../../shared/brief_history.ts'
import {
  SELF_REPORTED_QUALIFIER,
  STATUS_ATTRIBUTE,
} from '../../../../../../../../shared/snomed_concepts.ts'
import { markEnteredInError } from '../../../../../../../../db/models/patient_records_base.ts'
import { promiseProps } from '../../../../../../../../util/promiseProps.ts'

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

function mostRecentFindings({ state }: OpenEncounterWorkflowContext) {
  const { trx, encounter, patient_id, health_worker_id } = state
  return renderedMostRecentFindings(trx, {
    encounter,
    patient_id,
    health_worker_id,
    conditions: COMMON_CONDITIONS,
  })
}

function selfReportedStatusSExpression(
  condition_snomed_concept_id: string,
  existence: Existence,
): string {
  return `
    (finding 
      ${STATUS_ATTRIBUTE.id}
      ${condition_snomed_concept_id}
      ${patient_findings.QUALIFIERS_BY_EXISTENCE[existence]}
      (qualifier ${SELF_REPORTED_QUALIFIER.id}))
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
    } = ctx.state
    const { response } = await promiseProps({
      response: completeAndProceedToNextStep(ctx),
      _: insertBriefHistory(),
    })
    return response

    async function insertBriefHistory() {
      const { procedure: { procedure_id }, most_recent_findings } =
        await promiseProps({
          procedure: createProcedureIfNotAlreadyCompleted(ctx),
          most_recent_findings: mostRecentFindings(ctx),
        })

      return forEach(
        entries(form_values),
        ([condition_key, condition]): Promise<unknown> => {
          if (condition?.existence === undefined) {
            return Promise.resolve('Nothing to insert')
          }

          const condition_snomed_concept_id = commonConditionSnomedConceptId(
            condition_key,
          )

          const prior_matching_finding = most_recent_findings[condition_key]

          if (
            prior_matching_finding?.existence === 'Yes' &&
            condition.existence === 'Yes'
          ) {
            return Promise.resolve(
              'This condition was already known',
            )
          }

          const prior_from_this_encounter =
            prior_matching_finding?.patient_encounter_id ===
              patient_encounter_id

          const maybe_marking_prior_finding_in_error =
            prior_from_this_encounter &&
            markEnteredInError(trx, {
              patient_id,
              procedure_id,
              employment_id,
              patient_encounter_id,
              altered_record_id: prior_matching_finding.record_id,
            })

          const inserting = patient_findings.insertOneNested(
            trx,
            {
              patient_id,
              procedure_id,
              patient_encounter_id,
              patient_encounter_employee_id,
              finding: selfReportedStatusSExpression(
                condition_snomed_concept_id,
                condition.existence,
              ),
            },
          )

          return Promise.all([maybe_marking_prior_finding_in_error, inserting])
        },
      )
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
    </FormSection>
  )
}

export async function TriageBriefHistoryPage(
  ctx: OpenEncounterWorkflowContext,
) {
  assertAllPriorStepsCompleted(ctx, {
    attempting_to_complete_workflow: false,
  })

  const { encounter, organization_employment } = ctx.state
  const { patient } = encounter

  assert(completedPersonal(patient))

  return (
    <BriefHistorySection
      most_recent_findings={await mostRecentFindings(ctx)}
      sex={patient.sex}
      organization_id={organization_employment.id}
    />
  )
}

export default OpenEncounterWorkflowPage(TriageBriefHistoryPage)
