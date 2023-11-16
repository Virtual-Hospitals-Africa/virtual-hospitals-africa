import { FormState } from '../routes/app/facilities/[facilityId]/register.tsx'
import NursePersonalForm from '../components/health_worker/nurse/invite/NursePersonalForm.tsx'
import NurseProfessionalForm from '../components/health_worker/nurse/invite/NurseProfessionalForm.tsx'
import NurseDocumentsForm from '../components/health_worker/nurse/invite/NurseDocumentsForm.tsx'
import unsavedChangesWarning from '../components/library/form/unsaved_changes_warning.tsx'
import { FullCountryInfo } from '../types.ts'

export default function NurseRegistrationForm(
  { currentStep, formData, adminDistricts}: { currentStep: string; formData: FormState; adminDistricts: FullCountryInfo | undefined},
) {
  unsavedChangesWarning()

  return (
    <form
      method='POST'
      className='w-full mt-4'
      encType='multipart/form-data'
    >
      {currentStep === 'personal' && <NursePersonalForm formData={formData} adminDistricts={adminDistricts!}/>}
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
