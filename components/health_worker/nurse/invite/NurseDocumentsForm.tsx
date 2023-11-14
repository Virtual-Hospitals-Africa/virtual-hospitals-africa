import FilePreviewInput from '../../../../islands/file-preview-input.tsx'
import FormRow from '../../../library/form/Row.tsx'
import Buttons from '../../../library/form/buttons.tsx'

export default function NurseDocumentsForm() {
  return (
    <>
      <FormRow>
        <FilePreviewInput
          name='national_id_picture'
          label='National Identity Card'
        />
      </FormRow>
      <FormRow>
        <FilePreviewInput
          name='ncz_registration_card'
          label='Nurses Council Of Zimbabwe Registration Identity Card'
        />
      </FormRow>
      <FormRow>
        <FilePreviewInput name='face_picture' label='Identification Photo' />
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
