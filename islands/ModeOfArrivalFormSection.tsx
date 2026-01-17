import { computed, useSignal } from '@preact/signals'
import FormSection from '../components/library/FormSection.tsx'
import { RadioButtonGroup } from '../components/library/RadioButtonGroup.tsx'
import { NumberInput } from './form/inputs/number.tsx'
import { LocalTime } from './LocalTime.tsx'
import { Label } from '../components/library/Label.tsx'
import { TextInput } from './form/inputs/text.tsx'
import cls from '../util/cls.ts'

const indented_label_class_name = '-mt-4 pl-7'

function EnRouteETA() {
  const eta_minutes_signal = useSignal<number>(10)

  const estimated_arrival_time = computed(() => new Date(Date.now() + eta_minutes_signal.value * 60 * 1000))

  return (
    <Label className={indented_label_class_name}>
      Estimated Time of Arrival*
      <div className='flex items-center gap-2'>
        <NumberInput
          className='max-w-50'
          name='eta_minutes'
          label=''
          value={eta_minutes_signal.value}
          min={1}
          suffix='minutes from now'
          onInput={(e) => eta_minutes_signal.value = parseInt(e.currentTarget.value) || 0}
          required
        />
        <span className='text-md text-gray-600'>
          ≈ <LocalTime timestamp={estimated_arrival_time.value} expected_time_range='any' />
        </span>
      </div>
    </Label>
  )
}

function LocationInput() {
  return <TextInput className={cls(indented_label_class_name, 'max-w-150')} name='location' required />
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
          {
            id: 'just_arrived',
            name: 'Just arrived',
            description: [
              'The patient is here without advance notice.',
              'The emergency department will be notified to come to reception immediately.',
            ],
          },
          { id: 'needs_transport', name: 'Needs transport', description: `The patient needs emergency transport to the clinic.` },
          { id: 'en_route_personal', name: 'En route personally', description: `${on_their_way} on their own.` },
          { id: 'en_route_ambulance', name: 'En route in emergency transport', description: `${on_their_way} in an ambulance or other emergency transport.` },
        ]}
      />
      {mode_of_arrival_signal.value.startsWith('en_route') && <EnRouteETA />}
      {mode_of_arrival_signal.value === 'needs_transport' && <LocationInput />}
    </FormSection>
  )
}
