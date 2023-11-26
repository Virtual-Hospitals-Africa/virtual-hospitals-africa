import { JSX } from 'preact'
import { TextInput } from '../components/library/form/Inputs.tsx'
import { Maybe } from '../types.ts'


export default function NationalIdInput({ value }: { value?: Maybe<string> }) {

  const handleIdInput = (e: JSX.TargetedEvent<HTMLInputElement>) => {
    if (e.target && 'value' in e.target && typeof e.target.value === 'string') {      
      let formatted = e.target.value
      //format to match 00-000000 D 00
      if (formatted.length === 2) {
        formatted += '-' 
      }
      if (formatted.length === 9) {
        formatted += ' D ' 
      }
      if (formatted.length > 14){
        formatted = formatted.slice(0, 14)
      }
      e.target.value = formatted
  }
}
  
  return (
    <TextInput
      name='national_id_number'
      label='National ID Number'
      value={value}
      pattern='^\d{2}-\d{6,7}\s[A-Z]\s\d{2}$'
      placeholder='00-000000 D 00'
      onInput={handleIdInput}
      required
    />
  )
}