import { ImagePreviewInput } from '../../../../islands/file-preview-input.tsx'
import FormRow from '../../../library/FormRow.tsx'
import Buttons from '../../../../islands/form/buttons.tsx'
import { FormState } from '../../../../routes/app/organizations/[organization_id]/register/[step].tsx'

export default function NurseDocumentsForm(
  { form_data }: { form_data: Partial<FormState> },
) {
  return (
    <>
      <FormRow>
        <ImagePreviewInput
          name='national_id_picture'
          label='National Identity Card'
          value={form_data.national_id_picture?.url}
        />
      </FormRow>
      <FormRow>
        <ImagePreviewInput
          name='ncz_registration_card'
          label='Nurses Council Of Zimbabwe Registration Identity Card'
          value={form_data.ncz_registration_card?.url}
        />
      </FormRow>
      <FormRow>
        <ImagePreviewInput
          name='face_picture'
          label='Identification Photo'
          value={form_data.face_picture?.url}
        />
      </FormRow>
      <FormRow>
        <ImagePreviewInput
          name='nurse_practicing_cert'
          label='Nurse Practicing Certificate'
          value={form_data.nurse_practicing_cert?.url}
        />
      </FormRow>
      <hr className='my-2' />
      <Buttons submitText='Submit' />
    </>
  )
}
