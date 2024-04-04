import { FormState } from '../routes/app/facilities/[facility_id]/register/[step].tsx'
import NursePersonalForm from '../components/health_worker/nurse/invite/NursePersonalForm.tsx'
import NurseProfessionalForm from '../components/health_worker/nurse/invite/NurseProfessionalForm.tsx'
import NurseDocumentsForm from '../components/health_worker/nurse/invite/NurseDocumentsForm.tsx'
import unsavedChangesWarning from './form/unsaved_changes_warning.tsx'
import { CountryAddressTree } from '../types.ts'
import Form from '../components/library/Form.tsx'

export default function NurseRegistrationForm(
  { currentStep, formData, country_address_tree }: {
    currentStep: string
    formData: Partial<FormState>
    country_address_tree: CountryAddressTree | undefined
  },
) {
  unsavedChangesWarning()

  return (
    <Form
      method='POST'
      className='w-full'
      encType='multipart/form-data'
    >
      {currentStep === 'personal' && (
        <NursePersonalForm
          formData={formData}
          country_address_tree={country_address_tree!}
        />
      )}
      {currentStep === 'professional' && (
        <NurseProfessionalForm formData={formData} />
      )}
      {currentStep === 'documents' && (
        <NurseDocumentsForm
          formData={formData}
        />
      )}
    </Form>
  )
}
