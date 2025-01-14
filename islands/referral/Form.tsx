import { useSignal } from '@preact/signals'
import FormRow from '../../components/library/FormRow.tsx'
import { TextArea } from '../form/Inputs.tsx'
import OrganizationSearch from '../OrganizationSearch.tsx'
import PersonSearch from '../PersonSearch.tsx'
import { AddRow, RemoveRow } from '../AddRemove.tsx'
import { RenderedRequestFormValues } from '../../types.ts'

export function ReferralForm() {
  const review_request = useSignal<RenderedRequestFormValues | undefined>(
    undefined,
  )

  if (!review_request.value) {
    return (
      <AddRow
        text='Request doctor review'
        onClick={() =>
          review_request.value = {
            id: null,
            organization: null,
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
          <OrganizationSearch
            name='review_request.organization'
            kind='virtual'
            label='Virtual Organization'
            value={review_request.value?.organization}
          />
        </FormRow>
        <FormRow>
          <PersonSearch
            name='review_request.doctor'
            label='Doctor'
            search_route='/app/providers?profession=doctor&organization_kind=virtual'
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
