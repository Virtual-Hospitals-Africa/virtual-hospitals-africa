import { EnteredFinding, FindingToCheckFor, WarningSignWithMaybeRecord } from '../../types.ts'
import { parseSExpressionAsInsertableFinding } from '../../shared/parseSExpressionAsInsertableFinding.ts'
import { findingFullDisplay } from '../../shared/patient_records.ts'
import { inverseSExpression } from '../../shared/s_expression_inverse.ts'
import { NoneOfTheAboveFindingsPostBody } from '../../shared/none_of_the_above_findings_post.ts'
import { CheckedWarningSign } from './shared.ts'

/*
  Follow ups accumulate across saves within a visit to the warning signs page,
  grouped by the sign that caused them, mirroring how the additional tasks page
  groups check_for tasks by their due_to.

  `key` is the sign's uniqueIdentifier rather than the finding's s_expression, as
  editing a sign (adding a finding site, say) changes its s_expression but should
  replace that sign's group rather than add another.
*/
export type FollowUpGroup = {
  key: string
  due_to: EnteredFinding
  findings_to_check_for: FindingToCheckFor[]
  saving?: boolean
}

export function accumulateFollowUps(
  groups: FollowUpGroup[],
  { key, due_to, findings_to_check_for }: {
    key: string
    due_to: EnteredFinding | null
    findings_to_check_for: FindingToCheckFor[]
  },
): FollowUpGroup[] {
  const without_sign = groups.filter((group) => group.key !== key)
  if (!due_to || !findings_to_check_for.length) return without_sign
  return [...without_sign, { key, due_to, findings_to_check_for }]
}

export function followUpDisplay(s_expression: string): string {
  return findingFullDisplay(parseSExpressionAsInsertableFinding(s_expression))
}

/*
  A follow up becomes a sign so that checking it behaves exactly like checking a warning
  sign: it joins the checked signs, opens the finding modal, is posted on save and is
  submitted with the page. It has no priority of its own.
*/
export function asFollowUpSign(finding: FindingToCheckFor): WarningSignWithMaybeRecord {
  const display = followUpDisplay(finding.s_expression)
  const { existing_record } = finding
  return {
    category: 'Follow up',
    name: display,
    description: null,
    clinical_finding_s_expression: finding.s_expression,
    predefined_attributes: finding.predefined_attributes,
    relevant_qualifiers: finding.relevant_qualifiers,
    onset_required: finding.onset_required,
    existing_record: existing_record
      ? {
        id: existing_record.id,
        existence: existing_record.existence,
        augmented: existing_record.existence === 'Yes' && existing_record.s_expression !== finding.s_expression
          ? { s_expression: existing_record.s_expression, display: followUpDisplay(existing_record.s_expression) }
          : undefined,
      }
      : undefined,
  }
}

/*
  A follow up already recorded as Yes in this encounter starts out checked, entered as it
  was recorded so that opening it shows any qualifiers added at the time.
*/
export function asCheckedFollowUpSign(finding: FindingToCheckFor): CheckedWarningSign | null {
  const { existing_record } = finding
  if (existing_record?.existence !== 'Yes') return null
  const sign = asFollowUpSign(finding)
  return {
    ...sign,
    entered: sign.existing_record?.augmented || { s_expression: finding.s_expression, display: sign.name },
    saving: false,
  }
}

function normalized(s_expression: string): string {
  return inverseSExpression(parseSExpressionAsInsertableFinding(s_expression))
}

/*
  The checked sign standing for a follow up, if any. A follow up may coincide with a warning
  sign already checked in the tables (the insect bite that prompted checking for anaphylaxis
  is itself listed), so match on what was entered rather than on the sign's identifier.
*/
export function findCheckedFollowUp(
  checked_signs: CheckedWarningSign[],
  finding: FindingToCheckFor,
): CheckedWarningSign | undefined {
  const target = normalized(finding.s_expression)
  return checked_signs.find((sign) =>
    (finding.existing_record && sign.existing_record?.id === finding.existing_record.id) ||
    normalized(sign.entered.s_expression) === target
  )
}

export function isUnanswered(checked_signs: CheckedWarningSign[], finding: FindingToCheckFor): boolean {
  return !finding.existing_record && !findCheckedFollowUp(checked_signs, finding)
}

/*
  One request per task with follow ups still unanswered, listing the positive findings the
  backend will record as negatives. A finding checked for by two tasks is sent with both.
  The backend records nothing for a finding that has since gained a record, so posting the
  requests one after another never records the same finding twice.
*/
export function noneOfTheAboveRequests(
  groups: FollowUpGroup[],
  checked_signs: CheckedWarningSign[],
): NoneOfTheAboveFindingsPostBody[] {
  const by_task = new Map<string, Set<string>>()
  for (const group of groups) {
    for (const finding of group.findings_to_check_for) {
      if (!isUnanswered(checked_signs, finding)) continue
      for (const task_id of finding.task_ids) {
        const s_expressions = by_task.get(task_id) || new Set<string>()
        s_expressions.add(finding.s_expression)
        by_task.set(task_id, s_expressions)
      }
    }
  }
  return [...by_task.entries()].map(([task_description, s_expressions]) => ({
    task_description,
    s_expressions: `(${[...s_expressions].join(' ')})`,
  }))
}
