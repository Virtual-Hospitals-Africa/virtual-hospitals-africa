// =============================================================================
// FILE: /islands/tutorial/TutorialDialogue.tsx
// Pixel-game style dialogue box with speaker avatar
// Guide (Dr. Lindiwe) always bottom-left, Patient always top-right
// =============================================================================

import type { Speaker } from '../../shared/tutorial/types.ts'
import { SPEAKERS } from '../../shared/tutorial/types.ts'
import cls from '../../util/cls.ts'

type Position = 'bottom-left' | 'top-left' | 'top-right' | 'bottom-right'

/**
 * Map speaker to their badge background class.
 */
function getSpeakerBgClass(speaker: Speaker): string {
  switch (speaker) {
    case 'guide':
      return 'bg-indigo-500'
    case 'patient':
      return 'bg-emerald-500'
    case 'nurse':
      return 'bg-violet-500'
    case 'doctor':
      return 'bg-blue-500'
    case 'pharmacist':
      return 'bg-teal-500'
  }
}

type Props = {
  speaker: Speaker
  text: string
  dangerousHTML?: boolean // Render text as HTML via dangerouslySetInnerHTML
  button_text?: string // Custom button text (default: "Next")
  position: Position
  onNext?: () => void // Optional - hide Next button if not provided
  link?: { title: string; href: string } // Optional small link shown bottom-left
}

/**
 * Pixel-game style dialogue box with character avatar
 * Position is determined by speaker: guide → bottom-left, patient → top-right
 */
export function TutorialDialogue({
  speaker,
  text,
  dangerousHTML,
  onNext,
  button_text = 'Next',
  position,
  link,
}: Props) {
  const speaker_info = SPEAKERS[speaker]

  // Determine position: use override if provided, otherwise derive from speaker
  const effective_position: Position = position
  const is_left_aligned = effective_position.endsWith('left')

  return (
    <div
      className={cls('fixed z-[60] flex items-end gap-3 md:gap-6 max-w-[92vw] md:max-w-2xl lg:max-w-3xl', {
        'bottom-8': effective_position.startsWith('bottom'),
        'top-8': effective_position.startsWith('top'),
        'left-8': effective_position.endsWith('left'),
        'right-8': effective_position.endsWith('right'),
        'flex-row': is_left_aligned,
        'flex-row-reverse': !is_left_aligned,
      })}
    >
      <div className='flex-shrink-0'>
        <div className='w-20 h-20 md:w-44 md:h-44 rounded-lg overflow-hidden border-4 border-[#1a1a2e] shadow-[4px_4px_0px_#1a1a2e] [image-rendering:pixelated]'>
          <img
            src={speaker_info.avatar}
            alt={speaker_info.name}
            className='w-full h-full object-cover [image-rendering:pixelated]'
          />
        </div>
      </div>

      <div className='relative bg-[#f0f0f0] flex-1 p-4 md:p-8 w-80 md:w-120 border-4 border-[#1a1a2e] shadow-[4px_4px_0px_#1a1a2e]'>
        <div
          className={cls(
            'absolute -top-4 md:-top-5 px-3 md:px-5 py-1 md:py-1.5 text-base md:text-2xl font-bold text-white border-[3px] border-[#1a1a2e] [font-family:GeistPixel,monospace]',
            getSpeakerBgClass(speaker),
            {
              'left-3 right-auto': is_left_aligned,
              'right-3 left-auto': !is_left_aligned,
            },
          )}
        >
          {speaker_info.name}
        </div>

        <div
          className={cls('absolute bottom-7 w-0 h-0 border-solid border-t-[14px] border-t-transparent border-b-[14px] border-b-transparent', {
            '-left-[18px] border-r-[18px] border-r-[#1a1a2e]': is_left_aligned,
            '-right-[18px] border-l-[18px] border-l-[#1a1a2e]': !is_left_aligned,
          })}
        />
        <div
          className={cls('absolute bottom-[30px] w-0 h-0 border-solid border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent', {
            '-left-[10px] border-r-[16px] border-r-[#f0f0f0]': is_left_aligned,
            '-right-[10px] border-l-[16px] border-l-[#f0f0f0]': !is_left_aligned,
          })}
        />
        <p
          className='text-gray-800 text-base md:text-2xl leading-relaxed mb-4 md:mb-6 mt-2 md:mt-4 font-bold [font-family:GeistPixel,monospace]'
          {...(dangerousHTML ? { dangerouslySetInnerHTML: { __html: text } } : {})}
        >
          {dangerousHTML ? undefined : text}
        </p>

        <div className='flex items-end justify-between gap-2'>
          {link
            ? (
              <a
                href={link.href}
                target='_blank'
                rel='noopener noreferrer'
                className='text-xs md:text-sm text-indigo-600 underline underline-offset-2 opacity-70 hover:opacity-100 [font-family:GeistPixel,monospace]'
              >
                {link.title}
              </a>
            )
            : <span />}
          {onNext
            ? (
              <button
                type='button'
                onClick={onNext}
                className='px-4 md:px-6 py-2 md:py-3 text-base md:text-xl font-bold text-white transition-transform active:translate-y-0.5 bg-indigo-500 border-[3px] border-[#1a1a2e] shadow-[4px_4px_0px_#1a1a2e] [font-family:GeistPixel,monospace]'
              >
                {button_text}
              </button>
            )
            : (
              <div className='flex items-center gap-2 md:gap-3 text-base md:text-xl font-medium text-indigo-500 [font-family:GeistPixel,monospace]'>
                <span className='animate-pulse text-lg md:text-2xl'>&#x25B6;</span>
                <span>Complete the action to continue</span>
              </div>
            )}
        </div>
      </div>
    </div>
  )
}
