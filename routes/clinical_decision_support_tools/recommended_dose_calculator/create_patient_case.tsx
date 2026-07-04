import { Context } from 'fresh'
import { Button } from '../../../components/library/Button.tsx'
import Form from '../../../components/library/Form.tsx'
import FormGrid from '../../../components/library/FormGrid.tsx'
import FormSection from '../../../components/library/FormSection.tsx'
import HealthWorkerContentsWithSidebarAndDrawer from '../../../components/library/layout/HealthWorkerContentsWithSidebarAndDrawer.tsx'
import { DecisionSupportDisclaimer } from '../../../components/SnomedIcd10MappingAudit.tsx'
import { DateInput } from '../../../islands/form/inputs/date.tsx'
import { NumberInput } from '../../../islands/form/inputs/number.tsx'
import { TextInput } from '../../../islands/form/inputs/text.tsx'
import { SelectWithOptions } from '../../../islands/form/inputs/select_with_options.tsx'
import PatientConditionsSection from '../../../islands/recommended_dose_calculator/PatientConditionsSection.tsx'
import { LogoWithFullText } from '../../../components/library/Logo.tsx'
import { StepsSidebar } from '../../../components/library/sidebar/Steps.tsx'
import { Top } from '../../../components/library/sidebar/Top.tsx'
import { RECOMMENDED_DOSE_CALCULATOR_SNOMED_FIELD_HELP, RECOMMENDED_DOSE_CALCULATOR_SUBMIT_LABEL } from '../../../shared/snomed_to_icd10.ts'

export default function CreatePatientCase(ctx: Context<unknown>) {
  return (
    <HealthWorkerContentsWithSidebarAndDrawer
      title='Recommended Dose Calculator'
      url={ctx.url}
      sidebar={
        <StepsSidebar
          top={
            <Top>
              <LogoWithFullText variant='indigo' className='w-full' />
            </Top>
          }
          url={ctx.url}
          route={ctx.route}
          params={ctx.params}
          nav_links={[
            {
              step: 'Create patient case',
              route: '/clinical_decision_support_tools/recommended_dose_calculator/create_patient_case',
            },
            {
              step: 'Recommended medications',
              route: '/clinical_decision_support_tools/recommended_dose_calculator/recommended_medications',
            },
          ]}
          steps_completed={[]}
        />
      }
    >
      <Form
        method='GET'
        action='/clinical_decision_support_tools/recommended_dose_calculator/recommended_medications'
        className='flex flex-col gap-8 py-6 px-4'
      >
        <DecisionSupportDisclaimer />

        <FormSection header='Demographic Details'>
          <FormGrid columns={2}>
            <DateInput
              name='dob'
              label='Date of Birth'
              required
            />
            <SelectWithOptions
              name='sex'
              label='Sex'
              blank_option='Select Sex'
              options={['male', 'female']}
              required
            />
            <NumberInput
              name='height_cm'
              label='Height (cm)'
              min={0}
              required
            />
            <NumberInput
              name='weight_kg'
              label='Weight (kg)'
              min={0}
              required
            />
          </FormGrid>
        </FormSection>

        <FormSection header='Patient Conditions'>
          <PatientConditionsSection />
        </FormSection>

        <FormSection header='SNOMED Diagnoses'>
          <TextInput
            name='snomed_concept_ids'
            label={RECOMMENDED_DOSE_CALCULATOR_SNOMED_FIELD_HELP}
          />
        </FormSection>

        <div>
          <Button type='submit'>{RECOMMENDED_DOSE_CALCULATOR_SUBMIT_LABEL}</Button>
        </div>
      </Form>
    </HealthWorkerContentsWithSidebarAndDrawer>
  )
}
