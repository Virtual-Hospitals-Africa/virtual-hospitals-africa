import IconButton from '../../library/IconButton.tsx'
import { SearchInput } from '../../library/form/Inputs.tsx'
import FormRow from '../../library/form/Row.tsx'
import SectionHeader from '../../library/typography/SectionHeader.tsx'
import AllergySearch from '../../../islands/AllergySearch.tsx'

export default function PatientConditionsForm() {
  return (
    <div style='max-width: 85%; margin: auto;'>
      <h1
        className='mb-1'
        style="font-size: 20px; font-family: 'Ubuntu', sans-serif"
      >
        Allergies
      </h1>

      <section>
        <AllergySearch />
      </section>
    </div>
  )
}
