import { SelectInput, TextInput } from '../components/library/form/Inputs.tsx'
import { useState } from 'preact/hooks'

export default function ReligionSelect() {
  const [selectedReligion, setSelectedReligion] = useState('none')
  const allReligions = [
    'Roman Catholic',
    'Pentecostal/Protestant',
    'Christianity',
    'Islam',
    'Buddhism',
    'Apostolic Sect',
    'African Traditional Religion',
    'Non-Religious',
  ]

  const selectedOther = selectedReligion === 'other'

  return (
    <div className='w-full'>
      <SelectInput
        name={selectedOther ? '' : 'religion'}
        required
        label='Religion'
        onChange={(e) => {
          const selectedReligion = e?.currentTarget?.value
          setSelectedReligion(selectedReligion)
          console.log(selectedReligion)
        }}
      >
        <option value=''>Select</option>
        {allReligions.map((religion) => (
          <option value={religion} selected={selectedReligion === religion}>
            {religion}
          </option>
        ))}
        <option value='other'>Other</option>
      </SelectInput>
      {selectedOther && (
        <TextInput name='religion' label='Other' placeholder='Religion' required />
      )}
    </div>
  )
}
