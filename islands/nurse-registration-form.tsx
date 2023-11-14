import { FormState } from '../routes/app/facilities/[facilityId]/register.tsx'
import NursePersonalForm from '../components/health_worker/nurse/invite/NursePersonalForm.tsx'
import NurseProfessionalForm from '../components/health_worker/nurse/invite/NurseProfessionalForm.tsx'
import NurseDocumentsForm from '../components/health_worker/nurse/invite/NurseDocumentsForm.tsx'

export default function NurseRegistrationForm(
  { currentStep, formData }: { currentStep: string; formData: FormState },
) {
  console.log('current step: ', currentStep)
  console.log('formData: ', formData)

  return (
    <form
      method='POST'
      className='w-full mt-4'
      encType='multipart/form-data'
    >
      {currentStep === 'personal' && <NursePersonalForm formData={formData} />}
      {currentStep === 'professional' && (
        <NurseProfessionalForm formData={formData} />
      )}
      {currentStep === 'documents' && (
        <NurseDocumentsForm
          formData={formData}
        />
      )}
    </form>
  )
}
