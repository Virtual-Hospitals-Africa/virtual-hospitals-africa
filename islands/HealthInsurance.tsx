import { useSignal } from '@preact/signals'
import FormSection from '../components/library/FormSection.tsx'
import FormRow from '../components/library/FormRow.tsx'
import { CheckboxInput, DateInput, TextInput } from './form/Inputs.tsx'
import { RenderedPatientInsurance } from '../types.ts'

export function HealthInsuranceSection(
  { current_insurance, previously_completed_form }: {
    current_insurance: RenderedPatientInsurance | undefined
    previously_completed_form: boolean
  },
) {
  const has_no_insurance_signal = useSignal(
    !current_insurance && previously_completed_form,
  )

  return (
    <FormSection header='Health Insurance'>
      <FormRow>
        <CheckboxInput
          name='insurance.has_no_insurance'
          label='Patient has no Health Insurance'
          checked={has_no_insurance_signal.value}
          onInput={(e) =>
            has_no_insurance_signal.value = e.currentTarget.checked}
        />
      </FormRow>

      <FormRow>
        <TextInput
          name='insurance.insurance_provider'
          label='Health Insurance Provider'
          required
          disabled={has_no_insurance_signal.value}
          value={current_insurance?.insurance_provider}
        />
      </FormRow>

      <FormRow>
        <TextInput
          name='insurance.plan_name'
          label='Plan Name'
          required
          disabled={has_no_insurance_signal.value}
          value={current_insurance?.plan_name}
        />
      </FormRow>

      <FormRow>
        <TextInput
          name='insurance.membership_number'
          label='Membership Number'
          placeholder='1234567890'
          disabled={has_no_insurance_signal.value}
          value={current_insurance?.membership_number}
        />
      </FormRow>

      <FormRow>
        <DateInput
          name='insurance.valid_from'
          label='Valid From'
          required
          disabled={has_no_insurance_signal.value}
          value={current_insurance?.valid_from}
        />
      </FormRow>

      <FormRow>
        <DateInput
          name='insurance.expire_date'
          label='Expire Date'
          required
          disabled={has_no_insurance_signal.value}
          value={current_insurance?.expire_date}
        />
      </FormRow>

      <FormRow>
        <CheckboxInput
          name='insurance.is_dependent'
          label='Patient is a dependent of Plan'
          disabled={has_no_insurance_signal.value}
          checked={current_insurance?.is_dependent}
        />
      </FormRow>
    </FormSection>
  )
}
