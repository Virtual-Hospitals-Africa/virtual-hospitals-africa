import { Priority, RenderedVitalMeasurement } from '../../types.ts'
import { HiddenInput } from '../library/HiddenInput.tsx'

import { LocalTime } from '../../islands/LocalTime.tsx'
import { PencilIcon } from '../library/icons/heroicons/solid.tsx'
import { Label } from '../library/Label.tsx'
import PriorityDropdown from '../../islands/vitals/PriorityDropdown.tsx'
import { VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS } from '../../shared/vitals.ts'
import { TextInput } from '../../islands/form/inputs/text.tsx'
import { TextArea } from '../../islands/form/inputs/textarea.tsx'

export default function VitalInputWithEvaluation({
  measurement,
  computed,
  existingEvaluation,
}: {
  measurement: RenderedVitalMeasurement & {
    finding_type: 'manual' | 'computed'
  }
  computed?: boolean
  existingEvaluation?: {
    evaluation_id: string
    evaluates_record_id: string
    priority?: Priority
    note: string | null
    snomed_concept_id: string
  }
}) {
  const name = `findings.${measurement.record_id}`
  const has_existing_note = !!existingEvaluation?.note

  const getVitalName = (snomedCode: string) => {
    const vital_key = Object.entries(VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS)
      .find(
        ([_, code]) => code === snomedCode,
      )?.[0]

    if (!vital_key) return 'Unknown Vital'

    return vital_key
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .replace('Bp', 'BP')
  }

  return (
    <div className='flex flex-col w-full'>
      <input
        type='checkbox'
        id={`${name}-note-toggle`}
        className='sr-only peer'
        defaultChecked={has_existing_note}
      />
      <div className='flex justify-between w-full'>
        <div className='flex flex-col'>
          <Label
            label={
              <div className='flex items-center gap-2'>
                {getVitalName(measurement.snomed_concept_id)}
                {computed && (
                  <span className='inline-flex items-center px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full'>
                    Computed
                  </span>
                )}
              </div>
            }
          />
          <div className='flex text-gray-500'>
            <LocalTime
              timestamp={measurement.created_at}
              expected_time_range='past'
            />
          </div>
        </div>
        <div className='flex items-center gap-2 min-w-30 max-w-30'>
          <TextInput
            name={`${name}.display_value`}
            label={null}
            value={measurement.value_display}
            inputClassName='outline-slate-300 bg-slate-100 text-slate-600'
            readonly
            disabled
          />
          <PriorityDropdown
            name={name}
            vitalName={getVitalName(measurement.snomed_concept_id)}
            initialPriority={existingEvaluation?.priority}
          />
          <label
            htmlFor={`${name}-note-toggle`}
            className='inline-flex items-center justify-center border border-gray-300 rounded-md cursor-pointer size-12 hover:bg-gray-50 peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:text-blue-700'
            title={`Add note for ${
              getVitalName(
                measurement.snomed_concept_id,
              )
            }`}
          >
            <PencilIcon className='text-gray-300 size-5' />
          </label>
          <HiddenInput
            name={`${name}.snomed_concept_id`}
            value={measurement.snomed_concept_id}
          />
          <HiddenInput
            name={`${name}.finding_id`}
            value={measurement.record_id}
          />
        </div>
      </div>

      <div className='hidden mt-2 peer-checked:block'>
        <div className='flex justify-end'>
          <div className='w-80'>
            <TextArea
              name={`${name}.note`}
              label='Clinical Notes'
              placeholder={`Add clinical notes for ${
                getVitalName(
                  measurement.snomed_concept_id,
                )
              }...`}
              rows={3}
              value={existingEvaluation?.note || ''}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
