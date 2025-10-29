import { Maybe, Prefix, PREFIXES } from '../../../types.ts'
import { Select } from './select.tsx'

export function PrefixSelect({ value }: { value?: Maybe<Prefix> }) {
  return (
    <Select name='prefix' label='Prefix' required>
      {PREFIXES.map((prefix) => (
        <option value={prefix} label={prefix} selected={value === prefix} />
      ))}
    </Select>
  )
}
