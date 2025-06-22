// islands/vitals/BloodPressureInput.tsx
import { UnitInput } from '../form/Inputs.tsx'
import { Measurement } from '../../types.ts'
import { useState } from 'preact/hooks'
import { useSignal } from '@preact/signals'
import { HiddenInput } from '../../components/library/HiddenInput.tsx'
import {
  addVitalsFinding,
  removeVitalsFinding,
} from '../patient-drawer/VitalsList.tsx'

export default function BloodPressureInput({
  vitals,
  name,
}: {
  vitals: {
    systolic: Measurement<'blood_pressure_systolic'>
    diastolic: Measurement<'blood_pressure_diastolic'>
  }
  name: string
}) {
  return (
    <div className='grid grid-cols-[120px_1fr] items-center gap-2 py-2'>
      <span className='text-sm font-medium text-gray-700'>
        Blood Pressure<span className='text-red-500 ml-1'>*</span>
      </span>
      <div className='flex items-center gap-2'>
        <UnitInput
          required
          name={`${name}.systolic.value`}
          label={null}
          value={vitals.systolic.value}
          units='mmHg'
          inputClassName='w-[80px] max-w-[100px] text-right'
        />
        <span>/</span>
        <UnitInput
          required
          name={`${name}.diastolic.value`}
          label={null}
          value={vitals.diastolic.value}
          units='mmHg'
          inputClassName='w-[80px] max-w-[100px] text-right'
        />
      </div>
    </div>
  )
}
