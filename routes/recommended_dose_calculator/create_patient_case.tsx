import { Context } from 'fresh'
import { HealthWorkerHomePageLayout } from '../../components/library/layout/HealthWorkerHomePage.tsx'
import { TUTORIAL_EMPLOYEE } from '../../shared/tutorial/mock-data.ts'
import Form from '../../components/library/Form.tsx'
import FormSection from '../../components/library/FormSection.tsx'
import { Button } from '../../components/library/Button.tsx'
import { SelectWithOptions } from '../../islands/form/inputs/select_with_options.tsx'
import { NumberInput } from '../../islands/form/inputs/number.tsx'
import PatientConditionsSection from '../../islands/recommended_dose_calculator/PatientConditionsSection.tsx'
import FormGrid from '../../components/library/FormGrid.tsx'
import { DateInput } from '../../islands/form/inputs/date.tsx'


export default function CreatePatientCase(ctx: Context<unknown>) {
  return (
    <HealthWorkerHomePageLayout
      title='Create Patient Case'
      url={ctx.url}
      route={ctx.route!}
      params={{}}
      employee={TUTORIAL_EMPLOYEE}
      tutorial
    >
      <Form method='GET' action="/recommended_dose_calculator/recommended_medications" className='flex flex-col gap-8 py-6'>
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
    </HealthWorkerHomePageLayout>
  )
}
