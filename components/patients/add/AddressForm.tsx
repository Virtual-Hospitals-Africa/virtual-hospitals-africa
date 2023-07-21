import {
  TextInput,
} from '../../library/form/Inputs.tsx'
import FormRow from '../../library/form/Row.tsx'
import Buttons from '../../library/form/buttons.tsx'
import SectionHeader from '../../library/typography/SectionHeader.tsx'
import FacilitySearch from '../../../islands/FacilitySearch.tsx'

function PatientAddress() {
  return (
    <section className='mb-7'>
      <SectionHeader className='mb-3'>Patient Address</SectionHeader>
      <FormRow>
        <TextInput name='country' label='Country' required value='Zimbabwe' disabled />
        <TextInput name='province' label='Province' required />
      </FormRow>
      <FormRow>
        <TextInput name='district' label='District' required />
        <TextInput name='ward' label='City/Town/Ward' required />
      </FormRow>
      <FormRow>
        <TextInput name='street' label='Street Address/Village' required />
      </FormRow>
    </section>
  )
}

function NearestHealthCare() {
  return (
    <section>
      <SectionHeader className='mb-3'>Nearest Health Care</SectionHeader>
      <FormRow>
        <FacilitySearch
          name='nearest_facility'
          href='/app/facilities'
          label='Nearest Facility'
          required
        />
      </FormRow>
    </section>
  )
}

export default function PatientAddressForm() {
  return (
    <>
      <PatientAddress />
      <NearestHealthCare />
      <hr className='my-2' />
      <Buttons />
    </>
  )
}
