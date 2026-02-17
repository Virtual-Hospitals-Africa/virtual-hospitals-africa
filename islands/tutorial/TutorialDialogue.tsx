// =============================================================================
// FILE: /islands/tutorial/TutorialDialogue.tsx
// Pixel-game style dialogue box with speaker avatar
// Guide (Dr. Lindiwe) always bottom-left, Patient always top-right
// =============================================================================

import type { Speaker } from '../../shared/tutorial/types.ts'
import { SPEAKERS } from '../../shared/tutorial/types.ts'
import cls from '../../util/cls.ts'

type Position = 'bottom-left' | 'top-left' | 'top-right'

/**
 * Map speaker to their badge color.
 */
function getSpeakerColor(speaker: Speaker): string {
  switch (speaker) {
    case 'guide':
      return '#6366f1' // indigo-500
    case 'patient':
      return '#10b981' // emerald-500
    case 'nurse':
      return '#8b5cf6' // purple-500
  }
}

type Props = {
  speaker: Speaker
  text: string
  button_text?: string // Custom button text (default: "Next")
  position?: Position // Override speaker-based position
  onNext?: () => void // Optional - hide Next button if not provided
}

/**
 * Pixel-game style dialogue box with character avatar
 * Position is determined by speaker: guide → bottom-left, patient → top-right
 */
export function TutorialDialogue({
  speaker,
  text,
  onNext,
  button_text = 'Next',
  position,
}: Props) {
  const speaker_info = SPEAKERS[speaker]

  // Determine position: use override if provided, otherwise derive from speaker
  const effective_position: Position = position ?? (speaker === 'guide' ? 'bottom-left' : 'top-right')
  const is_left_aligned = effective_position === 'bottom-left' || effective_position === 'top-left'

  return (
    <div
      className={cls('fixed z-[60] flex items-end gap-3 md:gap-6 max-w-[92vw] md:max-w-2xl lg:max-w-3xl', {
        'bottom-8 left-8': effective_position === 'bottom-left',
        'top-8 left-8': effective_position === 'top-left',
        'top-8 right-8': effective_position === 'top-right',
        'flex-row': is_left_aligned,
        'flex-row-reverse': !is_left_aligned,
      })}
    >
      <div className='flex-shrink-0'>
        <div
          className='w-20 h-20 md:w-44 md:h-44 rounded-lg overflow-hidden'
          style={{
            border: '4px solid #1a1a2e',
            boxShadow: '4px 4px 0px #1a1a2e',
            imageRendering: 'pixelated',
          }}
        >
          <img
            src={speaker_info.avatar}
            alt={speaker_info.name}
            className='w-full h-full object-cover'
            style={{ imageRendering: 'pixelated' }}
          />
        </div>
      </div>

      <div
        className='relative bg-[#f0f0f0] flex-1 p-4 md:p-8 min-w-[280px] md:min-w-[400px]'
        style={{
          border: '4px solid #1a1a2e',
          boxShadow: '4px 4px 0px #1a1a2e',
        }}
      >
        <div
          className='absolute -top-4 md:-top-5 px-3 md:px-5 py-1 md:py-1.5 text-base md:text-2xl font-bold text-white'
          style={{
            left: is_left_aligned ? '12px' : 'auto',
            right: is_left_aligned ? 'auto' : '12px',
            backgroundColor: getSpeakerColor(speaker),
            border: '3px solid #1a1a2e',
            fontFamily: "'GeistPixel', monospace",
            fontWeight: 700,
          }}
        >
          {speaker_info.name}
        </div>

        {is_left_aligned
          ? (
            <>
              <div
                className='absolute'
                style={{
                  left: '-18px',
                  bottom: '28px',
                  width: 0,
                  height: 0,
                  borderTop: '14px solid transparent',
                  borderBottom: '14px solid transparent',
                  borderRight: '18px solid #1a1a2e',
                }}
              />
              <div
                className='absolute'
                style={{
                  left: '-10px',
                  bottom: '30px',
                  width: 0,
                  height: 0,
                  borderTop: '12px solid transparent',
                  borderBottom: '12px solid transparent',
                  borderRight: '16px solid #f0f0f0',
                }}
              />
            </>
          )
          : (
            <>
              <div
                className='absolute'
                style={{
                  right: '-18px',
                  bottom: '28px',
                  width: 0,
                  height: 0,
                  borderTop: '14px solid transparent',
                  borderBottom: '14px solid transparent',
                  borderLeft: '18px solid #1a1a2e',
                }}
              />
              <div
                className='absolute'
                style={{
                  right: '-10px',
                  bottom: '30px',
                  width: 0,
                  height: 0,
                  borderTop: '12px solid transparent',
                  borderBottom: '12px solid transparent',
                  borderLeft: '16px solid #f0f0f0',
                }}
              />
            </>
          )}

        <p
          className='text-gray-800 text-base md:text-2xl leading-relaxed mb-4 md:mb-6 mt-2 md:mt-4'
          style={{ fontFamily: "'GeistPixel', monospace", fontWeight: 700 }}
        >
          {text}
        </p>

        {onNext
          ? (
            <div className='flex justify-end'>
              <button
                type='button'
                onClick={onNext}
                className='px-4 md:px-6 py-2 md:py-3 text-base md:text-xl font-bold text-white transition-transform active:translate-y-0.5'
                style={{
                  backgroundColor: '#6366f1',
                  border: '3px solid #1a1a2e',
                  boxShadow: '4px 4px 0px #1a1a2e',
                  fontFamily: "'GeistPixel', monospace",
                  fontWeight: 700,
                }}
              >
                {button_text}
              </button>
            </div>
          )
          : (
            <div
              className='flex items-center gap-2 md:gap-3 text-base md:text-xl font-medium'
              style={{ color: '#6366f1', fontFamily: "'GeistPixel', monospace" }}
            >
              <span className='animate-pulse text-lg md:text-2xl'>&#x25B6;</span>
              <span>Complete the action to continue</span>
            </div>
          )}
      </div>
    </div>
  )
}
