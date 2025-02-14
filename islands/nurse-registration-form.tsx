import { FormState } from '../routes/app/organizations/[organization_id]/register/[step].tsx'
import NursePersonalForm from '../components/health_worker/nurse/invite/NursePersonalForm.tsx'
import NurseProfessionalForm from '../components/health_worker/nurse/invite/NurseProfessionalForm.tsx'
import NurseDocumentsForm from '../components/health_worker/nurse/invite/NurseDocumentsForm.tsx'
import Form from '../components/library/Form.tsx'

export default function NurseRegistrationForm(
  { currentStep, formData }: {
    currentStep: string
    formData: Partial<FormState>
  },
) {
  return (
    <Form
      method='POST'
      className='w-full'
      encType='multipart/form-data'
    >
      {currentStep === 'personal' && (
        <NursePersonalForm
          formData={formData}
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
