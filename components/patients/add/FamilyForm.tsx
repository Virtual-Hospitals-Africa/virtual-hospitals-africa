import { SelectInput, TextInput } from '../../library/form/Inputs.tsx'
import FormRow from '../../library/form/Row.tsx'
import SectionHeader from '../../library/typography/SectionHeader.tsx'
import Buttons from '../../library/form/buttons.tsx'
import { AddPatientDataProps } from '../../../routes/app/patients/add.tsx'
import ReligionSelect from '../../../islands/ReligionSelect.tsx'
type FamilyFormProps = AddPatientDataProps['family']

export default function FamilyForm(
  { initialData = {} }: { initialData: Partial<FamilyFormProps> }, //might be unnecessary? ask!
) {
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

  return (
    <>
      <FormRow>
        <SelectInput name='marital status' required label='Marital Status'>
          <option value='Select'>Select</option>
          <option value='single'>Single</option>
          <option value='married'>Married</option>
          <option value='civilPartner'>Civil Partner</option>
          <option value='widowWidower'>Widow/Widower</option>
          <option value='separated'>Separated</option>
          <option value='divorced'>Divorced</option>
        </SelectInput>
        <ReligionSelect />
      </FormRow>
      <section>
        <SectionHeader className='my-5 text-[20px]'>Next of Kin</SectionHeader>
        <FormRow>
          <TextInput name='Name' required label='Name' />
          <TextInput name='phone number' />
          <SelectInput name='relationship' required label='Relationship'>
            <option>Select</option>
            {allRelations.map((relation) => <option>{relation}</option>)}
          </SelectInput>
        </FormRow>
      </section>
      <section>
        <SectionHeader className='my-5 text-[20px]'>Dependents</SectionHeader>
        {/* <AddDependants /> */}
      </section>
      <hr className='my-5' />
      <section>
        <Buttons
          submitText='Next Step'
          cancelHref='/app/patients'
        />
      </section>
    </>
  )
}
