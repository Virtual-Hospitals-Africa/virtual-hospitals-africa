import { CONSULTATION_SPEAKERS } from '../../../shared/consultation-tutorial/types.ts'

export function ReferralStep() {
  const specialist = CONSULTATION_SPEAKERS.endocrinologist

  return (
    <div data-tutorial='referral-panel' className='max-w-2xl mx-auto space-y-6'>
      <h2 className='text-lg font-semibold text-gray-900'>Referral</h2>

      {/* Specialist Selection */}
      <div data-tutorial='referral-specialist' className='bg-white rounded-lg border border-gray-200 p-4'>
        <h3 className='text-sm font-medium text-gray-500 uppercase tracking-wider mb-3'>Referring to</h3>
        <div className='flex items-center gap-4'>
          <img
            src={specialist.avatar_src}
            alt={specialist.name}
            className='w-12 h-12 rounded-full'
            style={{ imageRendering: 'pixelated' }}
          />
          <div className='flex-1'>
            <div className='font-medium text-gray-900'>{specialist.name}</div>
            <div className='text-sm text-gray-500'>{specialist.role}</div>
          </div>
          <span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700'>
            External Specialist
          </span>
        </div>
      </div>

      {/* Referral Details */}
      <div className='bg-white rounded-lg border border-gray-200 p-4 space-y-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Referral Type</label>
          <div className='px-3 py-2 bg-gray-50 rounded border border-gray-200 text-sm text-gray-900'>
            Specialist Consultation
          </div>
        </div>
        <div data-tutorial='referral-reason'>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Reason for Referral</label>
          <div className='px-3 py-2 bg-gray-50 rounded border border-gray-200 text-sm text-gray-900'>
            Probable primary hyperparathyroidism \u2014 requires specialist management. Elevated calcium (3.1 mmol/L) and PTH (12.5 pmol/L) with proximal muscle
            weakness and bone pain.
          </div>
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Urgency</label>
          <div className='px-3 py-2 bg-gray-50 rounded border border-gray-200 text-sm text-gray-900'>
            Semi-urgent (within 2 weeks)
          </div>
        </div>
      </div>
    </div>
  )
}
