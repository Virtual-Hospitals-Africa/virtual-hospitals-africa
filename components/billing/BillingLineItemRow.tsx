import type { BillingLineItem } from '../../shared/consultation-tutorial/billing.ts'

const CATEGORY_LABELS: Record<string, string> = {
  consultation: 'Consultation',
  diagnostic: 'Diagnostic',
  procedure: 'Procedure',
  medication: 'Medication',
  consumable: 'Consumable',
}

export function BillingLineItemRow({ item }: { item: BillingLineItem }) {
  const has_copay = item.co_payment_zar > 0
  return (
    <tr className='border-b border-gray-100 last:border-0'>
      <td className='py-2 pr-3'>
        <div className='text-sm font-medium text-gray-900'>{item.description}</div>
        <div className='text-xs text-gray-500'>
          {item.icd10_code && <span className='mr-2 font-mono'>{item.icd10_code}</span>}
          <span>{CATEGORY_LABELS[item.category] ?? item.category}</span>
        </div>
      </td>
      <td className='py-2 px-3 text-sm text-gray-600 text-center'>{item.quantity}</td>
      <td className='py-2 px-3 text-sm text-gray-600 text-right'>R{item.unit_fee_zar.toFixed(2)}</td>
      <td className='py-2 px-3 text-sm text-right'>
        {has_copay ? <span className='text-amber-700 font-medium'>R{item.co_payment_zar.toFixed(2)}</span> : <span className='text-gray-400'>--</span>}
      </td>
      <td className='py-2 pl-3 text-sm text-gray-900 text-right font-medium'>R{item.insurer_liable_zar.toFixed(2)}</td>
    </tr>
  )
}
