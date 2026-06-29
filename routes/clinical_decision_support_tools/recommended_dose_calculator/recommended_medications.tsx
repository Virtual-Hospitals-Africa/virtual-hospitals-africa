import { parseRequest } from '../../../backend/parseForm.ts'
import { TrxContext } from '../../../backend/attachTrx.ts'
import HealthWorkerContentsWithSidebarAndDrawer from '../../../components/library/layout/HealthWorkerContentsWithSidebarAndDrawer.tsx'
import { RecommendedMedication } from '../../../components/RecommendedMedication.tsx'
import { LogoWithFullText } from '../../../components/library/Logo.tsx'
import { recommended_doses } from '../../../db/models/recommended_doses.ts'
import { snomed_to_icd10 } from '../../../db/models/snomed_to_icd10.ts'
import { PatientCaseSchema } from '../../../shared/recommended_doses.ts'
import { StepsSidebar } from '../../../components/library/sidebar/Steps.tsx'
import { Top } from '../../../components/library/sidebar/Top.tsx'

const create_patient_case_route = '/clinical_decision_support_tools/recommended_dose_calculator/create_patient_case'

export default async function RecommendedMedications(
  ctx: TrxContext,
) {
  const parsed = await parseRequest(ctx.req, PatientCaseSchema.safeParse)
  if (!parsed.success) {
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
                route: create_patient_case_route,
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
        <div class='flex flex-col gap-4 py-6 px-4'>
          <h2 class='text-lg font-semibold text-gray-900'>Missing patient details</h2>
          <p class='text-sm text-gray-700'>
            Please fill in the patient case form (Date of Birth, Sex, Height and Weight are required) before viewing recommended medications.
          </p>
          <a href={create_patient_case_route} class='text-sm font-medium text-indigo-600 hover:text-indigo-500'>
            ← Back to create patient case
          </a>
        </div>
      </HealthWorkerContentsWithSidebarAndDrawer>
    )
  }
  const patient_case = parsed.data
  const icd10_by_concept = await snomed_to_icd10.icd10Codes(ctx.state.trx, patient_case.snomed_concept_ids)
  const mapped_icd10_codes = [...new Set([...icd10_by_concept.values()].flat())]
  const conditions = [...patient_case.conditions, ...mapped_icd10_codes]
  const matching_medicines = await recommended_doses.getRecommendedDosesWithPatientCaseApplied({ ...patient_case, conditions })
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
          {conditions.length > 0
            ? (
              <ul class='flex flex-col gap-1 list-disc list-inside'>
                {conditions.map((code) => <li key={code} class='text-sm text-gray-900'>{code}</li>)}
              </ul>
            )
            : <p class='text-sm text-gray-500'>No conditions specified.</p>}
          {patient_case.snomed_concept_ids.length > 0 && (
            <p class='text-xs text-gray-500'>
              SNOMED {patient_case.snomed_concept_ids.join(', ')} → ICD-10 {mapped_icd10_codes.length ? mapped_icd10_codes.join(', ') : '(no mapping)'}
            </p>
          )}
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
                    medicine={med}
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
