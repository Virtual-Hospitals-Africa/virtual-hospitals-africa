import { useMemo, useRef, useState } from 'preact/hooks'
import FormRow from '../components/library/form/Row.tsx'
import { SelectInput, TextInput } from '../components/library/form/Inputs.tsx'
import { AdminDistricts } from '../types.ts'
import clearRefsValue from '../util/clearRefsValue.ts'

function getUniqueCountries(adminDistricts: AdminDistricts[]) {
  const countriesSet = new Set<AdminDistricts['countryId']>()
  const countries: {
    id: AdminDistricts['countryId']
    name: AdminDistricts['countryName']
  }[] = []
  for (const adminDistrict of adminDistricts) {
    if (!countriesSet.has(adminDistrict.countryId)) {
      countriesSet.add(adminDistrict.countryId)
      countries.push({
        id: adminDistrict.countryId,
        name: adminDistrict.countryName,
      })
    }
  }
  return countries
}

export function filterDistrictsByKey<
  T,
  K extends keyof T,
  U extends keyof T,
  V extends keyof T,
>(
  itemId: U,
  itemName: V,
  adminDistricts: T[],
  filterKey: K,
  filterValue?: T[K],
) {
  if (!filterValue) return []
  const itemsSet = new Set<T[U]>()
  const uniqueItems: {
    id: T[U]
    name: T[V]
  }[] = []
  for (const adminDistrict of adminDistricts) {
    if (
      (adminDistrict[filterKey] !== filterValue) ||
      (itemsSet.has(adminDistrict[itemId])) ||
      (!adminDistrict[itemId] || !adminDistrict[itemName])
    ) continue
    itemsSet.add(adminDistrict[itemId])
    uniqueItems.push({
      id: adminDistrict[itemId],
      name: adminDistrict[itemName],
    })
  }
  return uniqueItems
}

export default function PatientAddressForm(
  { adminDistricts = [] }: { adminDistricts?: AdminDistricts[] },
) {
  const suburbInputRef = useRef<HTMLSelectElement>(null)
  const wardInputRef = useRef<HTMLSelectElement>(null)
  const districtInputRef = useRef<HTMLSelectElement>(null)
  const provinceInputRef = useRef<HTMLSelectElement>(null)
  const [selectedCountry, setSelectedCountry] = useState<
    AdminDistricts['countryId']
  >()
  const [selectedProvinces, setSelectedProvinces] = useState<
    AdminDistricts['provinceId']
  >()
  const [selectedDistrict, setSelectedDistrict] = useState<
    AdminDistricts['districtId']
  >()
  const [selectedWard, setSelectedWard] = useState<AdminDistricts['wardId']>()
  const countries = useMemo(() => getUniqueCountries(adminDistricts), [])
  const provinces = useMemo(() =>
    filterDistrictsByKey(
      'provinceId',
      'provinceName',
      adminDistricts,
      'countryId',
      selectedCountry,
    ), [selectedCountry])

  const districts = useMemo(() =>
    filterDistrictsByKey(
      'districtId',
      'districtName',
      adminDistricts,
      'provinceId',
      selectedProvinces,
    ), [selectedProvinces])
  const wards = useMemo(() =>
    filterDistrictsByKey(
      'wardId',
      'wardName',
      adminDistricts,
      'districtId',
      selectedDistrict,
    ), [selectedDistrict])
  const suburbs = useMemo(() =>
    filterDistrictsByKey(
      'suburbId',
      'suburbName',
      adminDistricts,
      'wardId',
      selectedWard,
    ), [selectedWard])

  return (
    <section className='mb-7'>
      <FormRow>
        <SelectInput
          name='country'
          required
          label='Country'
          onChange={(e) => {
            const selectedCountry = e?.currentTarget?.value
            if (!selectedCountry) return
            setSelectedCountry(Number(selectedCountry))
            setSelectedProvinces(undefined)
            setSelectedDistrict(undefined)
            setSelectedWard(undefined)
            clearRefsValue(
              provinceInputRef,
              districtInputRef,
              wardInputRef,
              suburbInputRef,
            )
          }}
        >
          <option value=''>Select</option>
          {countries.map((country) => (
            <option value={country.id}>
              {country.name}
            </option>
          ))}
        </SelectInput>
        <SelectInput
          name='province'
          required
          label='Province'
          ref={provinceInputRef}
          onChange={(e) => {
            const selectedProvince = e?.currentTarget?.value
            if (!selectedProvince) return
            setSelectedProvinces(Number(selectedProvince))
            setSelectedDistrict(undefined)
            setSelectedWard(undefined)
            clearRefsValue(districtInputRef, wardInputRef, suburbInputRef)
          }}
        >
          <option value=''>Select</option>
          {provinces.map((province) => (
            <option value={province.id}>
              {province.name}
            </option>
          ))}
        </SelectInput>
      </FormRow>
      <FormRow>
        <SelectInput
          name='district'
          required
          label='District'
          ref={districtInputRef}
          onChange={(e) => {
            const selectedDistrict = e?.currentTarget?.value
            if (!selectedDistrict) return
            setSelectedDistrict(Number(selectedDistrict))
            setSelectedWard(undefined)
            clearRefsValue(wardInputRef, suburbInputRef)
          }}
        >
          <option value=''>Select</option>
          {districts.map((district) => (
            <option value={district.id}>
              {district.name}
            </option>
          ))}
        </SelectInput>
        <SelectInput
          name='ward'
          required
          label='City/Town/Ward'
          ref={wardInputRef}
          onChange={(e) => {
            const selectedWard = e?.currentTarget?.value
            if (!selectedWard) return
            setSelectedWard(Number(selectedWard))
            clearRefsValue(suburbInputRef)
          }}
        >
          <option value=''>Select</option>
          {wards.map((ward) => (
            <option value={ward.id}>
              {ward.name}
            </option>
          ))}
        </SelectInput>
      </FormRow>
      <FormRow>
        {suburbs.length > 0 && (
          <SelectInput
            name='suburb'
            required
            label='Suburb'
            ref={suburbInputRef}
          >
            <option value=''>Select</option>
            {suburbs.map((suburb) => (
              suburb.name && suburb.id && ((
                <option value={suburb.id}>
                  {suburb.name}
                </option>
              ))
            ))}
          </SelectInput>
        )}
        <TextInput name='street' label='Street Address/Village' required />
      </FormRow>
    </section>
  )
}
