import FormRow from './form/Row.tsx'
import { Select, TextInput } from './form/Inputs.tsx'
import { CountryAddressTree, PatientIntake } from '../types.ts'
import { computed, effect, useSignal } from '@preact/signals'
import { assertEquals } from 'std/assert/assert_equals.ts'

export default function AddressForm(
  { address, country_address_tree }: {
    address: Partial<PatientIntake['address']>
    country_address_tree: CountryAddressTree
  },
) {
  assertEquals(country_address_tree.length, 1, 'Only Zimbabwe supported')

  const province_id = useSignal(address.province_id)
  const district_id = useSignal(address.district_id)
  const ward_id = useSignal(address.ward_id)
  const suburb_id = useSignal(address.suburb_id)

  const { provinces } = country_address_tree[0]

  const districts = computed(() =>
    province_id.value
      ? provinces.find((province) => province.id === province_id.value)!
        .districts
      : []
  )

  const wards = computed(() =>
    district_id.value
      ? districts.value.find((district) => district.id === district_id.value)!
        .wards
      : []
  )

  const suburbs = computed(() =>
    ward_id.value
      ? wards.value.find((ward) => ward.id === ward_id.value)!.suburbs
      : []
  )

  effect(() => {
    if (districts.value.length === 1) district_id.value = districts.value[0].id
  })
  effect(() => {
    if (wards.value.length === 1) ward_id.value = wards.value[0].id
  })
  effect(() => {
    if (suburbs.value.length === 1) suburb_id.value = suburbs.value[0].id
  })

  return (
    <section>
      <FormRow>
        <input
          type='hidden'
          name='address.country_id'
          value='10000000-0000-0000-0000-000000000000'
        />
        <Select
          name='address.province_id'
          required
          label='Province'
          onChange={(e) => {
            const selectedProvince = e?.currentTarget?.value
            if (!selectedProvince) return
            suburb_id.value = undefined
            ward_id.value = undefined
            district_id.value = undefined
            province_id.value = selectedProvince
          }}
        >
          <option value=''>Select</option>
          {provinces.map((province) => (
            <option
              value={province.id}
              selected={province_id.value === province.id}
            >
              {province.name}
            </option>
          ))}
        </Select>
      </FormRow>
      <FormRow>
        <Select
          name='address.district_id'
          required
          label='District'
          onChange={(e) => {
            const selectedDistrict = e?.currentTarget?.value
            if (!selectedDistrict) return
            suburb_id.value = undefined
            ward_id.value = undefined
            district_id.value = selectedDistrict
          }}
        >
          <option value=''>Select</option>
          {districts.value.map((district) => (
            <option
              value={district.id}
              selected={district_id.value === district.id}
            >
              {district.name}
            </option>
          ))}
        </Select>
        <Select
          name='address.ward_id'
          required
          label='City/Town/Ward'
          onChange={(e) => {
            const selectedWard = e?.currentTarget?.value
            if (!selectedWard) return
            suburb_id.value = undefined
            ward_id.value = selectedWard
          }}
        >
          <option value=''>Select</option>
          {wards.value.map((ward) => (
            <option value={ward.id} selected={ward_id.value === ward.id}>
              {ward.name}
            </option>
          ))}
        </Select>
      </FormRow>
      <FormRow>
        {suburbs.value.length > 0 && (
          <Select
            name='address.suburb_id'
            required
            label='Suburb'
            onChange={(e) => {
              const selectedSuburb = e?.currentTarget?.value
              if (!selectedSuburb) return
              suburb_id.value = selectedSuburb
            }}
          >
            <option value=''>Select</option>
            {suburbs.value.map((suburb) => (
              suburb.name && suburb.id &&
              ((
                <option
                  value={suburb.id}
                  selected={suburb_id.value === suburb.id}
                >
                  {suburb.name}
                </option>
              ))
            ))}
          </Select>
        )}
        <TextInput
          name='address.street'
          label='Street Address'
          value={address?.street}
        />
      </FormRow>
    </section>
  )
}
