import { ComponentChildren, JSX } from 'preact'
import { CheckboxInput, NumberInput } from '../form/Inputs.tsx'
import { Measurements } from '../../types.ts'
import capitalize from '../../util/capitalize.ts'
import * as VitalsIcons from '../../components/library/icons/vitals.tsx'
import { MEASUREMENTS } from '../../shared/measurements.ts'
import { useSignal } from '@preact/signals'

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

type VitalInputProps = {
  required?: boolean
  measurement: NormalVitalInput
  vitals?: Partial<Measurements>
}

function VitalInputDefined({ Icon, name, units, required, children }: {
  name: string
  units: string
  required?: boolean
  Icon(props: JSX.SVGAttributes<SVGSVGElement>): JSX.Element
  children: ComponentChildren
}) {
  return (
    <>
      <Icon className='w-6 col-start-1' />
      <span className='col-start-2'>
        {capitalize(name)}
        {required && <sup>*</sup>}
      </span>
      {children}
      <span className='col-start-7'>{units}</span>
    </>
  )
}

function VitalInput({ required, measurement, vitals }: VitalInputProps) {
  return (
    <VitalInputDefined
      required={required}
      name={measurement}
      Icon={VitalsIcons[measurement]}
      units={MEASUREMENTS[measurement]}
    >
      <NumberInput
        required={required}
        name={`measurements.${measurement}`}
        label={null}
        value={vitals?.[measurement]?.[0]}
        className='col-start-6'
        min={0}
      />
    </VitalInputDefined>
  )
}

export function VitalsForm({ vitals }: {
  vitals: Partial<Measurements>
}) {
  const no_vitals_required = useSignal(false)

  return (
    <div className='grid gap-1.5 items-center grid-cols-[24px_max-content_1fr_max-content_min-content_max-content_max-content]'>
      {required_inputs.map((measurement) => (
        <VitalInput
          required={!no_vitals_required.value}
          measurement={measurement}
          vitals={vitals}
        />
      ))}
      {/* Blood pressure is weird because it's two measurements in one */}
      <VitalInputDefined
        required={!no_vitals_required.value}
        name='blood_pressure'
        Icon={VitalsIcons.blood_pressure}
        units='mmHg'
      >
        <NumberInput
          required={!no_vitals_required.value}
          name='measurements.blood_pressure_diastolic'
          label={null}
          value={vitals?.blood_pressure_diastolic?.[0]}
          className='col-start-4'
          min={0}
        />
        <span className='col-start-5'>/</span>
        <NumberInput
          required={!no_vitals_required.value}
          name='measurements.blood_pressure_systolic'
          label={null}
          value={vitals?.blood_pressure_systolic?.[0]}
          className='col-start-6'
          min={0}
        />
      </VitalInputDefined>

      {other_inputs.map((measurement) => (
        <VitalInput
          measurement={measurement}
          vitals={vitals}
        />
      ))}
      <CheckboxInput
        name='no_vitals_required'
        label='No vitals required at this time'
        checked={no_vitals_required.value}
        onInput={(event) =>
          no_vitals_required.value = event.currentTarget.checked}
      />
    </div>
  )
}
