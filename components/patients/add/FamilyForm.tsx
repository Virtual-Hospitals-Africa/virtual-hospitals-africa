import { Select, TextInput } from '../../library/form/Inputs.tsx'
import FormRow from '../../library/form/Row.tsx'
import SectionHeader from '../../library/typography/SectionHeader.tsx'
import ReligionSelect from '../../../islands/ReligionSelect.tsx'
import { OnboardingPatient } from '../../../types.ts'

const allRelations = [
  'Wife',
  'Husband',
  'Brother',
  'Sister',
  'Grandparent',
  'Grandchild',
  'Son',
  'Daughter',
  'Uncle',
  'Aunt',
  'Cousin',
  'Other Relative or Friend',
]

export default function FamilyForm(
  { patient = {} }: { patient?: Partial<OnboardingPatient> },
) {
  return (
    <>
      <FormRow>
        <Select
          name='marital_status'
          required
          label='Marital Status'
        >
          <option value=''>Select</option>
          <option value='single'>Single</option>
          <option value='married'>Married</option>
          <option value='civil_partner'>Civil Partner</option>
          <option value='widow_widower'>Widow/Widower</option>
          <option value='separated'>Separated</option>
          <option value='divorced'>Divorced</option>
        </Select>
        <ReligionSelect />
      </FormRow>
      <section>
        <SectionHeader className='my-5 text-[20px]'>Next of Kin</SectionHeader>
        <FormRow>
          <TextInput name='next_of_kin.name' required label='Name' />
          <TextInput name='next_of_kin.phone_number' />
          <Select
            name='next_of_kin.relationship'
            required
            label='Relationship'
          >
            <option value=''>Select</option>
            {allRelations.map((relation) => <option>{relation}</option>)}
          </Select>
        </FormRow>
      </section>
      <section>
        <SectionHeader className='my-5 text-[20px]'>Dependents</SectionHeader>
        {/* <AddDependents /> */}
      </section>
    </>
  )
}
