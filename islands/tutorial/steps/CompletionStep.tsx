// =============================================================================
// FILE: /islands/tutorial/steps/CompletionStep.tsx
// Tutorial completion celebration step
// =============================================================================

import { SPEAKERS } from '../../../shared/tutorial/types.ts'

/**
 * Completion step - shows a celebration message.
 * The confetti animation is handled by TutorialOverlay when is_final is set.
 */
export function CompletionStep() {
  return (
    <div className='flex flex-col items-center justify-center min-h-[400px] text-center px-8'>
      <div className='w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg'>
        <svg
          className='w-12 h-12 text-white'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={3}
            d='M5 13l4 4L19 7'
          />
        </svg>
      </div>

      <h1
        className='text-4xl font-bold text-gray-900 mb-4'
        style={{ fontFamily: "'GeistPixel', monospace" }}
      >
        Tutorial Complete!
      </h1>

      <div className='max-w-lg space-y-4 text-gray-600'>
        <p className='text-lg'>
          You've successfully learned the basics of the VHA triage system.
        </p>

        <div className='bg-indigo-50 rounded-lg p-4 text-left'>
          <h3 className='font-semibold text-indigo-900 mb-2'>What you learned:</h3>
          <ul className='space-y-2 text-sm'>
            <li className='flex items-start gap-2'>
              <span className='text-indigo-500 mt-0.5'>✓</span>
              Recording warning signs and presenting complaints
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-indigo-500 mt-0.5'>✓</span>
              Reviewing brief medical history for relevant conditions
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-indigo-500 mt-0.5'>✓</span>
              Understanding why specific vitals (like SpO2) are measured
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-indigo-500 mt-0.5'>✓</span>
              Using the Patient Drawer to track findings
            </li>
          </ul>
        </div>

        <div className='flex items-center gap-3 pt-4'>
          <img
            src={SPEAKERS.guide.avatar}
            alt={SPEAKERS.guide.name}
            className='w-12 h-12 rounded-full border-2 border-indigo-500'
            style={{ imageRendering: 'pixelated' }}
          />
          <p className='text-sm italic text-gray-500'>
            "Every assessment you do makes a difference in someone's life." — {SPEAKERS.guide.name}
          </p>
        </div>
      </div>
    </div>
  )
}
