import { Context } from 'fresh'
import { HealthWorkerHomePageLayout } from '../../components/library/layout/HealthWorkerHomePage.tsx'
import { TUTORIAL_EMPLOYEE } from '../../shared/tutorial/mock-data.ts'
import Form from '../../components/library/Form.tsx'
import FormRow from '../../components/library/FormRow.tsx'
import FormSection from '../../components/library/FormSection.tsx'
import { Button } from '../../components/library/Button.tsx'
import { InternalInput } from '../../islands/form/inputs/_internal.tsx'
import { SelectWithOptions } from '../../islands/form/inputs/select_with_options.tsx'
import { NumberInput } from '../../islands/form/inputs/number.tsx'
import PatientConditionsSection from '../../islands/recommended_dose_calculator/PatientConditionsSection.tsx'
import { requestAsRecord } from '../../backend/parseForm.ts'
import redirect from '../../util/redirect.ts'

export const handler = {
  async POST(ctx: Context<unknown>): Promise<Response> {
    const record = await requestAsRecord(ctx.req)
    const params = new URLSearchParams()

    if (typeof record.sex === 'string') params.set('sex', record.sex)
    if (typeof record.dob === 'string') params.set('dob', record.dob)
    if (record.height_cm != null) params.set('height_cm', String(record.height_cm))
    if (record.weight_kg != null) params.set('weight_kg', String(record.weight_kg))

    if (typeof record.conditions === 'object' && record.conditions !== null) {
      const conditions = record.conditions as Record<string, string>
      Object.entries(conditions).forEach(([key, value]) => {
        params.set(`conditions.${key}`, value)
      })
    }

    return redirect(
      `/recommended_dose_calculator/recommended_medications?${params.toString()}`,
    )
  },
}

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
      <Form method='POST' className='flex flex-col gap-8 py-6'>
        <FormSection header='Demographic Details'>
          <FormRow>
            <InternalInput
              name='dob'
              type='date'
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
          </FormRow>
          <FormRow>
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
          </FormRow>
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
