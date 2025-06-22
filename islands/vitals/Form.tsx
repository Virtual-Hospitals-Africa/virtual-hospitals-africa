import { CheckboxInput, UnitInput } from '../form/Inputs.tsx'
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
import BloodPressureInput from './BloodPressureInput.tsx' //bloodpressure

type NormalVitalInput = Exclude<keyof typeof VitalsIcons, 'blood_pressure'>

const required_inputs: NormalVitalInput[] = [
  //add required input
  'height',
  'weight',
  'temperature',
  'blood_pressure_systolic',
  'blood_pressure_diastolic',
  'pulse',
]

//add optional input
const optional_inputs: NormalVitalInput[] = [
  'blood_glucose',
  'blood_oxygen_saturation',
  'respiratory_rate',
]

const all_inputs: NormalVitalInput[] = [
  'height',
  'weight',
  'temperature',
  'blood_pressure_systolic',
  'blood_pressure_diastolic',
  'pulse',
  'blood_glucose',
  'blood_oxygen_saturation',
  'respiratory_rate',
]

function VitalInput(
  { measurement, required, vitals, name, showFlag, showIcon = true }: {
    measurement: keyof Measurements
    required?: boolean
    vitals: Measurement<keyof Measurements>
    name?: string
    showFlag?: boolean //add control flag
    showIcon?: boolean //add control icon
  },
) {
  const on = useSignal(vitals.is_flagged || false)
  const [vitalsValue, setVitalsValue] = useState(vitals.value)

  const vital_description = computed(() => {
    return measurement //remove '//'
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
    <div className='grid grid-cols-[auto_minmax(80px,100px)] items-center w-full gap-3 py-2'>
      <div className='flex flex-row items-center gap-3'>
        {showFlag && ( //add showFlag
          <VitalsFlag
            on={on.value}
            toggle={toggle}
            description={vital_description.value}
          />
        )}
        {showIcon && Icon && <Icon className='w-5 h-5 text-blue-500' />}
        {
          /* <div className='align-middle'>
        </div> */
        }
        <span className='text-gray-700 min-w-[120px] text-sm'>
          {capitalize(measurement.replace(/_/g, ' '))}
          {required && <span className='text-red-500 ml-1'>*</span>}
        </span>
      </div>
      <div className='flex items-center'>
        <UnitInput
          required={required}
          name={`${name}.value`}
          label={null}
          value={vitalsValue}
          className='w-full max-w-[100px] text-right text-sm'
          min={0}
          onInput={
            // update drawer
            (e) => {
              if (showFlag && on.value) {
                addVitalsFinding(
                  vital_description.value,
                  Number(e.currentTarget.value),
                )
              }
              setVitalsValue(Number(e.currentTarget.value))
            }
          }
          units={MEASUREMENTS[measurement]}
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
      </div>
    </div>
    /*{
         <HiddenInput
        name={`${name}.is_flagged`}
        value={on.value ? true : false}
      />
      }
    </div>*/
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
  //separate required & optional
  const requiredVitals = vitals.filter((vital) =>
    required_inputs.includes(vital.measurement_name as NormalVitalInput) &&
    !['blood_pressure_systolic', 'blood_pressure_diastolic'].includes(
      vital.measurement_name,
    )
  )

  const optionalVitals = vitals.filter((vital) =>
    optional_inputs.includes(vital.measurement_name as NormalVitalInput)
  )

  //blood pressure
  const systolicVital = vitals.find((v) =>
    v.measurement_name === 'blood_pressure_systolic'
  )
  const diastolicVital = vitals.find((v) =>
    v.measurement_name === 'blood_pressure_diastolic'
  )

  return (
    <div className='bg-white rounded-lg p-4 w-full max-w-lg mx-auto overflow-hidden'>
      <h2 className='text-2xl font-bold text-gray-900 mb-4'>Vitals</h2>

      {/* required */}
      <div className='mb-6'>
        <h3 className='text-xs font-medium text-gray-600 mb-3 uppercase tracking-wide'>
          Required*
        </h3>
        <div className='space-y-1'>
          {requiredVitals
            .sort((a, b) =>
              a.measurement_name.localeCompare(b.measurement_name)
            )
            .map((vital, index) => (
              <VitalInput
                key={vital.measurement_name}
                required={true}
                measurement={vital.measurement_name}
                vitals={vital}
                name={`measurements.${vitals.indexOf(vital)}`}
                showFlag={false}
                showIcon={false}
              />
            ))}

          {/* blood pressure */}
          {systolicVital && diastolicVital && (
            <BloodPressureInput
              vitals={{
                systolic: systolicVital as Measurement<
                  'blood_pressure_systolic'
                >,
                diastolic: diastolicVital as Measurement<
                  'blood_pressure_diastolic'
                >,
              }}
              name='measurements.blood_pressure'
            />
          )}
        </div>
      </div>

      {/* Optional Section */}
      <div className='mb-6'>
        <h3 className='text-xs font-medium text-gray-600 mb-3 uppercase tracking-wide'>
          Optional
        </h3>
        <div className='space-y-1'>
          {optionalVitals
            .sort((a, b) =>
              a.measurement_name.localeCompare(b.measurement_name)
            )
            .map((vital, index) => (
              <VitalInput
                key={vital.measurement_name}
                required={false}
                measurement={vital.measurement_name}
                vitals={vital}
                name={`measurements.${vitals.indexOf(vital)}`}
                showFlag={false}
                showIcon={false}
              />
            ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className='flex justify-between items-center pt-4 border-t'>
        <button className='flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 text-sm'>
          <span>←</span> Back
        </button>
        <button className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm'>
          Next <span>→</span>
        </button>
      </div>

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
