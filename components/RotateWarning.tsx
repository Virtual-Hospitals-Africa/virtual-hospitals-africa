/**
 * Overlay shown on mobile/tablet portrait to nudge user to rotate to landscape.
 * Hidden on desktop (lg+) and when device is in landscape orientation.
 */
export function RotateWarning() {
  return (
    <>
      <style>
        {`
          @keyframes rotate-nudge {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-15deg); }
            75% { transform: rotate(90deg); }
          }
        `}
      </style>
      <div
        id='rotate-warning'
        className='fixed inset-0 z-[9999] bg-indigo-900 flex flex-col items-center justify-center p-8 text-center landscape:hidden lg:hidden'
      >
        <div className='mb-6' style={{ animation: 'rotate-nudge 2s ease-in-out infinite' }}>
          <svg
            width='80'
            height='80'
            viewBox='0 0 24 24'
            fill='none'
            stroke='white'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <rect x='5' y='2' width='14' height='20' rx='2' ry='2' />
            <line x1='12' y1='18' x2='12' y2='18.01' />
          </svg>
        </div>
        <h2 className='text-white text-xl font-semibold mb-2'>Rotate Your Device</h2>
        <p className='text-indigo-200 text-sm max-w-xs'>
          For the best experience, please rotate your device to landscape mode.
        </p>
        <div className='mt-6 flex items-center gap-2 text-indigo-300 text-sm'>
          <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
            <path d='M1 4v6h6' />
            <path d='M3.51 15a9 9 0 1 0 2.13-9.36L1 10' />
          </svg>
          <span>Rotate to continue</span>
        </div>
      </div>
    </>
  )
}
