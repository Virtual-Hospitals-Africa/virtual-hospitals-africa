import SelectWithOther from './SelectWithOther.tsx'

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

export default function ReligionSelect() {
  return (
    <SelectWithOther
      name='religion'
      required
    >
      {allReligions.map((religion) => (
        <option value={religion}>
          {religion}
        </option>
      ))}
    </SelectWithOther>
  )
}
