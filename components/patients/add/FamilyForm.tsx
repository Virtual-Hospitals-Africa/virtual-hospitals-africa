import { SelectInput, TextInput } from "../../library/form/Inputs.tsx"
import FormRow from "../../library/form/Row.tsx"
import { allRelations } from "../../../util/relationList.ts"
import { allReligions } from "../../../util/religionList.ts"
import SectionHeader from '../../library/typography/SectionHeader.tsx'
import Buttons from '../../library/form/buttons.tsx'
import AddIcon from "../../library/icons/add.tsx"
import RemoveIcon from "../../library/icons/remove.tsx"
import IconButton from "../../library/IconButton.tsx"
import { useState } from "preact/hooks"
import { AddPatientDataProps } from '../../../routes/app/patients/add.tsx'
//import AddDependants from "../../../islands/AddDependants.tsx"
type FamilyFormProps = AddPatientDataProps['family']

export default function FamilyForm(
    { initialData = {} }: {initialData: Partial<FamilyFormProps> },
) {

    const [otherReligion, setOtherReligion] = useState(false);
    const selectReligions = allReligions.map((religion) => { 
        return (
            <option value='${religion}' selected={initialData.religion === religion}>{religion}</option>
        )
    })

    function handleReligion(religion: string) {
        if( religion === "Other") 
            setOtherReligion(true);
    }
    
    const selectRelations = allRelations.map((relation) => {
        return (
            <option>{relation}</option>
        )
    })

    return (
        <>
            <FormRow>
                <SelectInput name='marital status' required label='Marital Status'>
                    <option value='single'>Single</option>Mark
                    <option value='married'>Married</option>
                    <option value='civilPartner'>Civil Partner</option>
                    <option value='widowWidower'>Widow/Widower</option>
                    <option value='separated'>Separated</option>
                    <option value='divorced'>Divorced</option>
                </SelectInput>
                <SelectInput name='religion' required label="Religion">
                    {selectReligions}
                </SelectInput>
                
            </FormRow>
            <section>
                <SectionHeader className='mb-3'>Next of Kin</SectionHeader>
               
                <FormRow>
                    <TextInput name='Name' required label = 'Name'/>
                    <TextInput name='phone number'/>
                    <SelectInput name='relationship' required label = 'Relationship'>
                        {selectRelations}
                    </SelectInput>
                </FormRow>
                </section>
                <hr className='my-2' />
                <section>
                    <SectionHeader className='mb-3'>Dependants</SectionHeader>
                    {/* <AddDependants /> */}
                     
                </section>
                <hr className='my-2' />
            <section>
                <Buttons
                    submitText='Next Step'
                    cancelHref='/app/patients'
                />
            </section>
        </>
    )
}