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
import entries from '../../../../../../../../util/entries.ts'
import {
  IntermediateFinding,
  patient_findings,
} from '../../../../../../../../db/models/patient_findings.ts'
import { filter, forEach } from '../../../../../../../../util/inParallel.ts'
import {
  findingQueryExpression,
  KEYED_WARNING_SIGNS,
  WARNING_SIGNS,
} from '../../../../../../../../shared/warning_signs.ts'
import { satisfyingSExpression } from '../../../../../../../../db/models/s_expression.ts'
import compact from '../../../../../../../../util/compact.ts'
import { promiseProps } from '../../../../../../../../util/promiseProps.ts'

import { assert } from 'std/assert/assert.ts'
import isKeyOf from '../../../../../../../../util/isKeyOf.ts'
import { patient_triage } from '../../../../../../../../db/models/patient_triage.ts'
import {
  WarningSignWithMaybeRecord,
  WarningSign,
  Priority,
  RenderedFindingRelativeToHealthWorker,
  WarningSign,
  WarningSignPresence,
} from '../../../../../../../../types.ts'
import { groupByUniq } from '../../../../../../../../util/groupBy.ts'
import { exists } from '../../../../../../../../util/exists.ts'
import { parseExpressionExpectingAtom } from '../../../../../../../../shared/s_expression.ts'
import { assertArrayEmpty } from '../../../../../../../../util/arraySize.ts'
import first from '../../../../../../../../util/first.ts'
import { markEnteredInError } from '../../../../../../../../db/models/patient_records_base.ts'
import {
  CHIEF_COMPLAINT,
  CLINICAL_FINDING,
  SELF_REPORTED_QUALIFIER,
} from '../../../../../../../../shared/snomed_concepts.ts'
import hrefFromCtx from '../../../../../../../../util/hrefFromCtx.ts'
import { snomed_model } from '../../../../../../../../db/models/snomed.ts'
import { asNormalFormSExpression } from '../../../../../../../../shared/patient_records.ts'
import { additional_tasks } from '../../../../../../../../db/models/additional_tasks.ts'
import keys from '../../../../../../../../util/keys.ts'
import partition from '../../../../../../../../util/partition.ts'
import { SearchResult } from '../../../../../../../../db/models/_base.ts'

const WarningSignSchema = z.object({
  s_expression: z.string().transform((
    value,
  ) => parseExpressionExpectingAtom(value, 'finding')),
  existence: z.enum(['Yes', 'No']).optional().transform((existence) =>
    existence || 'No'
  ),
  warning_sign_key: z.enum(keys(WARNING_SIGNS)).optional(),
  existing_record: z.object({
    id: z.string(),
    modified: z.boolean(),
  }).optional(),
}).strict()

const WarningSignsSchema = z.object({
  warning_signs: z.record(
    z.string(),
    WarningSignSchema,
  ),
}).strict()

export const handler = postHandler(
  WarningSignsSchema,
  async (ctx: OpenEncounterWorkflowContext, form_values) => {
    const {
      trx,
      patient_id,
      employment_id,
      patient_encounter_id,
      encounter_employee_presence,
    } = ctx.state
    const warning_signs_previously_entered = groupByUniq(
      await getAllClinicalFindingsAsWarningSignsForThisEncounter(ctx),
      (sign) => sign.key,
    )

    const { procedure_id } = await createProcedureIfNotAlreadyCompleted(ctx)
    assert(procedure_id)

    await forEach(
      form_values.warning_signs,
      async ({ key, finding }) => {
        warning_signs_previously_entered.delete(key)

        const finding_insert = await patient_findings
          .insertOneIfNotAlreadyExistsForThisEncounter(
            trx,
            {
              patient_id,
              patient_encounter_id,
              patient_encounter_employee_id: encounter_employee_presence
                .patient_encounter_employee_id,
              procedure_id,
              finding,
            },
          )
        assert(finding_insert.success)
        if (!finding_insert.inserted_new) return

        const triage_level = isKeyOf(key, WARNING_SIGNS)
          ? WARNING_SIGNS[key].sats_priority
          : await getPriorityByRecordId()

        return patient_triage.insertLevel(
          trx,
          {
            patient_id,
            patient_encounter_id,
            procedure_id,
            triage_level,
            by_system: true,
            evaluates_record_id: finding_insert.finding_id,
          },
        )

        async function getPriorityByRecordId(): Promise<Priority> {
          const { priority } = await trx.selectFrom('patient_records')
            .where('patient_records.id', '=', finding_insert.finding_id)
            .select((eb) =>
              snomed_model.getPriorityOfSnomedConcept(
                eb,
                'patient_records.specific_snomed_concept_id',
                patient_id,
                trx,
              )
            )
            .executeTakeFirstOrThrow()

          return priority?.name || 'Non-urgent'
        }
      },
    )

    const now_invalid = Array.from(warning_signs_previously_entered.values())
      .filter((record) => record.satisfied_by_record_id)

    for (const record of now_invalid) {
      await markEnteredInError(
        trx,
        {
          patient_id,
          procedure_id,
          employment_id,
          patient_encounter_id,
          altered_record_id: exists(record.satisfied_by_record_id),
        },
      )
    }

    await additional_tasks.insertTasksIfNotAlreadyIdentified(
      trx,
      { patient_id, patient_encounter_id },
    )

    return completeAndProceedToNextStep(ctx)
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
  const findings_set = new Set(findings.map(finding => ({
    ...finding,
    normal_form_s_expression: asNormalFormSExpression(finding)
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
            existence: 'Yes' as const // TODO handle negative records
          }
        }
        continue matching_signs
      }
    }

    yield {
      ...sign,
      existing_record: null
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
        existence: 'Yes' as const // TODO handle negative records
      }
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
