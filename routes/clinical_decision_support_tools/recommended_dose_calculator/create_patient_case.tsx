import { Context } from 'fresh'
import { Button } from '../../../components/library/Button.tsx'
import Form from '../../../components/library/Form.tsx'
import FormGrid from '../../../components/library/FormGrid.tsx'
import FormSection from '../../../components/library/FormSection.tsx'
import HealthWorkerContentsWithSidebarAndDrawer from '../../../components/library/layout/HealthWorkerContentsWithSidebarAndDrawer.tsx'
import { StepsSidebar } from '../../../components/library/Sidebar.tsx'
import { DateInput } from '../../../islands/form/inputs/date.tsx'
import { NumberInput } from '../../../islands/form/inputs/number.tsx'
import { SelectWithOptions } from '../../../islands/form/inputs/select_with_options.tsx'
import PatientConditionsSection from '../../../islands/recommended_dose_calculator/PatientConditionsSection.tsx'
import { LogoWithFullText } from '../../../components/library/Logo.tsx'

export default function CreatePatientCase(ctx: Context<unknown>) {
  return (
    <HealthWorkerContentsWithSidebarAndDrawer
      title='Recommended Dose Calculator'
      url={ctx.url}
      sidebar={
        <StepsSidebar
          top={{
            href: '/clinical_decision_support_tools',
            child: <LogoWithFullText variant='indigo' className='w-full' />,
          }}
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

        <div>
          <Button type='submit'>Calculate Recommended Doses</Button>
        </div>
      </Form>
    </HealthWorkerContentsWithSidebarAndDrawer>
  )
}
