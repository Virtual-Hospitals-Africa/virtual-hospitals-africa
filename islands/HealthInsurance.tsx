import { useSignal } from '@preact/signals'
import FormSection from '../components/library/FormSection.tsx'
import FormGrid from '../components/library/FormGrid.tsx'

import { RenderedPatientInsurance } from '../types.ts'
import { CheckboxInput } from './form/inputs/checkbox.tsx'
import { DateInput } from './form/inputs/date.tsx'
import { TextInput } from './form/inputs/text.tsx'

export function HealthInsuranceSection(
  { current_insurance, previously_completed_form }: {
    current_insurance: RenderedPatientInsurance | undefined
    previously_completed_form: boolean
  },
) {
  const has_no_insurance_signal = useSignal(
    !current_insurance && previously_completed_form,
  )
  const is_dependent_signal = useSignal(
    current_insurance?.is_dependent ?? false,
  )

  return (
    <FormSection header='Current Insurance'>
      <CheckboxInput
        name='insurance.has_no_insurance'
        label='Patient is not currently covered by insurance'
        checked={has_no_insurance_signal.value}
        onInput={(e) => has_no_insurance_signal.value = e.currentTarget.checked}
      />

      <FormGrid columns={2}>
        <TextInput
          name='insurance.insurance_provider'
          label='Provider'
          placeholder='Search Health Insurance'
          required
          disabled={has_no_insurance_signal.value}
          value={current_insurance?.insurance_provider}
        />
        <TextInput
          name='insurance.plan_name'
          label='Plan Name'
          placeholder='Select Plan'
          required
          disabled={has_no_insurance_signal.value}
          value={current_insurance?.plan_name}
        />
      </FormGrid>

      <FormGrid columns={3}>
        <TextInput
          name='insurance.membership_number'
          label='Membership Number'
          placeholder='0000-000-0000'
          disabled={has_no_insurance_signal.value}
          value={current_insurance?.membership_number}
        />
        <DateInput
          name='insurance.valid_from'
          label='Valid From'
          required
          disabled={has_no_insurance_signal.value}
          value={current_insurance?.valid_from}
        />
        <DateInput
          name='insurance.expire_date'
          label='Expire Date'
          required
          disabled={has_no_insurance_signal.value}
          value={current_insurance?.expire_date}
        />
      </FormGrid>

      <CheckboxInput
        name='insurance.is_dependent'
        label='Patient is listed as a dependent on this insurance plan'
        disabled={has_no_insurance_signal.value}
        checked={is_dependent_signal.value}
        onInput={(e) => is_dependent_signal.value = e.currentTarget.checked}
      />

      {is_dependent_signal.value && (
        <TextInput
          name='insurance.plan_holder'
          label='Plan holder'
          placeholder='Name of insurance plan holder'
          required
          disabled={has_no_insurance_signal.value}
        />
      )}
    </FormSection>
  )
}
