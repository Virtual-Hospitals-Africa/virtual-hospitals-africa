import { ComponentChildren } from 'preact'
import type { BillingClaim } from '../../shared/consultation-tutorial/billing.ts'
import { BillingLineItemRow } from './BillingLineItemRow.tsx'
import { ClaimStatusBadge } from './ClaimStatusBadge.tsx'

export function BillingPanel({
  claim,
  submit_button,
}: {
  claim: BillingClaim
  submit_button?: ComponentChildren
}) {
  return (
    <div data-tutorial='billing-panel' className='max-w-3xl mx-auto'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-xl font-semibold text-gray-900'>Billing Summary</h2>
        <ClaimStatusBadge status={claim.status} />
      </div>

      {/* Insurance Info */}
      <div className='bg-blue-50 rounded-lg p-4 mb-6'>
        <div className='grid grid-cols-3 gap-4 text-sm'>
          <div>
            <div className='text-blue-600 font-medium'>Insurance Provider</div>
            <div className='text-gray-900'>{claim.insurance_provider}</div>
          </div>
          <div>
            <div className='text-blue-600 font-medium'>Plan</div>
            <div className='text-gray-900'>{claim.plan_name}</div>
          </div>
          <div>
            <div className='text-blue-600 font-medium'>Membership No.</div>
            <div className='text-gray-900 font-mono'>{claim.membership_number}</div>
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div data-tutorial='billing-line-items' className='bg-white rounded-lg border border-gray-200 mb-6'>
        <table className='w-full'>
          <thead>
            <tr className='border-b border-gray-200 bg-gray-50'>
              <th className='py-2.5 pr-3 pl-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Procedure</th>
              <th className='py-2.5 px-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>Qty</th>
              <th className='py-2.5 px-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>Fee</th>
              <th className='py-2.5 px-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>Co-pay</th>
              <th className='py-2.5 pl-3 pr-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>Insurer</th>
            </tr>
          </thead>
          <tbody className='px-4'>
            {claim.line_items.map((item) => <BillingLineItemRow key={item.id} item={item} />)}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className='bg-gray-50 rounded-lg p-4 space-y-2'>
        <div className='flex justify-between text-sm text-gray-600'>
          <span>Subtotal</span>
          <span data-tutorial='billing-total'>R{claim.subtotal_zar.toFixed(2)}</span>
        </div>
        <div data-tutorial='billing-copayment' className='flex justify-between text-sm'>
          <span className='text-amber-700 font-medium'>Patient Co-payment</span>
          <span className='text-amber-700 font-medium'>R{claim.total_co_payment_zar.toFixed(2)}</span>
        </div>
        <div className='border-t border-gray-300 pt-2 mt-2' />
        <div data-tutorial='billing-insurer-liable' className='flex justify-between text-base font-semibold text-gray-900'>
          <span>Insurer Liable</span>
          <span>R{claim.total_insurer_liable_zar.toFixed(2)}</span>
        </div>
      </div>

      {/* Submit Button */}
      {submit_button && (
        <div className='mt-6 flex justify-end'>
          {submit_button}
        </div>
      )}
    </div>
  )
}
