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

const WarningSignSchema = z.object({
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
    modified: z.boolean(),
  }).optional(),
}).strict()

const WarningSignsSchema = z.object({
  warning_signs: z.record(
    z.string(),
    WarningSignSchema,
  ).transform(values),
}).strict()

export const handler = postHandler(
  WarningSignsSchema,
  async (ctx: OpenEncounterWorkflowContext, form_values) => {
    const {
      trx,
      patient_id,
      employment_id,
      patient_encounter_id,
      patient_encounter_employee_id,
    } = ctx.state

    // TODO: match against what we already have and fail the transaction if the client was lying
    // const warning_signs_previously_entered = groupByUniq(
    //   await getAllClinicalFindingsAsWarningSignsForThisEncounter(ctx),
    //   (sign) => sign.key,
    // )

    const { procedure_id } = await createProcedureIfNotAlreadyCompleted(ctx)
    assert(procedure_id)

    const { response } = await promiseProps({
      response: completeAndProceedToNextStep(ctx),
      mark_modified_as_invalid: markRecordsInvalid(),
      inserted_signs: insertSigns().then(dispatchEvent),
    })

    return response

    function insertSigns() {
      return pMap(
        form_values.warning_signs,
        async (sign) => {
          // TODO handle negative findings
          if (sign.existence === 'No') {
            return
          }
          if (sign.existing_record && !sign.existing_record.modified) {
            return
          }

          // insertOneIfNotAlreadyExistsForThisEncounter
          const finding_insert = await patient_findings
            .insertOneNested(
              trx,
              {
                patient_id,
                procedure_id,
                patient_encounter_id,
                patient_encounter_employee_id,
                finding: sign.s_expression,
              },
            )
          assert(finding_insert.success)
          if (!finding_insert.inserted_new) return

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

          return finding_insert.finding_id
        },
      ).then(compact)
    }

    function dispatchEvent(finding_ids: string[]) {
      return events.insert(trx, {
        type: 'ProcedureCompleted',
        data: {
          patient_id,
          patient_encounter_id,
          procedure_id,
          finding_ids,
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
  const findings_set = new Set(findings.map((finding) => ({
    ...finding,
    normal_form_s_expression: asNormalFormSExpression(finding),
  })))

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
            existence: 'Yes' as const, // TODO handle negative records
          },
        }
        continue matching_signs
      }
    }

    yield {
      ...sign,
      existing_record: null,
    }
  }

  for (const finding of findings_set) {
    yield {
      key: null,
      sats_priority: finding.priority || 'Non-urgent',
      clinical_finding_s_expression: finding.normal_form_s_expression,
      sats_primary_name: finding.specific_snomed_concept.name,
      sats_secondary_text: finding.specific_snomed_concept.category,
      existing_record: {
        id: finding.record_id,
        existence: 'Yes' as const, // TODO handle negative records
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
