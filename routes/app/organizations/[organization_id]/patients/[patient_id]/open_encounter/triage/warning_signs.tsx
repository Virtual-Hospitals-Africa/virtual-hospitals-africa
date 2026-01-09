import {
  completeAndProceedToNextStep,
  createProcedureIfNotAlreadyCompleted,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import { postHandler } from '../../../../../../../../backend/postHandler.ts'
import WarningSigns from '../../../../../../../../islands/WarningSigns.tsx'
import entries from '../../../../../../../../util/entries.ts'
import { patient_findings } from '../../../../../../../../db/models/patient_findings.ts'
import { forEach } from '../../../../../../../../util/inParallel.ts'
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
import { insertLevel } from '../../../../../../../../db/models/patient_triage.ts'
import {
  CheckedWarningSign,
  KeyedWarningSign,
  Priority,
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
import { getPriorityOfSnomedConcept } from '../../../../../../../../db/models/snomed.ts'
import { asNormalFormSExpression } from '../../../../../../../../shared/patient_records.ts'
import { insertTasksIfNotAlreadyIdentified } from '../../../../../../../../db/models/additional_tasks.ts'

const WarningSignsSchema = z.object({
  warning_signs: z.record(
    z.string(),
    z.string().transform((
      value,
    ) => parseExpressionExpectingAtom(value, 'finding')),
  ).default({}).transform((signs) =>
    entries(signs).map(([key, finding]) => ({
      key,
      finding,
    }))
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

        return insertLevel(
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
              getPriorityOfSnomedConcept(
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

    await insertTasksIfNotAlreadyIdentified(
      trx,
      { patient_id, patient_encounter_id },
    )

    return completeAndProceedToNextStep(ctx)
  },
)

async function getAllOtherClinicalFindingsFromThisEncounter(
  { state }: OpenEncounterWorkflowContext,
): Promise<CheckedWarningSign[]> {
  const { trx, patient_id, patient_encounter_id } = state
  const not_expressions = KEYED_WARNING_SIGNS.map((sign) =>
    `(not (exact ${sign.clinical_finding_s_expression}))`
  ).join(' ')

  const s_expression = `
    (and (or (finding ${CLINICAL_FINDING.lang})
             (finding ${CHIEF_COMPLAINT.id}))
         (not (finding (qualifier ${SELF_REPORTED_QUALIFIER.id})))
         ${not_expressions})
  `

  const other_clinical_findings = await patient_findings.findAll(trx, {
    patient_id,
    patient_encounter_id,
    s_expression,
  })

  return other_clinical_findings.map((finding) => {
    assertArrayEmpty(finding.attributes)

    const presence: WarningSignPresence = finding.record_id
      ? { satisfied_by_record_id: finding.record_id, checked: true }
      : { satisfied_by_record_id: null, checked: false }

    return {
      key: finding.specific_snomed_concept.name,
      clinical_finding_s_expression: asNormalFormSExpression(finding),
      sats_primary_name: finding.specific_snomed_concept.name,
      sats_secondary_text: finding.specific_snomed_concept.category,
      sats_priority: finding.priority || 'Non-urgent',
      ...presence,
    }
  })
}

function getWarningSignsFromThisEncounter(
  ctx: OpenEncounterWorkflowContext,
): Promise<CheckedWarningSign[]> {
  const {
    trx,
    patient_id,
    patient_encounter_id,
    previously_completed_procedures: { workflow_step_record_id },
  } = ctx.state

  function promptWhen({ prompt_when_s_expression }: KeyedWarningSign) {
    if (!prompt_when_s_expression) {
      return Promise.resolve({ satisfies: true })
    }
    return satisfyingSExpression(trx, {
      patient_id,
      s_expression: prompt_when_s_expression,
    })
  }

  function clinicalFinding(
    sign: KeyedWarningSign,
  ) {
    if (!workflow_step_record_id) {
      return Promise.resolve({ satisfies: false, record_ids: [] })
    }

    return satisfyingSExpression(trx, {
      patient_id,
      patient_encounter_id,
      s_expression: findingQueryExpression(sign),
      procedure_id: workflow_step_record_id,
    })
  }

  return Promise.all(
    KEYED_WARNING_SIGNS.map(
      async (sign): Promise<null | CheckedWarningSign> => {
        const { prompt_when, clinical_finding } = await promiseProps({
          prompt_when: promptWhen(sign),
          clinical_finding: clinicalFinding(sign),
        })

        if (!prompt_when.satisfies) {
          return null
        }

        const satisfied_by_record_id = first(clinical_finding.record_ids)
        if (satisfied_by_record_id) {
          return {
            ...sign,
            satisfied_by_record_id,
            checked: true,
          }
        }

        return {
          ...sign,
          satisfied_by_record_id: null,
          checked: false,
        }
      },
    ),
  ).then(compact)
}

async function getAllClinicalFindingsAsWarningSignsForThisEncounter(
  ctx: OpenEncounterWorkflowContext,
): Promise<CheckedWarningSign[]> {
  const [other, base] = await Promise.all([
    getAllOtherClinicalFindingsFromThisEncounter(ctx),
    getWarningSignsFromThisEncounter(ctx),
  ])
  return [...other, ...base]
}

export async function TriageWarningSignsPage(
  ctx: OpenEncounterWorkflowContext,
) {
  return (
    <WarningSigns
      search_route={hrefFromCtx(ctx, (url) => {
        url.pathname = url.pathname.replace(
          '/triage/warning_signs',
          '/snomed-warning-signs',
        )
      })}
      warning_signs={await getAllClinicalFindingsAsWarningSignsForThisEncounter(
        ctx,
      )}
    />
  )
}

export default OpenEncounterWorkflowPage(TriageWarningSignsPage)
