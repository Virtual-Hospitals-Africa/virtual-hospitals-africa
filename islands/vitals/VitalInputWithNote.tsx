import {
  Maybe,
  MostRecentVitalMeasurement,
  VitalMeasurementFormInputDefition,
} from '../../types.ts'
import capitalize from '../../util/capitalize.ts'
import { HiddenInput } from '../../components/library/HiddenInput.tsx'

import { LocalTime } from '../LocalTime.tsx'
import { HeroIconButton } from '../../components/library/HeroIconButton.tsx'
import {
  FlagIcon,
  PencilIcon,
} from '../../components/library/icons/heroicons/solid.tsx'
import { useSignal } from '@preact/signals'
import { Label } from '../../components/library/Label.tsx'
import { TextInput } from '../form/inputs/text.tsx'
import { TextArea } from '../form/inputs/textarea.tsx'

export default function VitalInputWithNote(
  { vital, most_recent_patient_finding }: {
    vital: VitalMeasurementFormInputDefition
    most_recent_patient_finding: Maybe<MostRecentVitalMeasurement>
  },
) {
  const name = `findings.${vital.finding_id}`
  const showNote = useSignal(false)

  return (
    <div className='flex flex-col w-full'>
      <div className='flex justify-between w-full'>
        <div className='flex flex-col'>
          <Label label={capitalize(vital.label)} />
          {most_recent_patient_finding && (
            <div className='flex text-gray-500'>
              <a href='#' className='text-blue-500'>
                {most_recent_patient_finding.value_display}
              </a>
              &nbsp;
              <LocalTime timestamp={most_recent_patient_finding.created_at} />
            </div>
          )}
        </div>
        <div className='flex items-center gap-2 min-w-30 max-w-30'>
          <TextInput
            inputmode='numeric'
            required={vital.required}
            name={`${name}.value`}
            label={null}
            value={null}
            className='justify-end col-start-6'
            min={0}
            suffix={vital.units}
          />
          <HeroIconButton
            variant='outline'
            color='slate'
            type='button'
            disabled
            title={`Flag ${vital.label}`}
            className='w-8 h-8 p-1'
          >
            <FlagIcon className='w-4 h-4' />
          </HeroIconButton>
          <HeroIconButton
            variant='outline'
            color='blue'
            type='button'
            title={`Add note for ${vital.label}`}
            className='w-8 h-8 p-1'
            onClick={() => showNote.value = !showNote.value}
          >
            <PencilIcon className='w-4 h-4' />
          </HeroIconButton>
          {
            /* <CheckboxInput
          name={`${name}.is_flagged`}
          label={null}
          checked={on.value}
          className='hidden'
        /> */
          }
          <HiddenInput
            name={`${name}.snomed_concept_id`}
            value={vital.snomed_concept_id}
          />
          <HiddenInput
            name={`${name}.units`}
            value={vital.units}
          />
        </div>
        {
          /* <HiddenInput
        name={`${name}.is_flagged`}
        value={on.value ? true : false}
      /> */
        }
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
