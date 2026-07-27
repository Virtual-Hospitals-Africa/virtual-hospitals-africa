export function DiagnosesStep() {
  return (
    <div data-tutorial='diagnosis-panel' className='max-w-2xl mx-auto space-y-6'>
      <h2 className='text-lg font-semibold text-gray-900'>Diagnosis</h2>

      <div data-tutorial='diagnosis-hyperparathyroidism' className='bg-white rounded-lg border-2 border-indigo-200 p-5'>
        <div className='flex items-start gap-4'>
          <div className='w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0'>
            <svg className='w-5 h-5 text-indigo-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                stroke-linecap='round'
                stroke-linejoin='round'
                stroke-width={2}
                d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
              />
            </svg>
          </div>
          <div className='flex-1'>
            <div className='text-lg font-semibold text-gray-900'>Primary hyperparathyroidism</div>
            <div className='text-sm text-gray-500 mt-1'>
              <span className='font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded mr-2'>SNOMED: 36348003</span>
              Probable diagnosis
            </div>
            <div className='mt-3 text-sm text-gray-600'>
              <p className='font-medium text-gray-700 mb-1'>Supporting evidence:</p>
              <ul className='list-disc list-inside space-y-1 text-gray-500'>
                <li>Elevated serum calcium (3.1 mmol/L, reference 2.2-2.6)</li>
                <li>Elevated parathyroid hormone (12.5 pmol/L, reference 1.6-6.9)</li>
                <li>Low serum phosphate (0.7 mmol/L, reference 0.8-1.5)</li>
                <li>Symptoms: bone pain, fatigue, polyuria, proximal muscle weakness</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
