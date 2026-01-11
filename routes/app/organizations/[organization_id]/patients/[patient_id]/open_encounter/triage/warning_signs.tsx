import {
  completeAndProceedToNextStep,
  completedProcedure,
  createProcedureIfNotAlreadyCompleted,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import { postHandler } from '../../../../../../../../backend/postHandler.ts'
import WarningSigns from '../../../../../../../../islands/WarningSigns.tsx'
import {
  patient_findings,
} from '../../../../../../../../db/models/patient_findings.ts'
import {
  filter,
  forEach,
  pMap,
} from '../../../../../../../../util/inParallel.ts'
import {
  KEYED_WARNING_SIGNS,
  WARNING_SIGNS,
} from '../../../../../../../../shared/warning_signs.ts'
import { satisfyingSExpression } from '../../../../../../../../db/models/s_expression.ts'
import compact from '../../../../../../../../util/compact.ts'
import { promiseProps } from '../../../../../../../../util/promiseProps.ts'

import { assert } from 'std/assert/assert.ts'
import { patient_triage } from '../../../../../../../../db/models/patient_triage.ts'
import {
  WarningSign,
  WarningSignWithMaybeRecord,
} from '../../../../../../../../types.ts'
import { parseExpressionExpectingAtom } from '../../../../../../../../shared/s_expression.ts'
import { markEnteredInError } from '../../../../../../../../db/models/patient_records_base.ts'
import hrefFromCtx from '../../../../../../../../util/hrefFromCtx.ts'
import { asNormalFormSExpression } from '../../../../../../../../shared/patient_records.ts'
import keys from '../../../../../../../../util/keys.ts'
import partition from '../../../../../../../../util/partition.ts'
import { SearchResult } from '../../../../../../../../db/models/_base.ts'
import { ORDERED_PRIORITIES } from '../../../../../../../../shared/priorities.ts'
import values from '../../../../../../../../util/values.ts'
import { events } from '../../../../../../../../db/models/events.ts'
import { NO_QUALIFIER } from '../../../../../../../../shared/snomed_concepts.ts'
import { Lang } from '../../../../../../../../shared/s_expression_schemas.ts'
import { assertOr400 } from '../../../../../../../../util/assertOr.ts'

export const TriageWarningSignSchema = z.object({
  s_expression: z.string().transform((
    value,
  ) => parseExpressionExpectingAtom(value, 'finding')),
  existence: z.enum(['Yes', 'No']).optional().transform((existence) =>
    existence || 'No'
  ),
  warning_sign_key: z.enum(keys(WARNING_SIGNS)).optional(),
  priority_level: z.enum(ORDERED_PRIORITIES),
  existing_record: z.object({
    id: z.string(),
    modified: z.boolean().optional(),
  }).optional(),
}).strict()

export const TriageWarningSignsSchema = z.object({
  warning_signs: z.record(
    z.string(),
    TriageWarningSignSchema,
  ).optional().default({}).transform(values),
}).strict()

export const handler = postHandler(
  TriageWarningSignsSchema,
  async (ctx: OpenEncounterWorkflowContext, form_values) => {
    const {
      trx,
      patient_id,
      employment_id,
      patient_encounter_id,
      patient_encounter_employee_id,
    } = ctx.state

    const { procedure_id } = await createProcedureIfNotAlreadyCompleted(ctx)
    assert(procedure_id)

    const { response, inserted_signs, previously_reported } =
      await promiseProps({
        inserted_signs: insertSigns(),
        response: completeAndProceedToNextStep(ctx),
        mark_modified_as_invalid: markRecordsInvalid(),
        previously_reported: getAllFindingsReportedPreviouslyOnThisPage(ctx),
      })

    for (const previous_finding of previously_reported) {
      const just_submitted = form_values.warning_signs.find((submitted) =>
        submitted.existing_record?.id === previous_finding.record_id
      )
      assertOr400(
        just_submitted,
        `It is expected that the frontend resubmit previously submitted records. Missing: ${previous_finding.record_id}`,
      )
      const was_modified =
        just_submitted.existence !== previous_finding.existence
      assertOr400(
        just_submitted.existing_record?.modified === was_modified,
        `It is expected that the frontend keep track of whether the previously submitted record was modified. Detected a mismatch for ${previous_finding.record_id} which had existence: ${previous_finding.existence}, but just_submitted.existence: ${just_submitted?.existence}`,
      )
    }

    await dispatchEvent(inserted_signs)

    return response

    function insertSigns() {
      return pMap(
        form_values.warning_signs,
        async (sign) => {
          if (sign.existing_record && !sign.existing_record.modified) {
            return
          }

          const finding: Lang['finding'] = sign.existence === 'Yes'
            ? sign.s_expression
            : {
              ...sign.s_expression,
              value_snomed_concept: {
                atom: 'snomed_concept',
                type: 'snomed_concept_name_and_category',
                ...NO_QUALIFIER,
              },
            }

          const finding_insert = await patient_findings
            .insertOneNested(
              trx,
              {
                finding,
                patient_id,
                procedure_id,
                patient_encounter_id,
                patient_encounter_employee_id,
              },
            )
          assert(finding_insert.success)
          assert(finding_insert.inserted_new)

          if (sign.existence === 'Yes') {
            await patient_triage.insertLevel(
              trx,
              {
                patient_id,
                patient_encounter_id,
                procedure_id,
                triage_level: sign.priority_level,
                by_system: true,
                evaluates_record_id: finding_insert.finding_id,
              },
            )
          }

          return {
            id: finding_insert.finding_id,
            existence: sign.existence,
          }
        },
      ).then(compact)
    }

    function dispatchEvent(
      findings: { id: string; existence: 'Yes' | 'No' }[],
    ) {
      return events.insert(trx, {
        type: 'ProcedureCompleted',
        data: {
          findings,
          patient_id,
          procedure_id,
          patient_encounter_id,
        },
      })
    }

    function markRecordsInvalid() {
      return forEach(
        form_values.warning_signs,
        async (sign) => {
          if (!sign.existing_record?.modified) return
          await markEnteredInError(
            trx,
            {
              patient_id,
              procedure_id,
              employment_id,
              patient_encounter_id,
              altered_record_id: sign.existing_record.id,
            },
          )
        },
      )
    }
  },
)

function getAllFindingsReportedPreviouslyOnThisPage(
  ctx: OpenEncounterWorkflowContext,
) {
  const { trx, patient_id, patient_encounter_id } = ctx.state
  const completed_procedure = completedProcedure(ctx)
  if (!completed_procedure) return Promise.resolve([])
  return patient_findings.findAll(trx, {
    patient_id,
    patient_encounter_id,
    procedure_id: completed_procedure.procedure_id,
    include_negative: true,
  })
}

async function getWarningSignsForPatient(
  { state: { trx, patient_id } }: OpenEncounterWorkflowContext,
): Promise<WarningSign[]> {
  const [having_prompt_when, no_prompt_when] = partition(
    KEYED_WARNING_SIGNS,
    (sign) => !!sign.prompt_when_s_expression,
  )
  const satisfying_prompt_when = await filter(having_prompt_when, promptWhen)
  return [...no_prompt_when, ...satisfying_prompt_when]

  async function promptWhen({ prompt_when_s_expression }: WarningSign) {
    assert(prompt_when_s_expression)
    const { satisfies } = await satisfyingSExpression(trx, {
      patient_id,
      s_expression: prompt_when_s_expression,
    })
    return satisfies
  }
}

function* asCheckedWarningSigns(
  findings: SearchResult<typeof patient_findings>[],
  warning_signs_for_patient: WarningSign[],
): Generator<WarningSignWithMaybeRecord> {
  const findings_set = new Set(findings.map((finding) => {
    // We don't use the value when calculating the normal form
    // of the s_expression here so that negative findings match.
    // That is if a previous submission found no chest pain,
    // then that's the existing record for that sign.
    const normal_form_s_expression = asNormalFormSExpression({
      ...finding,
      value: null,
    })

    return { ...finding, normal_form_s_expression }
  }))

  // Loop over the signs looking for findings that have identical
  // s_expressions, removing them as we go. Any that are left
  // over we send as well (these were the result of search)
  matching_signs: for (const sign of warning_signs_for_patient) {
    for (const finding of findings_set) {
      const same_idea =
        finding.normal_form_s_expression === sign.clinical_finding_s_expression

      if (same_idea) {
        findings_set.delete(finding)
        yield {
          ...sign,
          existing_record: {
            id: finding.record_id,
            existence: finding.existence,
          },
        }
        continue matching_signs
      }
    }

    yield sign
  }

  for (const finding of findings_set) {
    yield {
      sats_priority: finding.priority || 'Non-urgent',
      clinical_finding_s_expression: finding.normal_form_s_expression,
      sats_primary_name: finding.specific_snomed_concept.name,
      sats_secondary_text: finding.specific_snomed_concept.category,
      existing_record: {
        id: finding.record_id,
        existence: finding.existence,
      },
    }
  }
}

export async function TriageWarningSignsPage(
  ctx: OpenEncounterWorkflowContext,
) {
  const {
    all_findings_reported_previously_on_this_page,
    warning_signs_for_patient,
  } = await promiseProps({
    all_findings_reported_previously_on_this_page:
      getAllFindingsReportedPreviouslyOnThisPage(ctx),
    warning_signs_for_patient: getWarningSignsForPatient(ctx),
  })

  return (
    <WarningSigns
      search_route={hrefFromCtx(ctx, (url) => {
        url.pathname = url.pathname.replace(
          '/triage/warning_signs',
          '/snomed-warning-signs',
        )
      })}
      warning_signs={Array.from(asCheckedWarningSigns(
        all_findings_reported_previously_on_this_page,
        warning_signs_for_patient,
      ))}
    />
  )
}

export default OpenEncounterWorkflowPage(TriageWarningSignsPage)
