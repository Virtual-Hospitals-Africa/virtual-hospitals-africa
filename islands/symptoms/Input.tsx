import {
  CheckboxGridItem,
  CheckboxInput,
  DateInput,
  ImageOrVideoInput,
  SelectWithOptions,
  TextArea,
} from '../form/Inputs.tsx'
import FormRow from '../../components/library/FormRow.tsx'
import { computed, useSignal } from '@preact/signals'
import { RemoveRow } from '../AddRemove.tsx'
import range from '../../util/range.ts'
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
import cls from '../../util/cls.ts'

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

  const notes = useSignal(value?.notes || '')

  const media = useSignal(
    value
      ? {
        mime_type: value?.media?.[0]?.mime_type,
        url: value?.media?.[0]?.url,
        name: `${name}.media.0`,
        file: value?.media?.[0]?.mime_type
          ? new File([], '', { type: value?.media?.[0]?.mime_type })
          : undefined,
      }
      : null,
  )

  const mediaUpdated = useSignal(false)

  return (
    <RemoveRow onClick={remove} labelled>
      <div className='flex flex-col space-y-1 w-full'>
        <input
          name={`${name}.patient_symptom_id`}
          type='hidden'
          value={value?.patient_symptom_id}
        />
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
                entered_duration.value = null
                end_date.value = e.currentTarget.checked ? null : yesterday
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
                start_date.value = e.currentTarget.value
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
                  end_date.value = e.currentTarget.value
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
              value={notes.value}
              onInput={(e) => notes.value = e.currentTarget.value}
              rows={2}
              placeholder='Describe the symptom’s intermittency, frequency, character, radiation, timing, exacerbating/relieving factors where applicable'
            />
          </FormRow>
          <FormRow className='w-full justify-normal'>
            <ImageOrVideoInput
              name={`${name}.media.0`}
              label='Photo/Video'
              value={media?.value}
              className={cls('w-36', media.value?.url ? 'hidden' : '')}
              onInput={(e) => {
                const file = e.currentTarget.files?.[0]
                mediaUpdated.value = true
                media.value = {
                  mime_type: file?.type!,
                  url: URL.createObjectURL(file!),
                  name: file?.name!,
                  file: file,
                }
              }}
            />
            {media.value?.url && (
              <div className='flex flex-col gap-0.5 flex-wrap'>
                <RemoveRow
                  onClick={() => {
                    media.value = null
                    mediaUpdated.value = true
                  }}
                  centered
                >
                  <div
                    className={cls(
                      'mt-2 p-2 rounded-md border border-gray-300 border-solid relative',
                      'w-36',
                    )}
                  >
                    <img
                      className='w-full h-full object-cover'
                      src={media.value.url}
                      alt={name ? `Uploaded ${name}` : ''}
                    />
                  </div>
                </RemoveRow>
              </div>
            )}
          </FormRow>
          <FormRow className='w-full justify-normal hidden'>
            <CheckboxGridItem
              name={`${name}.media_edited`}
              label='Media edited'
              checked={mediaUpdated.value}
              onChange={(value) => mediaUpdated.value = value}
            />
            {/* <input type='checkbox' name={`${name}.media_edited`} checked={mediaUpdated.value}/> */}
          </FormRow>
        </div>
      </div>
    </RemoveRow>
  )
}
