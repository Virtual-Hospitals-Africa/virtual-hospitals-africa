import {
  CheckboxInput,
  DateInput,
  SelectWithOptions,
  TextArea,
} from '../../components/library/form/Inputs.tsx'
import FormRow from '../../components/library/form/Row.tsx'
import { computed, useSignal } from '@preact/signals'
import { RemoveRow } from '../AddRemove.tsx'
import range from '../../util/range.ts'
import FilePreviewInput from '../file-preview-input.tsx'
import { Duration } from '../../types.ts'
import { assert } from 'std/assert/assert.ts'
import {
  approximateDuration,
  dateRegex,
  durationEndDate,
} from '../../util/date.ts'
import { DurationInput } from './DurationInput.tsx'
import { RenderedPatientSymptom } from '../../types.ts'
import { ICD10SearchSpecific } from '../icd10/SearchSpecific.tsx'

export default function SymptomInput({
  name,
  value,
  today,
  remove,
}: {
  name: string
  value?: RenderedPatientSymptom
  today: string
  remove(): void
}) {
  assert(dateRegex.test(today))
  const yesterday = durationEndDate(today, {
    duration: -1,
    duration_unit: 'days',
  })!

  const start_date = useSignal(
    value?.start_date ||
      durationEndDate(today, { duration: -1, duration_unit: 'days' })!,
  )
  const end_date = useSignal(value?.end_date || null)
  const ongoing = computed(() => !end_date.value)

  const entered_duration = useSignal<Duration | null>(null)

  const duration = computed(() =>
    entered_duration.value ||
    approximateDuration(start_date.value, end_date.value || today)
  )

  return (
    <RemoveRow onClick={remove} labelled>
      <div className='flex flex-col space-y-1 w-full'>
        <FormRow className='w-full'>
          <ICD10SearchSpecific
            name={`${name}.code`}
            label='Symptom'
            value={value}
            href='/app/symptoms'
          />
        </FormRow>
        <div className='md:col-span-8 justify-normal flex flex-col gap-1.5'>
          <FormRow className='w-full justify-normal'>
            <CheckboxInput
              name={null}
              label='Ongoing'
              checked={!end_date.value}
              className='w-min'
              onInput={(e) => {
                assert(e.target instanceof HTMLInputElement)
                entered_duration.value = null
                end_date.value = e.target.checked ? null : yesterday
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
              max={today}
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
                min={start_date.value}
                max={today}
                onInput={(e) => {
                  end_date.value = e.target.value
                  entered_duration.value = null
                }}
              />
            )}
            <SelectWithOptions
              name={`${name}.severity`}
              required
              options={range(1, 11)} // 1-10
              value={value?.severity}
            />
          </FormRow>
          <FormRow className='w-full justify-normal'>
            <TextArea
              name={`${name}.notes`}
              className='w-full'
              label='Notes'
              value={value?.notes}
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
              value={value?.media?.[0]}
            />
          </FormRow>
        </div>
      </div>
    </RemoveRow>
  )
}
