import { computed, useSignal } from '@preact/signals'
import FormSection from '../components/library/FormSection.tsx'
import { RadioButtonGroup } from '../components/library/RadioButtonGroup.tsx'
import { NumberInput } from './form/inputs/number.tsx'
import { LocalTime } from './LocalTime.tsx'

function EnRouteETA() {
  const eta_minutes_signal = useSignal<number>(10)

  const estimated_arrival_time = computed(() => new Date(Date.now() + eta_minutes_signal.value * 60 * 1000))

  return (
    <div className='-mt-4 flex items-end gap-4 pl-7'>
      <NumberInput
        className='max-w-50'
        name='eta_minutes'
        label='Estimated Time of Arrival'
        value={eta_minutes_signal.value}
        min={1}
        suffix='minutes from now'
        onInput={(e) => eta_minutes_signal.value = parseInt(e.currentTarget.value) || 0}
      />
      <span className='text-sm text-gray-600 pb-3'>
        = <LocalTime timestamp={estimated_arrival_time.value} expected_time_range='any' />
      </span>
    </div>
  )
}

export function ModeOfArrivalFormSection({ organization_category }: { organization_category: string | null }) {
  const mode_of_arrival_signal = useSignal('')

  return (
    <FormSection header='Arrival'>
      <RadioButtonGroup
        name='mode_of_arrival'
        orientation='vertical'
        onInput={(e) => mode_of_arrival_signal.value = e.currentTarget.value}
        options={[
          { id: 'just_arrived', name: 'Just arrived', description: 'The patient is here without advance notice' },
          { id: 'en_route', name: 'En route', description: `The patient is on their way to the ${organization_category?.toLowerCase() || 'facility'}` },
        ]}
      />
      {mode_of_arrival_signal.value === 'en_route' && <EnRouteETA />}
    </FormSection>
  )
}
