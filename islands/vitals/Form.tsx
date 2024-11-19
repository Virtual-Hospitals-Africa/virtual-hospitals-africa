import { CheckboxInput, NumberInput } from '../form/Inputs.tsx'
import { Measurements } from '../../types.ts'
import capitalize from '../../util/capitalize.ts'
import * as VitalsIcons from '../../components/library/icons/vitals.tsx'
import { MEASUREMENTS } from '../../shared/measurements.ts'
import {
  addVitalsFinding,
  removeVitalsFinding,
} from '../patient-drawer/VitalsList.tsx'
import { computed, useSignal } from '@preact/signals'
import VitalsFlag from './VitalsFlag.tsx'
import { useEffect } from 'preact/hooks'
import { useRef } from 'preact/hooks'
import { useEffectAfterFirstRender } from '../_hooks/useEffectAfterFirstRender.ts'

type NormalVitalInput = Exclude<keyof typeof VitalsIcons, 'blood_pressure'>

const required_inputs: NormalVitalInput[] = [
  'height',
  'weight',
  'temperature',
]

const other_inputs: NormalVitalInput[] = [
  'blood_oxygen_saturation',
  'blood_glucose',
  'pulse',
  'respiratory_rate',
]

function VitalInput({ measurement, required, vitals, name }: {
  measurement: keyof Measurements
  required?: boolean
  vitals?: Partial<Measurements>
  name?: string
}) {
  const on = useSignal(false)

  const vital_description = computed(() => {
    // TODO function of the vital name, numeric measurement, and the units
    return measurement
  })

  const toggle = () => {
    on.value = !on.value
    if (on.value) {
      console.log('Clicking on Button')
      addVitalsFinding(vital_description.value)
    } else {
      console.log('Clicking on remove')
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
        name={`${name}.${measurement}.value`}
        label={null}
        value={vitals?.[measurement]?.[1]}
        className='col-start-6'
        min={0}
      />
      <CheckboxInput
        name={`${name}.${measurement}.is_flagged`}
        label={null}
        checked={on.value}
        className='hidden'
        value={on.value ? 'true' : 'false'}
      />
      <input
        type='text'
        name={`${name}.${measurement}.measurement_name`}
        className='hidden'
        value={measurement}
      />
      <span className='col-start-7'>{MEASUREMENTS[measurement]}</span>
    </>
  )
}

export function VitalsForm({ vitals }: {
  vitals: Partial<Measurements>
}) {
  const all_inputs: [keyof Measurements, boolean][] = [
    ...required_inputs.map((input) =>
      [input, true] as [keyof Measurements, boolean]
    ),
    ...other_inputs.map((input) =>
      [input, false] as [keyof Measurements, boolean]
    ),
  ]

  return (
    <div className='grid gap-1.5 items-center grid-cols-[24px_max-content_1fr_max-content_min-content_max-content_max-content]'>
      {all_inputs.map((measurement, index) => (
        <VitalInput
          required={measurement[1]}
          measurement={measurement[0]}
          vitals={vitals}
          name={`measurements.${index}`}
        />
      ))}
      {/* Blood pressure is weird because it's two measurements in one */}
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
