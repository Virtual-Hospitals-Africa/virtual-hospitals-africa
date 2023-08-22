import { useMemo, useRef, useState } from 'preact/hooks'
import FormRow from '../components/library/form/Row.tsx'
import { SelectInput, TextInput } from '../components/library/form/Inputs.tsx'
import {
  AdminDistricts,
  Countries,
  Districts,
  Provinces,
  Wards,
} from '../types.ts'
import clearRefsValue from '../util/clearRefsValue.ts'

export default function PatientAddressForm(
  { adminDistricts = [] }: { adminDistricts?: AdminDistricts },
) {
  const suburbInputRef = useRef<HTMLSelectElement>(null)
  const wardInputRef = useRef<HTMLSelectElement>(null)
  const districtInputRef = useRef<HTMLSelectElement>(null)
  const provinceInputRef = useRef<HTMLSelectElement>(null)
  const [selectedCountry, setSelectedCountry] = useState<
    Countries['id']
  >()
  const [selectedProvinces, setSelectedProvinces] = useState<
    Provinces['id']
  >()
  const [selectedDistrict, setSelectedDistrict] = useState<
    Districts['id']
  >()
  const [selectedWard, setSelectedWard] = useState<Wards['id']>()

  const provinces = useMemo(() => {
    if (!selectedCountry) return []
    return adminDistricts.find((country) => country.id === selectedCountry)
      ?.provinces || []
  }, [selectedCountry])

  const districts = useMemo(() => {
    if (!selectedProvinces) return []
    return provinces.find((province) => province.id === selectedProvinces)
      ?.districts || []
  }, [selectedProvinces])
  const wards = useMemo(() => {
    if (!selectedDistrict) return []
    return districts.find((district) => district.id === selectedDistrict)
      ?.wards || []
  }, [selectedDistrict])
  const suburbs = useMemo(() => {
    if (!selectedWard) return []
    return wards.find((ward) => ward.id === selectedWard)?.suburbs || []
  }, [selectedWard])

  return (
    <section className='mb-7'>
      <FormRow>
        <SelectInput
          name='country'
          required
          label='Country'
          onChange={(e) => {
            const selectedCountry = e?.currentTarget?.value
            if (selectedCountry === undefined) return
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
          {adminDistricts.map((country) => (
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
            if (selectedProvince === undefined) return
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
            if (selectedDistrict === undefined) return
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
            if (selectedWard === undefined) return
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
