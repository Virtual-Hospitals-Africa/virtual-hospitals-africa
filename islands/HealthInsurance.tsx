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
  has_no_insurance,
}: {
  insurance_provider?: string | null
  plan_name?: string | null
  membership_number?: string | null
  valid_from?: Date | null
  expire_date?: Date | null
  is_dependent?: boolean | null
  has_no_insurance?: boolean | null
}) {
  const has_no_insurance_signal = useSignal(has_no_insurance || false)
  const is_dependent_signal = useSignal(is_dependent || false)

  const validFromString = valid_from instanceof Date 
    ? valid_from.toISOString().split('T')[0] 
    : valid_from || undefined
  const expireDateString = expire_date instanceof Date
    ? expire_date.toISOString().split('T')[0]
    : expire_date || undefined

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

      {!has_no_insurance_signal.value && (
        <>
          <FormRow>
            <TextInput
              name='insurance_provider'
              label='Health Insurance Provider'
              required
              value={insurance_provider ?? undefined}
            />
          </FormRow>

          <FormRow>
            <TextInput
              name='plan_name'
              label='Plan Name'
              required
              value={plan_name ?? undefined}
            />
          </FormRow>

          <FormRow>
            <TextInput
              name='membership_number'
              label='Membership Number'
              placeholder='0123456789'
              value={membership_number ?? undefined}
            />
          </FormRow>

          <FormRow>
            <DateInput
              name='valid_from'
              label='Valid From'
              required
              value={validFromString}
            />
          </FormRow>

          <FormRow>
            <DateInput
              name='expire_date'
              label='Expire Date'
              required
              value={expireDateString}
            />
          </FormRow>

          <FormRow>
            <CheckboxInput
              name='is_dependent'
              label='Patient is a dependent of Plan'
              checked={is_dependent_signal.value}
              onInput={(e) =>
                is_dependent_signal.value = e.currentTarget.checked}
            />
          </FormRow>
        </>
      )}
    </FormSection>
  )
}