import {
  Maybe,
  MostRecentVitalMeasurement,
  VitalMeasurementFormInputDefition,
} from '../../types.ts'
import capitalize from '../../util/capitalize.ts'
import { HiddenInput } from '../../components/library/HiddenInput.tsx'
import { TextArea, UnitInput } from '../form/Inputs.tsx'
import { HeroIconButton } from '../../components/library/HeroIconButton.tsx'
import {
  FlagIcon,
  PencilIcon,
} from '../../components/library/icons/heroicons/solid.tsx'
import { useSignal } from '@preact/signals'

export default function VitalInputWithNote(
  { vital, most_recent_patient_finding: _most_recent_patient_finding }: {
    vital: VitalMeasurementFormInputDefition
    most_recent_patient_finding: Maybe<MostRecentVitalMeasurement>
  },
) {
  const name = `findings.${vital.finding_id}`
  const showNote = useSignal(false)

  return (
    <div className='flex flex-col w-full'>
      <div className='flex justify-between w-full'>
        <div className='flex flex-row gap-2'>
          <span className='flex items-center'>
            {capitalize(vital.label)}
            {vital.required && <sup>*</sup>}
          </span>
        </div>
        <div className='min-w-30 max-w-30 flex items-center gap-2'>
          <UnitInput
            required={vital.required}
            name={`${name}.value`}
            label={null}
            value={null}
            className='col-start-6 justify-end'
            min={0}
            units={vital.units}
          />
          <HeroIconButton
            variant='outline'
            color='slate'
            type='button'
            disabled
            title={`Flag ${vital.label}`}
            className='w-8 h-8 p-1'
          >
            <FlagIcon className='h-4 w-4' />
          </HeroIconButton>
          <HeroIconButton
            variant='outline'
            color='blue'
            type='button'
            title={`Add note for ${vital.label}`}
            className='w-8 h-8 p-1'
            onClick={() => showNote.value = !showNote.value}
          >
            <PencilIcon className='h-4 w-4' />
          </HeroIconButton>
          <HiddenInput
            name={`${name}.snomed_concept_id`}
            value={vital.snomed_concept_id}
          />
          <HiddenInput
            name={`${name}.units`}
            value={vital.units}
          />
        </div>
      </div>
      {showNote.value && (
        <div className='flex justify-end mt-2'>
          <div className='w-80'>
            <TextArea
              name={`${name}.note`}
              label={`Notes`}
              placeholder={`Add a note for ${vital.label}...`}
              rows={3}
            />
          </div>
        </div>
      )}
    </div>
  )
}
