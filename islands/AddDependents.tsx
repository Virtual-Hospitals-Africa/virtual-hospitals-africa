import { useEffect, useRef, useState } from 'preact/hooks'
import { SelectInput, TextInput } from "../components/library/form/Inputs.tsx"
import FormRow from "../components/library/form/Row.tsx"
import SectionHeader from '../components/library/typography/SectionHeader.tsx'
import Buttons from '../components/library/form/buttons.tsx'
import AddIcon from "../components/library/icons/add.tsx"
import RemoveIcon from "../components/library/icons/remove.tsx"
import IconButton from "../components/library/IconButton.tsx"
import PlusIcon from '../components/library/icons/remove.tsx'

export default function AddDependants() {
    const [addDependant, setaddDependant] = useState(true)
    const [removeDependant, setremoveDependant] = useState(true)
    const toggleAddButton = () => {}
    // if (searchInputRef.current) {
    //     setaddDependant(true)
    // }
    const toggleRemoveButton = () => {
          setremoveDependant(true)
    }
    return(
        <>
            <section>
                <SectionHeader className='mb-3'>Dependants</SectionHeader>
                    <FormRow>
                    <PlusIcon />
                    if ()
                    <RemoveIcon />
                        <TextInput name='Name' required label = 'Name'/>
                        <TextInput name='phone number'/>
                            <SelectInput name='relationship' required label = 'Relationship'>
                            {/* {selectRelations} */}
                            </SelectInput>
                    </FormRow>
            </section>
        
        </>
    )
}