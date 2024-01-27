import {
  CheckboxInput,
  DateInput,
  NumberInput,
  SelectWithOptions,
  TextArea,
  TextInput,
} from '../../components/library/form/Inputs.tsx'
import FormRow from '../../components/library/form/Row.tsx'
import { EditingSymptom } from './Section.tsx'
import { computed, useSignal } from '@preact/signals'
import { RemoveRow } from '../AddRemove.tsx'
import range from '../../util/range.ts'
import FilePreviewInput from '../file-preview-input.tsx'
import { Duration } from '../../types.ts'
import { assert } from 'std/assert/assert.ts'
import { dateRegex, durationBetween, durationEndDate } from '../../util/date.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'

function DurationInput(
  { value, onChange }: {
    value: Duration
    onChange(duration: Duration): void
  },
) {
  return (
    <div className='flex flex-col md:flex-row md:items-center gap-2'>
      <NumberInput
        name={null}
        label='Duration'
        min={0}
        max={999}
        className='w-24'
        value={value.duration}
        onInput={(e) => {
          onChange({
            duration: Number(e.target.value),
            duration_unit: value.duration_unit,
          })
        }}
      />
      <SelectWithOptions
        name={null}
        label=' '
        value={value.duration_unit}
        options={[
          {
            value: 'days',
            label: value.duration === 1 ? 'day' : 'days',
          },
          {
            value: 'weeks',
            label: value.duration === 1 ? 'week' : 'weeks',
          },
          {
            value: 'months',
            label: value.duration === 1 ? 'month' : 'months',
          },
          {
            value: 'years',
            label: value.duration === 1 ? 'year' : 'years',
          },
        ]}
        className='w-24'
        onChange={(e) => {
          assert(
            e.target.value === 'days' || e.target.value === 'weeks' ||
              e.target.value === 'months' || e.target.value === 'years',
          )
          onChange({
            duration: value.duration,
            duration_unit: e.target.value,
          })
        }}
      />
    </div>
  )
}

function approximateDuration(start_date: string, end_date: string): Duration {
  const duration_in_days = durationBetween(start_date, end_date)
  assertEquals(duration_in_days.duration_unit, 'days')
  if (duration_in_days.duration <= 14) {
    return duration_in_days
  }
  if (duration_in_days.duration <= 60) {
    return {
      duration: Math.round(duration_in_days.duration / 7),
      duration_unit: 'weeks',
    }
  }
  if (duration_in_days.duration <= 730) {
    return {
      duration: Math.round(duration_in_days.duration / 30),
      duration_unit: 'months',
    }
  }
  return {
    duration: Math.round(duration_in_days.duration / 365),
    duration_unit: 'years',
  }
}

export default function SymptomInput({
  name,
  value,
  today,
}: {
  name: string
  value: EditingSymptom
  today: string
}) {
  assert(dateRegex.test(today))
  const yesterday = durationEndDate(today, {
    duration: -1,
    duration_unit: 'days',
  })!
  const is_removed = useSignal(false)
  const start_date = useSignal(
    value.start_date ||
      durationEndDate(today, { duration: -1, duration_unit: 'days' })!,
  )
  const end_date = useSignal(value.end_date || null)
  const ongoing = computed(() => !end_date.value)

  const entered_duration = useSignal<Duration | null>(null)

  if (is_removed.value) return null

  const duration = computed(() =>
    entered_duration.value ||
    approximateDuration(start_date.value, end_date.value || today)
  )

  return (
    <RemoveRow onClick={() => is_removed.value = true} labelled>
      <div className='md:col-span-8 justify-normal flex flex-col gap-1.5'>
        <FormRow className='w-full justify-normal'>
          <TextInput
            name={`${name}.symptom`}
            required
            readonly
            value={value.symptom}
          />
          <SelectWithOptions
            name={`${name}.severity`}
            required
            options={range(1, 11)} // 1-10
            value={value.severity}
          />
        </FormRow>
        <FormRow className='w-full justify-normal'>
          <CheckboxInput
            name={null}
            label='Ongoing'
            checked={!end_date.value}
            onInput={(e) => {
              assert(e.target instanceof HTMLInputElement)
              entered_duration.value = null
              if (e.target.checked) {
                end_date.value = null
              } else {
                end_date.value = yesterday
              }
            }}
          />
          <DurationInput
            value={duration.value}
            onChange={(duration) => {
              entered_duration.value = duration
              if (ongoing.value) {
                return start_date.value = durationEndDate(today, {
                  duration: -duration.duration,
                  duration_unit: duration.duration_unit,
                })!
              }
              return end_date.value = durationEndDate(
                start_date.value,
                duration,
              )!
            }}
          />
          <DateInput
            name={`${name}.start_date`}
            value={start_date.value}
            label='Onset'
            required
            onInput={(e) => {
              assert(e.target instanceof HTMLInputElement)
              start_date.value = e.target.value
              if (ongoing.value) {
                return entered_duration.value = null
              }
              if (entered_duration.value) {
                return end_date.value = durationEndDate(
                  start_date.value,
                  entered_duration.value,
                )!
              }
            }}
          />
          {!ongoing.value && (
            <DateInput
              name={`${name}.end_date`}
              value={end_date.value}
              label='End'
              onInput={(e) => {
                assert(e.target instanceof HTMLInputElement)
                end_date.value = e.target.value
                entered_duration.value = null
              }}
            />
          )}
        </FormRow>
        <FormRow className='w-full justify-normal'>
          <TextArea
            name={`${name}.notes`}
            className='w-full'
            label='Notes'
            value={value.notes}
            rows={2}
            placeholder='Describe the symptom’s intermittency, frequency, character, radiation, timing, exacerbating/relieving factors where applicable'
          />
        </FormRow>
      </div>
      <div className='md:col-span-4'>
        <FormRow className='flex-wrap'>
          <FilePreviewInput
            name={`${name}.media.0`}
            label='Photo/Video'
            className='w-36 h-36'
            value={value.media?.[0]}
          />
        </FormRow>
      </div>
    </RemoveRow>
  )
}
