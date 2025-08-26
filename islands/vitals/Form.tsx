import { UnitInput } from '../form/Inputs.tsx'
import { Maybe, MostRecentVitalMeasurement, VitalObservationFormInputDefition } from '../../types.ts'
import capitalize from '../../util/capitalize.ts'
import { HiddenInput } from '../../components/library/HiddenInput.tsx'
import generateUUID from '../../util/uuid.ts'


function VitalInput({ vital, name, most_recent_patient_observation }: {
  vital: VitalObservationFormInputDefition
  name: string
  most_recent_patient_observation: Maybe<MostRecentVitalMeasurement>
}) {
  // const on = useSignal(vitals.is_flagged || false)
  // const [vitalsValue, setVitalsValue] = useState(vitals.value)

  // const vital_description = computed(() => {
  //   return measurement
  // })

  // TODO use this 
  // most_recent_patient_observation?.value_display

  return (
    <div className='flex justify-between w-full'>
      <div className='flex flex-row gap-2'>
        {/* <VitalsFlag
          on={on.value}
          toggle={toggle}
          description={vital_description.value}
        /> */}
        {
          /* <div className='align-middle'>
        </div> */
        }
        <span class='flex items-center'>
          {capitalize(vital.label)}
          {vital.required && <sup>*</sup>}
        </span>
      </div>
      <div className='min-w-30 max-w-30'>
        <UnitInput
          required={vital.required}
          name={`${name}.value`}
          label={null}
          value={null}
          className='col-start-6 justify-end'
          min={0}
          units={vital.units}
        />
        {/* <CheckboxInput
          name={`${name}.is_flagged`}
          label={null}
          checked={on.value}
          className='hidden'
        /> */}
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
  )
}

export function VitalsForm({ vital_observations_for_this_encounter, most_recent_patient_vitals }: {
  vital_observations_for_this_encounter: VitalObservationFormInputDefition[],
  most_recent_patient_vitals: MostRecentVitalMeasurement[],
}) {

  const observation_id = generateUUID()

  return (
    <div className='flex flex-col gap-1'>
      {vital_observations_for_this_encounter.map((vital) => (
        <VitalInput
          vital={vital}
          most_recent_patient_observation={null}
          name={`observations.${observation_id}`}
        />
      ))}
    </div>
  )
}
