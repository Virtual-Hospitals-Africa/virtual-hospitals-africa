import { useSignal } from '@preact/signals'
import { Maybe } from '../../types.ts'
import { assert } from 'std/assert/assert.ts'
import { nowDatetimeLocalInJohannesburg, rfc3339_regex } from '../../util/date.ts'
import { CheckboxInput } from '../form/inputs/checkbox.tsx'
import { DatetimeInput } from '../form/inputs/datetime.tsx'
import cls from '../../util/cls.ts'

export function OnsetRow({
  onset_required,
  dates,
  onChange,
}: {
  onset_required: boolean
  dates?: Maybe<{
    onset: Maybe<string>
    resolved: Maybe<string>
  }>
  onChange?: (dates: { onset: string | null; resolved: string | null }) => void
}) {
  const now = nowDatetimeLocalInJohannesburg()
  if (dates?.onset) {
    assert(rfc3339_regex.test(dates.onset))
  }
  if (dates?.resolved) {
    assert(rfc3339_regex.test(dates.resolved))
  }
  const onset = useSignal(dates?.onset)
  const resolved = useSignal(dates?.resolved)
  const ongoing = useSignal(!dates?.resolved)
  const callback = () => {
    onChange?.({
      onset: onset.value || null,
      resolved: resolved.value || null,
    })
  }

  return (
    <div className='flex flex-col'>
      <div className='flex flex-col gap-2'>
        <FieldHeading htmlFor='onset' required={onset_required}>Onset</FieldHeading>
        <DatetimeInput
          id='onset'
          value={onset.value}
          max={now}
          label={null}
          required={onset_required}
          onInput={(e) => {
            onset.value = e.currentTarget.value
            callback()
          }}
        />
      </div>
      <CheckboxInput
        name={null}
        className='h-min pt-3'
        label_className='text-sm font-semibold text-gray-900'
        label='Ongoing'
        checked={ongoing.value}
        onInput={(e) => {
          ongoing.value = e.currentTarget.checked
        }}
      />
      {/* Resolved only applies once the finding is no longer ongoing, so it slides out below the checkbox */}
      <div
        id='resolved-field'
        aria-hidden={ongoing.value}
        className={cls(
          'grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none',
          ongoing.value ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100',
        )}
      >
        <div className='min-h-0 overflow-hidden'>
          <div className='flex flex-col gap-2 pt-3'>
            <FieldHeading htmlFor='resolved' required={!ongoing.value}>Resolved</FieldHeading>
            <DatetimeInput
              id='resolved'
              value={resolved.value}
              label={null}
              min={onset.value}
              max={now}
              onInput={(e) => {
                resolved.value = e.currentTarget.value
                callback()
              }}
              disabled={ongoing.value}
              required={!ongoing.value}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Same heading style as Pain Level, Qualifiers and Finding Site
function FieldHeading({ htmlFor, required, children }: {
  htmlFor: string
  required?: boolean
  children: string
}) {
  return (
    <label htmlFor={htmlFor} className='text-sm font-semibold text-gray-900'>
      {children}
      {required && <span className='text-gray-600'>*</span>}
    </label>
  )
}
