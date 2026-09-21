export function DiagnosticTestsStep() {
  const results = [
    { label: 'Serum calcium', value: '3.1 mmol/L', reference: '2.2\u20132.6', status: 'high' as const, tutorial_attr: 'lab-calcium' },
    { label: 'Parathyroid hormone (PTH)', value: '12.5 pmol/L', reference: '1.6\u20136.9', status: 'high' as const, tutorial_attr: 'lab-pth' },
    { label: 'Serum phosphate', value: '0.7 mmol/L', reference: '0.8\u20131.5', status: 'low' as const, tutorial_attr: 'lab-phosphate' },
    { label: 'Vitamin D (25-OH)', value: '45 nmol/L', reference: '50\u2013125', status: 'normal' as const, tutorial_attr: null },
    { label: 'Serum creatinine', value: '85 \u00b5mol/L', reference: '44\u201397', status: 'normal' as const, tutorial_attr: null },
    { label: 'eGFR', value: '72 mL/min', reference: '>90', status: 'low' as const, tutorial_attr: null },
  ]

  const status_styles = {
    high: { bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100 text-red-700', label: 'HIGH' },
    low: { bg: 'bg-amber-50', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700', label: 'LOW' },
    normal: { bg: 'bg-white', text: 'text-gray-900', badge: '', label: '' },
  }

  return (
    <div data-tutorial='lab-results' className='max-w-2xl mx-auto space-y-6'>
      <h2 className='text-lg font-semibold text-gray-900'>Diagnostic Test Results</h2>

      <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
        <table className='w-full'>
          <thead>
            <tr className='bg-gray-50 border-b border-gray-200'>
              <th className='py-2.5 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Test</th>
              <th className='py-2.5 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>Result</th>
              <th className='py-2.5 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>Reference</th>
              <th className='py-2.5 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>Status</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-100'>
            {results.map((result) => {
              const style = status_styles[result.status]
              return (
                <tr
                  key={result.label}
                  className={style.bg}
                  {...(result.tutorial_attr ? { 'data-tutorial': result.tutorial_attr } : {})}
                >
                  <td className='py-3 px-4 text-sm font-medium text-gray-900'>{result.label}</td>
                  <td className={`py-3 px-4 text-sm text-right font-medium ${style.text}`}>{result.value}</td>
                  <td className='py-3 px-4 text-sm text-right text-gray-500'>{result.reference}</td>
                  <td className='py-3 px-4 text-center'>
                    {result.status !== 'normal' && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${style.badge}`}>
                        {style.label}
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
