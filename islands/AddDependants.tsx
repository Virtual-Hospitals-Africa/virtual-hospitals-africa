import { useEffect, useRef, useState } from 'preact/hooks'
import RemoveIcon from '../components/library/icons/remove.tsx'
import PlusIcon from '../components/library/icons/remove.tsx'

export default function AddDependants(){
    const [addDependant, setaddDependant] = useState(true)
    const [removeDependant, setremoveDependant] = useState(true)
    const toggleAddButton = () => {
        if (searchInputRef.current) {
          setaddDependant(true)
        }
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
                    <removeIcon />
                        <TextInput name='Name' required label = 'Name'/>
                        <TextInput name='phone number'/>
                            <SelectInput name='relationship' required label = 'Relationship'>
                            {selectRelations}
                            </SelectInput>
                    </FormRow>
            </section>
        
        </>
    )
}