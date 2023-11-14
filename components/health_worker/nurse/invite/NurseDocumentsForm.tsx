import FilePreviewInput from '../../../../islands/file-preview-input.tsx'
import FormRow from '../../../library/form/Row.tsx'
import Buttons from '../../../library/form/buttons.tsx'

import { FormState } from '../../../../routes/app/facilities/[facilityId]/register.tsx'
import unsavedChangesWarning from '../../../library/form/unsaved_changes_warning.tsx'

export default function NurseDocumentsForm(
  { formData }: { formData: FormState }
) {
  
  unsavedChangesWarning();

  return (
    <>
      <FormRow>
        <FilePreviewInput
          name='national_id_picture'
          label='National Identity Card'
          value={formData.national_id_picture?.mime_type}
        />
      </FormRow>
      <FormRow>
        <FilePreviewInput
          name='ncz_registration_card'
          label='Nurses Council Of Zimbabwe Registration Identity Card'
          value={formData.ncz_registration_card?.mime_type}
        />
      </FormRow>
      <FormRow>
        <FilePreviewInput
          name='face_picture'
          label='Identification Photo'
          value={formData.face_picture?.mime_type}
        />
      </FormRow>
      <FormRow>
        <FilePreviewInput
          name='nurse_practicing_cert'
          label='Nurse Practicing Certificate'
        />
      </FormRow>
      <hr className='my-2' />
      <Buttons
        submitText='Submit'
        cancelText='Back'
      />
    </>
  )
}
