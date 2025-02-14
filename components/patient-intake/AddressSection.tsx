import FormRow from '../library/FormRow.tsx'
import { TextInput } from '../../islands/form/Inputs.tsx'
import { PatientIntake } from '../../types.ts'

export default function AddressSection(
  { address }: {
    address: Partial<PatientIntake['address']>
    // country_address_tree: CountryAddressTree
  },
) {
  return (
    <section>
      <FormRow>
        <TextInput
          name='address.street'
          label='Street Address'
          value={address?.street}
        />
      </FormRow>
      <FormRow>
        <TextInput
          required
          name='address.locality'
          label='Ward (City/Village)'
          value={address?.locality}
        />
      </FormRow>
      <FormRow>
        <TextInput
          name='address.administrative_area_level_2'
          label='District'
          value={address?.administrative_area_level_2}
        />
      </FormRow>
      <FormRow>
        <TextInput
          name='address.administrative_area_level_1'
          label='Province'
          value={address?.administrative_area_level_1}
        />
      </FormRow>
      <FormRow>
        <input
          type='hidden'
          name='address.country'
          value='Zimbabwe'
        />
      </FormRow>
    </section>
  )
}
