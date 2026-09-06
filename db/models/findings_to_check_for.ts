import type { AgeDetermination, FindingToCheckFor, TrxOrDbOrQueryCreator } from '../../types.ts'
import type { InsertableFindingBase, Lang } from '../../shared/s_expression_schemas.ts'
import { due_to } from './due_to.ts'
import { rules } from './rules.ts'
import { existingFindingsMatching, isCheckFor } from './additional_tasks.ts'
import { getTaskById } from '../../shared/tasks.ts'
import { inverseSExpression } from '../../shared/s_expression_inverse.ts'
import { asNormalFormSExpression, formatRecord } from '../../shared/patient_records.ts'
import { arrayIsEmpty } from '../../util/arraySize.ts'
import sortBy from '../../util/sortBy.ts'
import matching from '../../util/matching.ts'

/*
  A dry run of the task pipeline: which check_for findings would a health worker be
  prompted for if `finding` were recorded for this patient in this encounter?

  Follows the same three steps that run when a finding is actually inserted
  (due_to tagging → rule evaluation → task materialisation) but reads only:
    1. due_to.forHypotheticalFinding matches the node against the due_to tables
    2. rules.getApplicableForHypotheticalRecord evaluates rules with the node as
       in-memory evidence alongside the patient's real evidence
    3. the check_for tasks of the applicable rules are flattened to findings, each
       annotated with the record already made for it in this encounter, if any
*/
export const findings_to_check_for = {
  async forHypotheticalFinding(
    trx: TrxOrDbOrQueryCreator,
    { patient_id, patient_encounter_id, patient_age_determination, finding }: {
      patient_id: string
      patient_encounter_id: string
      patient_age_determination: AgeDetermination
      finding: InsertableFindingBase
    },
  ): Promise<FindingToCheckFor[]> {
    if (finding.existence !== 'Yes') return []

    const matched_due_tos = await due_to.forHypotheticalFinding(trx, { patient_age_determination, finding })
    if (arrayIsEmpty(matched_due_tos)) return []

    const applicable_rules = await rules.getApplicableForHypotheticalRecord(trx, {
      patient_id,
      patient_encounter_id,
      patient_age_determination,
      matched_due_tos,
      type: 'task',
    })

    const nodes = new Map<string, Lang['finding']>()
    for (const rule of sortBy(applicable_rules, 'description')) {
      const { to_be_done } = getTaskById(rule.id)
      if (!isCheckFor(to_be_done)) continue
      for (const node of to_be_done.value) {
        nodes.set(inverseSExpression(node), node)
      }
    }
    if (!nodes.size) return []

    const existing_findings = await existingFindingsMatching(trx, { patient_id, patient_encounter_id, nodes })

    return [...nodes.keys()].map((s_expression) => {
      const existing = existing_findings.find(matching({ s_expression }))
      return {
        s_expression,
        existing_record: existing
          ? {
            s_expression: asNormalFormSExpression(formatRecord(existing)),
            existence: existing.existence,
          }
          : null,
      }
    })
  },
}
