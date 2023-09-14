import { SelectInput, TextInput } from "../../library/form/Inputs.tsx"
import FormRow from "../../library/form/Row.tsx"

export default function FamilyForm() {
    return (
        <>
            <FormRow>
                <SelectInput name='marital status' required label='Marial Status'>
                    <option value='single'>Single</option>Mark
                    <option value='married'>Married</option>
                    <option value='civilPartner'>Civil Partner</option>
                    <option value='widowWidower'>Widow/Widower</option>
                    <option value='separated'>Separated</option>
                    <option value='divorced'>Divorced</option>
                </SelectInput>
                <SelectInput name='religion' required label="Religion">
                    
                </SelectInput>
            </FormRow>
            <h1>Next of Kin!</h1>
            <FormRow>
                <TextInput name='name'/>
                <TextInput name='phone number'/>
                <TextInput name='relationship' />
            </FormRow>
        </>
    )
}