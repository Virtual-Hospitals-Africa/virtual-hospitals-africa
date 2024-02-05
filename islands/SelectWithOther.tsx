import { useState } from 'preact/hooks'
import {
  Select,
  SelectProps,
  TextInput,
} from '../components/library/form/Inputs.tsx'

export default function SelectWithOther(
  { name, children, ...props }: SelectProps,
) {
  const [selected, setSelected] = useState<undefined | string>()

  const selectedOther = selected === 'other'

  return (
    <div className='w-full'>
      <Select
        {...props}
        name={selectedOther ? '' : name}
        onChange={(e) => {
          console.log('e', e)
          setSelected(e?.currentTarget?.value)
        }}
      >
        <option value=''>Select</option>
        {children}
        <option value='other'>Other</option>
      </Select>
      {selectedOther && (
        <TextInput
          name={name}
          label=''
          placeholder=''
          required
        />
      )}
    </div>
  )
}
