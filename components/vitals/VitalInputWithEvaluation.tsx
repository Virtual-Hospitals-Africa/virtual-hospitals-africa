import { MostRecentVitalMeasurement, Priority } from '../../types.ts'
import { HiddenInput } from '../library/HiddenInput.tsx'
import { TextArea, TextInput } from '../../islands/form/Inputs.tsx'
import { LocalTime } from '../../islands/LocalTime.tsx'
import { PencilIcon } from '../library/icons/heroicons/solid.tsx'
import { Label } from '../library/Label.tsx'
import PriorityDropdown from '../../islands/vitals/PriorityDropdown.tsx'
import { VITALS_SNOMED_CODE } from '../../shared/vitals.ts'

export default function VitalInputWithEvaluation({
  measurement,
  computed,
  existingEvaluation,
}: {
  measurement: MostRecentVitalMeasurement & {
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
  const name = `findings.${measurement.finding_id}`
  const hasExistingNote = !!existingEvaluation?.note

  const getVitalName = (snomedCode: string) => {
    const vitalKey = Object.entries(VITALS_SNOMED_CODE).find(
      ([_, code]) => code === snomedCode,
    )?.[0]

    if (!vitalKey) return 'Unknown Vital'

    return vitalKey
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
        className='peer sr-only'
        defaultChecked={hasExistingNote}
      />
      <div className='flex justify-between w-full'>
        <div className='flex flex-col'>
          <Label
            label={
              <div className='flex items-center gap-2'>
                {getVitalName(measurement.snomed_concept_id)}
                {computed && (
                  <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                    Computed
                  </span>
                )}
              </div>
            }
          />
          <div className='flex text-gray-500'>
            <LocalTime timestamp={measurement.created_at} />
          </div>
        </div>
        <div className='min-w-30 max-w-30 flex items-center gap-2'>
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
            className='inline-flex items-center justify-center size-12 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:text-blue-700'
            title={`Add note for ${
              getVitalName(
                measurement.snomed_concept_id,
              )
            }`}
          >
            <PencilIcon className='size-5 text-gray-300' />
          </label>
          <HiddenInput
            name={`${name}.snomed_concept_id`}
            value={measurement.snomed_concept_id}
          />
          <HiddenInput
            name={`${name}.finding_id`}
            value={measurement.finding_id}
          />
        </div>
      </div>

      <div className='hidden peer-checked:block mt-2'>
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
