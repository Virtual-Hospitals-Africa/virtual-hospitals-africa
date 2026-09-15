import { EnteredFinding, FindingToCheckFor } from '../../types.ts'

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
