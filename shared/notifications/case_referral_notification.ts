export function caseReferralNotificationDescription({
  originator_display_name,
  priority_name,
  presenting_issue,
}: {
  originator_display_name: string
  priority_name: string
  presenting_issue?: string | null
}): string {
  const issue = presenting_issue?.trim()
  const suffix = issue ? `: ${issue.toLowerCase()}` : ''
  return `${originator_display_name} referred a ${priority_name} priority case to you${suffix}`
}
