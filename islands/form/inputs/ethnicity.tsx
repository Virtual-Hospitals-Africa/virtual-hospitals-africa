import { Maybe } from '../../../types.ts'
import { Select } from './select.tsx'

export function EthnicitySelect({ value }: { value?: Maybe<string> }) {
  return (
    <Select required name='ethnicity' label='Ethnicity'>
      <option value=''>Select</option>
      <option value='african' label='African' selected={value === 'african'} />
      <option
        value='african american'
        label='African American'
        selected={value === 'african american'}
      />
      <option value='asian' label='Asian' selected={value === 'asian'} />
      <option
        value='caribbean'
        label='Caribbean'
        selected={value === 'caribbean'}
      />
      <option
        value='caucasian'
        label='Caucasian'
        selected={value === 'caucasian'}
      />
      <option
        value='hispanic'
        label='Hispanic'
        selected={value === 'hispanic'}
      />
      <option
        value='middle eastern'
        label='Middle Eastern'
        selected={value === 'middle eastern'}
      />
      <option
        value='native american'
        label='Native American'
        selected={value === 'native american'}
      />
      <option
        value='pacific islander'
        label='Pacific Islander'
        selected={value === 'pacific islander'}
      />
      <option value='other' label='Other' selected={value === 'other'} />
    </Select>
  )
}
