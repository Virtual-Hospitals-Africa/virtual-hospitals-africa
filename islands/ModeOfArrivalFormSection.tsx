import { computed, useSignal } from '@preact/signals'
import FormSection from '../components/library/FormSection.tsx'
import { RadioButtonGroup } from '../components/library/RadioButtonGroup.tsx'
import { NumberInput } from './form/inputs/number.tsx'
import { LocalTime } from './LocalTime.tsx'
import { Label } from '../components/library/Label.tsx'

function EnRouteETA() {
  const eta_minutes_signal = useSignal<number>(10)

  const estimated_arrival_time = computed(() => new Date(Date.now() + eta_minutes_signal.value * 60 * 1000))

  return (
    <Label className='-mt-4 pl-7'>
      Estimated Time of Arrival
      <div className='flex items-center gap-4'>
        <NumberInput
          className='max-w-50'
          name='eta_minutes'
          label=''
          value={eta_minutes_signal.value}
          min={1}
          suffix='minutes from now'
          onInput={(e) => eta_minutes_signal.value = parseInt(e.currentTarget.value) || 0}
        />
        <span className='text-md text-gray-600'>
          = <LocalTime timestamp={estimated_arrival_time.value} expected_time_range='any' />
        </span>
      </div>
    </Label>
  )
}

export function ModeOfArrivalFormSection({ organization_category }: { organization_category: string | null }) {
  const mode_of_arrival_signal = useSignal('')
  const on_their_way = `The patient is on their way to the ${organization_category?.toLowerCase() || 'facility'}`


  return (
    <FormSection header='Arrival'>
      <RadioButtonGroup
        name='mode_of_arrival'
        orientation='vertical'
        onInput={(e) => mode_of_arrival_signal.value = e.currentTarget.value}
        options={[
          { id: 'just_arrived', name: 'Just arrived', description: 'The patient is here without advance notice' },
          { id: 'en_route_personal', name: 'En route in personal vehicle', description: `${on_their_way} in emergency transport` },
          { id: 'en_route_ambulance', name: 'En route in emergency transport', description: `${on_their_way} in an ambulance or other emergency transport` },
        ]}
      />
      {mode_of_arrival_signal.value !== 'just_arrived' && <EnRouteETA />}
    </FormSection>
  )
}
