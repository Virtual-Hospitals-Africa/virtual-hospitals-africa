import { CheckboxInput, NumberInput } from '../form/Inputs.tsx'
import { Measurement, Measurements } from '../../types.ts'
import capitalize from '../../util/capitalize.ts'
import * as VitalsIcons from '../../components/library/icons/vitals.tsx'
import { MEASUREMENTS } from '../../shared/measurements.ts'
import {
  addVitalsFinding,
  removeVitalsFinding,
} from '../patient-drawer/VitalsList.tsx'
import { computed, useSignal } from '@preact/signals'
import VitalsFlag from './VitalsFlag.tsx'
import { HiddenInput } from '../../components/library/HiddenInput.tsx'
import { useState } from 'preact/hooks'

type NormalVitalInput = Exclude<keyof typeof VitalsIcons, 'blood_pressure'>

const required_inputs: NormalVitalInput[] = []

const all_inputs: NormalVitalInput[] = [
  'height',
  'weight',
  'temperature',
  'blood_oxygen_saturation',
  'blood_glucose',
  'pulse',
  'respiratory_rate',
  'blood_pressure_systolic',
  'blood_pressure_diastolic',
]

function VitalInput({ measurement, required, vitals, name }: {
  measurement: keyof Measurements
  required?: boolean
  vitals: Measurement<keyof Measurements>
  name?: string
}) {
  const on = useSignal(vitals.is_flagged || false)
  const [vitalsValue, setVitalsValue] = useState(vitals.value)

  const vital_description = computed(() => {
    return measurement
  })

  const toggle = () => {
    on.value = !on.value
    if (on.value === true) {
      addVitalsFinding(
        vital_description.value,
        vitalsValue || 0,
      )
    } else {
      removeVitalsFinding(vital_description.value)
    }
  }

  const Icon = VitalsIcons[measurement as keyof typeof VitalsIcons]

  return (
    <>
      <VitalsFlag
        on={on.value}
        toggle={toggle}
        description={vital_description.value}
      />
      <Icon className='w-6 col-start-2' />
      <span className='col-start-3'>
        {capitalize(measurement)}
        {required && <sup>*</sup>}
      </span>
      <NumberInput
        required={required}
        name={`${name}.value`}
        label={null}
        value={vitalsValue}
        className='col-start-6'
        min={0}
        onInput={
          // update drawer
          (e) => {
            on.value &&
              addVitalsFinding(
                vital_description.value,
                Number(e.currentTarget.value),
              )

            setVitalsValue(Number(e.currentTarget.value))
          }
        }
      />
      <CheckboxInput
        name={`${name}.is_flagged`}
        label={null}
        checked={on.value}
        className='hidden'
      />
      <HiddenInput
        name={`${name}.measurement_name`}
        value={measurement}
      />
      {
        /* <HiddenInput
        name={`${name}.is_flagged`}
        value={on.value ? true : false}
      /> */
      }
      <span className='col-start-7'>{MEASUREMENTS[measurement]}</span>
    </>
  )
}

export function VitalsForm({ vitals }: {
  vitals: Measurement<keyof Measurements>[]
}) {
  const remaining_inputs = computed(() => {
    return all_inputs.filter((input) =>
      !vitals.some((vital) => {
        return vital.measurement_name === input
      })
    )
  })

  for (const input of remaining_inputs.value) {
    vitals.push({
      measurement_name: input,
      is_flagged: false,
      units: MEASUREMENTS[input],
    })
  }

  return (
    <div className='grid gap-1.5 items-center grid-cols-[24px_max-content_1fr_max-content_min-content_max-content_max-content]'>
      {vitals.map((vital, index) => (
        <VitalInput
          required={required_inputs.includes(
            vital.measurement_name as NormalVitalInput,
          )}
          measurement={vital.measurement_name}
          vitals={vital}
          name={`measurements.${index}`}
        />
      ))}
      {/* Blood pressure is weird because it's two measurements in one */}
      {
        /*
        Ways to handle blood pressure
        1. Have two inputs for diastolic and systolic
        */
      }
      {
        /* <VitalInputDefined
        required={!no_vitals_required.value}
        measurement='blood_pressure'
        Icon={VitalsIcons.blood_pressure}
        units='mmHg'
      >
        <NumberInput
          required={!no_vitals_required.value}
          name='measurements.blood_pressure_diastolic'
          label={null}
          value={vitals?.blood_pressure_diastolic?.[1]}
          className='col-start-4'
          min={0}
        />
        <span className='col-start-5'>/</span>
        <NumberInput
          required={!no_vitals_required.value}
          name='measurements.blood_pressure_systolic'
          label={null}
          value={vitals?.blood_pressure_systolic?.[1]}
          className='col-start-6'
          min={0}
        />
      </VitalInputDefined> */
      }
    </div>
  )
}
