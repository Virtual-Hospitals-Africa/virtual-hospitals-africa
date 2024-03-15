import FormRow from '../../islands/form/Row.tsx'
import { TextArea } from '../../islands/form/Inputs.tsx'
import SectionHeader from '../library/typography/SectionHeader.tsx'
import FacilitySearch from '../../islands/FacilitySearch.tsx'
import PersonSearch from '../../islands/PersonSearch.tsx'

export function ReferralForm({ review_request }: {
  review_request?: {
    facility: null | {
      id: number
      name: string
      address: string | null
    }
    doctor: null | {
      id: number
      name: string
    }
    requester_notes: null | string
  }
}) {
  return (
    <div className='flex flex-col w-full gap-2'>
      <SectionHeader className='mb-3'>Request doctor review</SectionHeader>
      <FormRow>
        <FacilitySearch
          name='facility'
          kind='virtual'
          label='Virtual Facility'
          value={review_request?.facility}
        />
      </FormRow>
      <FormRow>
        <PersonSearch
          name='doctor'
          label='Doctor'
          href='/app/providers?profession=doctor&facility_kind=virtual'
          value={review_request?.doctor}
        />
      </FormRow>
      <FormRow>
        <TextArea
          name='requester_notes'
          label='Additional Notes'
          value={review_request?.requester_notes}
        />
      </FormRow>
    </div>
  )
}
