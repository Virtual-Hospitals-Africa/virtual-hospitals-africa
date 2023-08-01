import FilePreviewInput from '../../../../islands/file-preview-input.tsx'

import FormRow from '../../../library/form/Row.tsx'
import { Button } from '../../../library/Button.tsx'

export default function NurseDocumentForm() {
  return (
    <>
      <FormRow className='grid grid-cols-1 place-items-center'>
        <FilePreviewInput
          classNames='h-64 w-auto'
          name='national_id_picture'
          label='National Identity Card'
        />
      </FormRow>
      <FormRow className='grid grid-cols-1 place-items-center'>
        <FilePreviewInput
          classNames='h-64 w-auto'
          name='ncz_registration_card'
          label='Nurses Council Of Zimbabwe Registration Identity Card'
        />
      </FormRow>
      <FormRow className='grid grid-cols-1 place-items-center'>
        <FilePreviewInput 
          classNames='h-64 w-auto'
          name='face_picture' 
          label='Identification Photo' 
        />
      </FormRow>
      <hr className='my-2' />
      <div className='container grid grid-cols-1'>
        <Button type='submit'>Submit</Button>
      </div>
    </>
  )
}
