import FormRow from '../components/library/FormRow.tsx'
import { /* Select,*/ TextInput } from './form/Inputs.tsx'
import { CountryAddressTree, PatientIntake } from '../types.ts'
// import { computed, effect, useSignal } from '@preact/signals'
// import { assertEquals } from 'std/assert/assert_equals.ts'

// TODO: bring back address tree usage
// export default function AddressForm(
//   { address }: {
//     address: Partial<PatientIntake['address']>
//     country_address_tree: CountryAddressTree
//   },
// ) {
//   assertEquals(country_address_tree.length, 1, 'Only Zimbabwe supported')

//   const province_id = useSignal(address.province_id)
//   const district_id = useSignal(address.district_id)
//   const ward_id = useSignal(address.ward_id)

//   const { provinces } = country_address_tree[0]

//   const districts = computed(() =>
//     province_id.value
//       ? provinces.find((province) => province.id === province_id.value)!
//         .districts
//       : []
//   )

//   const wards = computed(() =>
//     district_id.value
//       ? districts.value.find((district) => district.id === district_id.value)!
//         .wards
//       : []
//   )

//   effect(() => {
//     if (districts.value.length === 1) district_id.value = districts.value[0].id
//   })
//   effect(() => {
//     if (wards.value.length === 1) ward_id.value = wards.value[0].id
//   })

//   return (
//     <section>
//       <FormRow>
//         <input
//           type='hidden'
//           name='address.country_name'
//           value='Zimbabwe'
//         />
//         <Select
//           name='address.province_id'
//           required
//           label='Province'
//           onChange={(e) => {
//             const selectedProvince = e?.currentTarget?.value
//             if (!selectedProvince) return
//             ward_id.value = undefined
//             district_id.value = undefined
//             province_id.value = selectedProvince
//           }}
//         >
//           <option value=''>Select</option>
//           {provinces.map((province) => (
//             <option
//               value={province.id}
//               selected={province_id.value === province.id}
//             >
//               {province.name}
//             </option>
//           ))}
//         </Select>
//       </FormRow>
//       <FormRow>
//         <Select
//           name='address.district_id'
//           required
//           label='District'
//           onChange={(e) => {
//             const selectedDistrict = e?.currentTarget?.value
//             if (!selectedDistrict) return
//             ward_id.value = undefined
//             district_id.value = selectedDistrict
//           }}
//         >
//           <option value=''>Select</option>
//           {districts.value.map((district) => (
//             <option
//               value={district.id}
//               selected={district_id.value === district.id}
//             >
//               {district.name}
//             </option>
//           ))}
//         </Select>
//         <Select
//           name='address.ward_id'
//           required
//           label='City/Town/Ward'
//           onChange={(e) => {
//             const selectedWard = e?.currentTarget?.value
//             if (!selectedWard) return
//             ward_id.value = selectedWard
//           }}
//         >
//           <option value=''>Select</option>
//           {wards.value.map((ward) => (
//             <option value={ward.id} selected={ward_id.value === ward.id}>
//               {ward.name}
//             </option>
//           ))}
//         </Select>
//       </FormRow>
//       <FormRow>
//         <TextInput
//           name='address.street'
//           label='Street Address'
//           value={address?.street}
//         />
//       </FormRow>
//     </section>
//   )
// }

export default function AddressForm(
  { address }: {
    address: Partial<PatientIntake['address']>
    country_address_tree: CountryAddressTree
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
