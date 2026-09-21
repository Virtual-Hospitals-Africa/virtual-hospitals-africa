export type ClaimStatus = 'draft' | 'ready_for_review' | 'submitted' | 'rejected' | 'accepted' | 'paid'
export type BillingCategory = 'consultation' | 'diagnostic' | 'procedure' | 'medication' | 'consumable'

export type BillingLineItem = {
  id: string
  icd10_code: string | null
  description: string
  category: BillingCategory
  quantity: number
  unit_fee_zar: number
  total_fee_zar: number
  co_payment_zar: number
  insurer_liable_zar: number
  requires_pre_auth: boolean
}

export type BillingClaim = {
  id: string
  patient_name: string
  encounter_date: string
  insurance_provider: string
  plan_name: string
  membership_number: string
  status: ClaimStatus
  line_items: BillingLineItem[]
  subtotal_zar: number
  total_co_payment_zar: number
  total_insurer_liable_zar: number
}

export const CLAIM_STATUS_LABELS: Record<ClaimStatus, string> = {
  draft: 'Draft',
  ready_for_review: 'Ready for Review',
  submitted: 'Submitted',
  rejected: 'Rejected',
  accepted: 'Accepted',
  paid: 'Paid',
}

export const CLAIM_STATUS_COLORS: Record<ClaimStatus, { bg: string; text: string }> = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-700' },
  ready_for_review: { bg: 'bg-amber-100', text: 'text-amber-700' },
  submitted: { bg: 'bg-blue-100', text: 'text-blue-700' },
  rejected: { bg: 'bg-red-100', text: 'text-red-700' },
  accepted: { bg: 'bg-green-100', text: 'text-green-700' },
  paid: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
}
