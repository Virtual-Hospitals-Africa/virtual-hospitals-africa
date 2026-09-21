import type { ClaimStatus } from '../../shared/consultation-tutorial/billing.ts'
import { CLAIM_STATUS_COLORS, CLAIM_STATUS_LABELS } from '../../shared/consultation-tutorial/billing.ts'

export function ClaimStatusBadge({ status }: { status: ClaimStatus }) {
  const colors = CLAIM_STATUS_COLORS[status]
  return (
    <span
      data-tutorial='billing-status'
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
    >
      {CLAIM_STATUS_LABELS[status]}
    </span>
  )
}
