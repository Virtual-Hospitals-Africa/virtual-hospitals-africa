import { NumberInput, SelectWithOptions } from '../form/Inputs.tsx'
import { Duration } from '../../types.ts'
import { assert } from 'std/assert/assert.ts'

export function DurationInput(
  { value, onChange }: {
    value: Duration
    onChange(duration: Duration): void
  },
) {
  return (
    <div className='flex flex-col md:flex-row md:items-center gap-2'>
      <NumberInput
        name={null}
        label='Duration'
        min={0}
        max={999}
        className='w-24'
        value={value.duration}
        onInput={(e) => {
          onChange({
            duration: Number(e.currentTarget.value),
            duration_unit: value.duration_unit,
          })
        }}
      />
      <SelectWithOptions
        name={null}
        label=' '
        value={value.duration_unit}
        className='w-24'
        options={[
          {
            value: 'days',
            label: value.duration === 1 ? 'day' : 'days',
          },
          {
            value: 'weeks',
            label: value.duration === 1 ? 'week' : 'weeks',
          },
          {
            value: 'months',
            label: value.duration === 1 ? 'month' : 'months',
          },
          {
            value: 'years',
            label: value.duration === 1 ? 'year' : 'years',
          },
        ]}
        onChange={(e) => {
          assert(
            e.currentTarget.value === 'days' ||
              e.currentTarget.value === 'weeks' ||
              e.currentTarget.value === 'months' ||
              e.currentTarget.value === 'years',
          )
          onChange({
            duration: value.duration,
            duration_unit: e.currentTarget.value,
          })
        }}
      />
    </div>
  )
}
