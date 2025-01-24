import { useSignal } from '@preact/signals'
import FormRow from '../../components/library/FormRow.tsx'
import OrganizationSearch from '../OrganizationSearch.tsx'
import { RenderedRequestFormValues } from '../../types.ts'

export function OrganizationView() {
  const review_request = useSignal<RenderedRequestFormValues | undefined>(
    undefined,
  )

  return (
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
          value={review_request.value?.organization}
          sort={{
            by: 'nearest',
            direction: 'asc',
          }}
          filters={{
            accepting_patients: true,
          }}
        />
      </FormRow>
    </div>
  )
}
