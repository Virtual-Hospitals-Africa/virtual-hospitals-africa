import FormRow from '../../components/library/FormRow.tsx'
import { computed, useSignal } from '@preact/signals'
// import { RemoveRow } from '../AddRemove.tsx'
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
// import cls from '../../util/cls.ts'
import AsyncSearch from '../AsyncSearch.tsx'
import { HiddenInput } from '../../components/library/HiddenInput.tsx'
import { Button } from '../../components/library/Button.tsx'
import Form from '../../components/library/Form.tsx'
import { CheckboxInput } from '../form/inputs/checkbox.tsx'
import { DateInput } from '../form/inputs/date.tsx'
import { SelectWithOptions } from '../form/inputs/select_with_options.tsx'
import { TextArea } from '../form/inputs/textarea.tsx'

function hasNameAndSnomedConceptId(
  symptom: Partial<RenderedPatientSymptom>,
): symptom is Partial<RenderedPatientSymptom> & {
  snomed_concept_id: string
  name: string
} {
  return typeof symptom.name === 'string' && !!symptom.name &&
    typeof symptom.snomed_concept_id === 'string' && !!symptom.snomed_concept_id
}

export function SymptomForm({
  symptom,
  today,
}: {
  symptom: Partial<RenderedPatientSymptom>
  today: string
}) {
  assert(dateRegex.test(today))

  const yesterday = durationEndDate(today, {
    duration: -1,
    duration_unit: 'days',
  })!

  const start_date = useSignal(
    symptom?.start_date ||
      durationEndDate(today, { duration: -1, duration_unit: 'days' })!,
  )
  const end_date = useSignal(symptom?.end_date || null)
  const ongoing = computed(() => !end_date.value)

  const entered_duration = useSignal<Duration | null>(null)

  const duration = computed(() =>
    entered_duration.value ||
    approximateDuration(start_date.value, end_date.value || today)
  )

  const notes = useSignal(symptom?.notes || '')

  // const media = useSignal(
  //   symptom
  //     ? {
  //       mime_type: symptom?.media?.[0]?.mime_type,
  //       url: symptom?.media?.[0]?.url,
  //       name: `media.0`,
  //       file: symptom?.media?.[0]?.mime_type
  //         ? new File([], '', { type: symptom?.media?.[0]?.mime_type })
  //         : undefined,
  //     }
  //     : null,
  // )

  return (
    <Form method='POST' // className='flex flex-col w-full space-y-1'
    >
      <FormRow className='w-full'>
        <AsyncSearch
          name='snomed_concept'
          label='Symptom'
          value={hasNameAndSnomedConceptId(symptom)
            ? {
              id: symptom.snomed_concept_id,
              name: symptom.name,
            }
            : null}
          search_route='/app/symptoms'
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
            name='start_date'
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
              name='end_date'
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
            name='severity'
            required
            options={range(1, 11)} // 1-10
            value={symptom?.severity}
          />
        </FormRow>
        <FormRow className='w-full justify-normal'>
          <TextArea
            name='notes'
            className='w-full'
            label='Notes'
            value={notes.value}
            onInput={(e) => notes.value = e.currentTarget.value}
            rows={2}
            placeholder='Describe the symptom’s intermittency, frequency, character, radiation, timing, exacerbating/relieving factors where applicable'
          />
        </FormRow>
        <HiddenInput
          name='altered_patient_symptom_id'
          value={symptom.id}
        />
        {
          /* <FormRow className='w-full justify-normal'>
          <ImageOrVideoInput
            name="media.0"
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
                    className='object-cover w-full h-full'
                    src={media.value.url}
                    alt={name ? `Uploaded ${name}` : ''}
                  />
                </div>
              </RemoveRow>
            </div>
          )}
        </FormRow> */
        }
      </div>
      <Button>
        Submit
      </Button>
    </Form>
  )
}
