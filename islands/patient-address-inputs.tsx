import { useMemo, useState } from 'preact/hooks'
import FormRow from '../components/library/form/Row.tsx'
import { SelectInput, TextInput } from '../components/library/form/Inputs.tsx'
import { FullCountryInfo, Maybe, OnboardingPatient } from '../types.ts'

export default function PatientAddressForm(
  { patient, adminDistricts }: {
    patient?: Partial<OnboardingPatient>
    adminDistricts: FullCountryInfo
  },
) {
  console.log('patient', patient)

  const [selectedCountry, setSelectedCountry] = useState<Maybe<number>>(
    patient?.country_id,
  )
  const [selectedProvince, setSelectedProvince] = useState<Maybe<number>>(
    patient?.province_id,
  )
  const [selectedDistrict, setSelectedDistrict] = useState<Maybe<number>>(
    patient?.district_id,
  )
  const [selectedWard, setSelectedWard] = useState<Maybe<number>>(
    patient?.ward_id,
  )
  const [selectedSuburb, setSelectedSuburb] = useState<Maybe<number>>(
    patient?.suburb_id,
  )

  const provinces = useMemo(() => {
    if (!selectedCountry) return []
    return adminDistricts.find((country) => country.id === selectedCountry)
      ?.provinces || []
  }, [selectedCountry])

  const districts = useMemo(() => {
    if (!selectedProvince) return []
    return provinces.find((province) => province.id === selectedProvince)
      ?.districts || []
  }, [selectedProvince])
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
          name='country_id'
          required
          label='Country'
          onChange={(e) => {
            const selectedCountry = e?.currentTarget?.value
            if (selectedCountry === undefined) return
            setSelectedCountry(Number(selectedCountry))
            setSelectedProvince(undefined)
            setSelectedDistrict(undefined)
            setSelectedWard(undefined)
          }}
        >
          <option value=''>Select</option>
          {adminDistricts.map((country) => (
            <option
              value={country.id}
              selected={selectedCountry === country.id}
            >
              {country.name}
            </option>
          ))}
        </SelectInput>
        <SelectInput
          name='province_id'
          required
          label='Province'
          onChange={(e) => {
            const selectedProvince = e?.currentTarget?.value
            if (selectedProvince === undefined) return
            setSelectedProvince(Number(selectedProvince))
            setSelectedDistrict(undefined)
            setSelectedWard(undefined)
          }}
        >
          <option value=''>Select</option>
          {provinces.map((province) => (
            <option
              value={province.id}
              selected={selectedProvince === province.id}
            >
              {province.name}
            </option>
          ))}
        </SelectInput>
      </FormRow>
      <FormRow>
        <SelectInput
          name='district_id'
          required
          label='District'
          onChange={(e) => {
            const selectedDistrict = e?.currentTarget?.value
            if (selectedDistrict === undefined) return
            setSelectedDistrict(Number(selectedDistrict))
            setSelectedWard(undefined)
          }}
        >
          <option value=''>Select</option>
          {districts.map((district) => (
            <option
              value={district.id}
              selected={selectedDistrict === district.id}
            >
              {district.name}
            </option>
          ))}
        </SelectInput>
        <SelectInput
          name='ward_id'
          required
          label='City/Town/Ward'
          onChange={(e) => {
            const selectedWard = e?.currentTarget?.value
            if (selectedWard === undefined) return
            setSelectedWard(Number(selectedWard))
          }}
        >
          <option value=''>Select</option>
          {wards.map((ward) => (
            <option value={ward.id} selected={selectedWard === ward.id}>
              {ward.name}
            </option>
          ))}
        </SelectInput>
      </FormRow>
      <FormRow>
        {suburbs.length > 0 && (
          <SelectInput
            name='suburb_id'
            required
            label='Suburb'
          >
            <option value=''>Select</option>
            {suburbs.map((suburb) => (
              suburb.name && suburb.id &&
              ((
                <option
                  value={suburb.id}
                  selected={selectedSuburb === suburb.id}
                >
                  {suburb.name}
                </option>
              ))
            ))}
          </SelectInput>
        )}
        <TextInput
          name='street'
          label='Street Address'
          value={patient?.street}
        />
      </FormRow>
    </section>
  )
}
