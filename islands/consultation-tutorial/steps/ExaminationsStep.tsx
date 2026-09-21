export function ExaminationsStep() {
  return (
    <div data-tutorial='exam-findings' className='max-w-2xl mx-auto space-y-6'>
      <h2 className='text-lg font-semibold text-gray-900'>Physical Examination</h2>

      <div className='bg-white rounded-lg border border-gray-200 divide-y divide-gray-100'>
        <div data-tutorial='exam-muscle-tenderness' className='p-4'>
          <div className='flex items-start gap-3'>
            <div className='mt-0.5 w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0'>
              <svg className='w-3 h-3 text-indigo-600' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fill-rule='evenodd'
                  d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                  clip-rule='evenodd'
                />
              </svg>
            </div>
            <div>
              <div className='font-medium text-gray-900'>Muscle tenderness</div>
              <div className='text-sm text-gray-500 mt-1'>Diffuse tenderness on palpation of proximal muscle groups, particularly quadriceps and deltoids</div>
            </div>
          </div>
        </div>

        <div data-tutorial='exam-proximal-weakness' className='p-4'>
          <div className='flex items-start gap-3'>
            <div className='mt-0.5 w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0'>
              <svg className='w-3 h-3 text-indigo-600' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fill-rule='evenodd'
                  d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                  clip-rule='evenodd'
                />
              </svg>
            </div>
            <div>
              <div className='font-medium text-gray-900'>Decreased proximal muscle strength</div>
              <div className='text-sm text-gray-500 mt-1'>
                Grade 4/5 power in proximal muscles bilaterally. Patient has difficulty rising from a seated position without arm support.
              </div>
            </div>
          </div>
        </div>

        <div className='p-4'>
          <div className='flex items-start gap-3'>
            <div className='mt-0.5 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0'>
              <svg className='w-3 h-3 text-gray-400' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fill-rule='evenodd'
                  d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                  clip-rule='evenodd'
                />
              </svg>
            </div>
            <div>
              <div className='font-medium text-gray-500'>No joint swelling or deformity</div>
              <div className='text-sm text-gray-400 mt-1'>Joints within normal limits on examination</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
