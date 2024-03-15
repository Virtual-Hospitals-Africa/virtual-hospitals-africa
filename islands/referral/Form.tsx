import { useSignal } from '@preact/signals'
import FormRow from '../form/Row.tsx'
import { TextArea } from '../form/Inputs.tsx'
import FacilitySearch from '../FacilitySearch.tsx'
import PersonSearch from '../PersonSearch.tsx'
import { AddRow, RemoveRow } from '../AddRemove.tsx'
import { RenderedRequestFormValues } from '../../types.ts'

export function ReferralForm(props: {
  review_request?: RenderedRequestFormValues
}) {
  const review_request = useSignal(props.review_request)

  if (!review_request.value) {
    return (
      <AddRow
        text='Request doctor review'
        onClick={() =>
          review_request.value = {
            id: null,
            facility: null,
            doctor: null,
            requester_notes: null,
          }}
      />
    )
  }

  return (
    <RemoveRow onClick={() => review_request.value = undefined} labelled>
      <div className='flex flex-col w-full gap-2'>
        {review_request.value?.id && (
          <input
            type='hidden'
            name='review_request.id'
            value={review_request.value?.id}
          />
        )}
        <FormRow>
          <FacilitySearch
            name='review_request.facility'
            kind='virtual'
            label='Virtual Facility'
            value={review_request.value?.facility}
          />
        </FormRow>
        <FormRow>
          <PersonSearch
            name='review_request.doctor'
            label='Doctor'
            href='/app/providers?profession=doctor&facility_kind=virtual'
            value={review_request.value?.doctor}
          />
        </FormRow>
        <FormRow>
          <TextArea
            name='review_request.requester_notes'
            label='Additional Notes'
            value={review_request.value?.requester_notes}
          />
        </FormRow>
      </div>
    </RemoveRow>
  )
}
