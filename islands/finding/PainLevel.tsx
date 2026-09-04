import { PAIN_LEVELS, type PainLevel } from '../../shared/pain_levels.ts'
import type { Maybe } from '../../types.ts'
import cls from '../../util/cls.ts'

export function PainLevelSelect({ value, onChange }: {
  value: Maybe<PainLevel>
  onChange(pain_level: Maybe<PainLevel>): void
}) {
  console.log('welk', { value })
  return (
    <div className='flex flex-col gap-2'>
      <h3 className='text-sm font-semibold text-gray-900'>Pain Level</h3>
      <fieldset className='grid grid-cols-4 gap-2'>
        {PAIN_LEVELS.map((pain_level) => {
          const checked = value?.concept.name === pain_level.concept.name
          return (
            <label
              key={pain_level.concept.id}
              className={cls(
                'flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium',
                checked ? pain_level.selected : pain_level.unselected,
              )}
            >
              <input
                type='radio'
                name='pain_level'
                className='sr-only'
                value={pain_level.concept.id}
                checked={checked}
                // Nothing is recorded unless a level is picked, so picking the
                // selected level again is how you get back to recording nothing
                onClick={(event) => {
                  if (!checked) return
                  event.preventDefault()
                  onChange(null)
                }}
                onChange={() => onChange(pain_level)}
              />
              {pain_level.label}
            </label>
          )
        })}
      </fieldset>
    </div>
  )
}
