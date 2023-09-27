import { SelectInput, TextInput } from "../components/library/form/Inputs.tsx"
import { useState } from "preact/hooks"

export default function ReligionSelect () {
    const [selectedReligion, setSelectedReligion] = useState("none");
    const allReligions = [
        'Roman Catholic',
        'Pentecostal/Protestant',
        'Christianity',
        'Islam',
        'Apostolic Sect',
        'African Traditional Religion',
        'Non-Religious'
    ]

    const selectedOther = selectedReligion === 'other'

    return (
        <>
            <SelectInput name={selectedOther? '' : 'religion'} required label='Religion' onChange={(e) => {
                const selectedReligion = e?.currentTarget?.value;
                setSelectedReligion(selectedReligion);
                console.log(selectedReligion);
            }}>
                <option>Select</option>
                {allReligions.map((religion) =>(
                    <option value={religion} selected={selectedReligion === religion}>{religion}</option>
                ))}
                <option value='other'>Other</option>
            </SelectInput>
            {
                selectedOther && <TextInput name='religion' />
            }
        </>
    )
}
