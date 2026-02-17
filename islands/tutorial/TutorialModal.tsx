// =============================================================================
// FILE: /islands/tutorial/TutorialModal.tsx
// Pixel-game style modal for tutorial notifications
// =============================================================================

type Props = {
  message: string
  button_text: string
  onAction: () => void
}

/**
 * Pixel-game style centered modal for tutorial.
 * Used for notifications like "Please bring the patient to room 102".
 */
export function TutorialModal({ message, button_text, onAction }: Props) {
  return (
    <>
      <div
        className='fixed inset-0 z-[70] bg-black/60'
        onClick={(e) => e.stopPropagation()}
      />
      <div
        className='fixed inset-0 z-[75] flex items-center justify-center p-4'
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className='relative bg-[#f0f0f0] w-full max-w-md p-6 md:p-8'
          style={{
            border: '4px solid #1a1a2e',
            boxShadow: '8px 8px 0px #1a1a2e',
          }}
        >
          <div
            className='absolute -top-4 md:-top-5 left-1/2 -translate-x-1/2 px-4 md:px-6 py-1 md:py-1.5 text-base md:text-xl font-bold text-white whitespace-nowrap'
            style={{
              backgroundColor: '#6366f1',
              border: '3px solid #1a1a2e',
              fontFamily: "'GeistPixel', monospace",
              fontWeight: 700,
            }}
          >
            Message
          </div>

          <div className='flex justify-center mb-4 mt-4'>
            <div
              className='w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-full'
              style={{
                backgroundColor: '#a5b4fc',
                border: '4px solid #1a1a2e',
              }}
            >
              <svg
                className='w-8 h-8 md:w-10 md:h-10 text-[#1a1a2e]'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M15 10.5a3 3 0 11-6 0 3 3 0 016 0z'
                />
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z'
                />
              </svg>
            </div>
          </div>

          <p
            className='text-gray-800 text-base md:text-xl leading-relaxed text-center mb-6'
            style={{ fontFamily: "'GeistPixel', monospace", fontWeight: 700 }}
          >
            {message}
          </p>

          <div className='flex justify-center'>
            <button
              type='button'
              onClick={onAction}
              className='px-6 md:px-8 py-3 md:py-4 text-base md:text-xl font-bold text-white transition-transform active:translate-y-0.5 hover:brightness-110'
              style={{
                backgroundColor: '#10b981',
                border: '3px solid #1a1a2e',
                boxShadow: '4px 4px 0px #1a1a2e',
                fontFamily: "'GeistPixel', monospace",
                fontWeight: 700,
              }}
            >
              {button_text}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
