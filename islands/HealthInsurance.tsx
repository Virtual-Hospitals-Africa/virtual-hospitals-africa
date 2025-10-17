import { useSignal } from '@preact/signals'
import FormSection from '../components/library/FormSection.tsx'
import FormRow from '../components/library/FormRow.tsx'
import { CheckboxInput, DateInput, TextInput } from './form/Inputs.tsx'

export function HealthInsuranceSection({
  insurance_provider,
  plan_name,
  membership_number,
  valid_from,
  expire_date,
  is_dependent,
}: {
  insurance_provider?: string 
  plan_name?: string | null
  membership_number?: string
  valid_from?: string
  expire_date?: string
  is_dependent?: boolean
}) {
  const hasInsurance = !!(insurance_provider || plan_name || membership_number)
  const has_no_insurance_signal = useSignal(!hasInsurance)
  const is_dependent_signal = useSignal(is_dependent || false)

  return (
    <FormSection header='Health Insurance'>
      <FormRow>
        <CheckboxInput
          name='has_no_insurance'
          label='Patient has no Health Insurance'
          checked={has_no_insurance_signal.value}
          onInput={(e) =>
            has_no_insurance_signal.value = e.currentTarget.checked}
        />
      </FormRow>

      <FormRow>
        <TextInput
          name='insurance_provider'
          label='Health Insurance Provider'
          required
          disabled={has_no_insurance_signal.value}
          value={insurance_provider ?? undefined}
        />
      </FormRow>

      <FormRow>
        <TextInput
          name='plan_name'
          label='Plan Name'
          required
          disabled={has_no_insurance_signal.value}
          value={plan_name ?? undefined}
        />
      </FormRow>

      <FormRow>
        <TextInput
          name='membership_number'
          label='Membership Number'
          placeholder= '1234567890'
          disabled={has_no_insurance_signal.value}
          value={membership_number ?? undefined}
        />
      </FormRow>

      <FormRow>
        <DateInput
          name='valid_from'
          label='Valid From'
          required
          disabled={has_no_insurance_signal.value}
          value={valid_from ?? undefined}
        />
      </FormRow>

      <FormRow>
        <DateInput
          name='expire_date'
          label='Expire Date'
          required
          disabled={has_no_insurance_signal.value}
          value={expire_date ?? undefined}
        />
      </FormRow>

      <FormRow>
        <CheckboxInput
          name='is_dependent'
          label='Patient is a dependent of Plan'
          disabled={has_no_insurance_signal.value}
          checked={is_dependent_signal.value}
          onInput={(e) =>
            is_dependent_signal.value = e.currentTarget.checked}
        />
      </FormRow>
    </FormSection>
  )
}