import { Context } from 'fresh'
import { parseRequest } from '../../../backend/parseForm.ts'
import HealthWorkerContentsWithSidebarAndDrawer from '../../../components/library/layout/HealthWorkerContentsWithSidebarAndDrawer.tsx'
import { StepsSidebar } from '../../../components/library/Sidebar.tsx'
import { MedicineRecommendation, RecommendedMedication } from '../../../components/RecommendedMedication.tsx'
import { LogoWithFullText } from '../../../components/library/Logo.tsx'
import { PatientCaseSchema, recommended_doses } from '../../../db/models/recommended_doses.ts'

export default async function RecommendedMedications(
  ctx: Context<unknown>,
) {
  const patient_case = await parseRequest(ctx.req, PatientCaseSchema.parse)
  const matching_medicines = await recommended_doses.getRecommendedDosesWithPatientCaseApplied(patient_case)
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
          steps_completed={['Create patient case']}
        />
      }
    >
      <div class='flex flex-col gap-6 py-6  px-4'>
        <section class='flex flex-col gap-2'>
          <h2 class='text-lg font-semibold text-gray-900'>Patient Details</h2>
          <dl class='flex flex-col gap-1'>
            <div class='flex gap-4'>
              <dt class='w-32 text-sm font-medium text-gray-500'>Date of Birth</dt>
              <dd class='text-sm text-gray-900'>{patient_case.dob}</dd>
            </div>
            <div class='flex gap-4'>
              <dt class='w-32 text-sm font-medium text-gray-500'>Sex</dt>
              <dd class='text-sm text-gray-900'>{patient_case.sex}</dd>
            </div>
            <div class='flex gap-4'>
              <dt class='w-32 text-sm font-medium text-gray-500'>Height (cm)</dt>
              <dd class='text-sm text-gray-900'>{String(patient_case.height_cm)}</dd>
            </div>
            <div class='flex gap-4'>
              <dt class='w-32 text-sm font-medium text-gray-500'>Weight (kg)</dt>
              <dd class='text-sm text-gray-900'>{String(patient_case.weight_kg)}</dd>
            </div>
          </dl>
        </section>

        <section class='flex flex-col gap-2'>
          <h2 class='text-lg font-semibold text-gray-900'>Conditions</h2>
          {(patient_case.conditions?.length || 0) > 0
            ? (
              <ul class='flex flex-col gap-1 list-disc list-inside'>
                {patient_case.conditions!.map((item, i) => <li key={i} class='text-sm text-gray-900'>{item.name}</li>)}
              </ul>
            )
            : <p class='text-sm text-gray-500'>No conditions specified.</p>}
        </section>

        <section class='flex flex-col gap-2'>
          <h2 class='text-lg font-semibold text-gray-900'>
            Recommended Medications
            {matching_medicines.length > 0 && <span class='ml-2 text-sm font-normal text-gray-500'>({matching_medicines.length})</span>}
          </h2>
          {matching_medicines.length > 0
            ? (
              <div class='flex flex-col gap-4'>
                {matching_medicines.map((med, i) => (
                  <RecommendedMedication
                    key={i}
                    medicine={med as unknown as MedicineRecommendation}
                  />
                ))}
              </div>
            )
            : (
              <p class='text-sm text-gray-500'>
                {!patient_case.conditions?.length ? 'No conditions specified.' : 'No recommended medications found for the specified conditions.'}
              </p>
            )}
        </section>
      </div>
    </HealthWorkerContentsWithSidebarAndDrawer>
  )
}
