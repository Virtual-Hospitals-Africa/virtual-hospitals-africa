import FormSection from '../../../components/library/FormSection.tsx'
import FormGrid from '../../../components/library/FormGrid.tsx'
import { HealthInsuranceSection } from '../../HealthInsurance.tsx'
import { CONSULTATION_INSURANCE } from '../../../shared/consultation-tutorial/mock-data.ts'

export function RegistrationStep() {
  return (
    <div>
      <FormSection header='Primary care'>
        <FormGrid columns={2}>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Nearest Public Facility</label>
            <div className='px-3 py-2 bg-gray-50 rounded border border-gray-200 text-sm text-gray-900'>
              Pretoria East Medical Centre
            </div>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Primary care Doctor</label>
            <div className='px-3 py-2 bg-gray-50 rounded border border-gray-200 text-sm text-gray-900'>
              Dr. Lufuno Zungu
            </div>
          </div>
        </FormGrid>
      </FormSection>

      <div data-tutorial='insurance-section'>
        <HealthInsuranceSection
          current_insurance={CONSULTATION_INSURANCE}
          previously_completed_form
        />
      </div>
    </div>
  )
}
