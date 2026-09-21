import { useSignal } from '@preact/signals'
import { BillingPanel } from '../../../components/billing/BillingPanel.tsx'
import { CONSULTATION_BILLING_CLAIM } from '../../../shared/consultation-tutorial/mock-data.ts'
import type { ClaimStatus } from '../../../shared/consultation-tutorial/billing.ts'

export function BillingStep() {
  const status = useSignal<ClaimStatus>(CONSULTATION_BILLING_CLAIM.status)

  const handle_submit = () => {
    status.value = 'submitted'
  }

  const claim = { ...CONSULTATION_BILLING_CLAIM, status: status.value }

  return (
    <div className='py-4'>
      <BillingPanel
        claim={claim}
        submit_button={status.value === 'ready_for_review'
          ? (
            <button
              type='button'
              data-tutorial='billing-submit'
              onClick={handle_submit}
              className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            >
              Submit to Insurer
            </button>
          )
          : (
            <div className='inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-md'>
              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fill-rule='evenodd'
                  d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                  clip-rule='evenodd'
                />
              </svg>
              Claim submitted to Discovery Health
            </div>
          )}
      />
    </div>
  )
}
