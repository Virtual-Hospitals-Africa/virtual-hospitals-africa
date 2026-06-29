import { parseRequest } from '../../../backend/parseForm.ts'
import { TrxContext } from '../../../backend/attachTrx.ts'
import { DecisionSupportDisclaimer } from '../../../components/SnomedIcd10MappingAudit.tsx'
import { RecommendedDosesResults } from '../../../components/RecommendedDosesResults.tsx'
import HealthWorkerContentsWithSidebarAndDrawer from '../../../components/library/layout/HealthWorkerContentsWithSidebarAndDrawer.tsx'
import { LogoWithFullText } from '../../../components/library/Logo.tsx'
import { recommended_dose_calculator } from '../../../db/models/recommended_dose_calculator.ts'
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
          <DecisionSupportDisclaimer />
          <h2 class='text-lg font-semibold text-gray-900'>Missing patient details</h2>
          <p class='text-sm text-gray-700'>
            Please fill in the patient case form (Date of Birth, Sex, Height and Weight are required) before viewing suggested doses.
          </p>
          <a href={create_patient_case_route} class='text-sm font-medium text-indigo-600 hover:text-indigo-500'>
            ← Back to create patient case
          </a>
        </div>
      </HealthWorkerContentsWithSidebarAndDrawer>
    )
  }
  const patient_case = parsed.data
  const lookup = await recommended_dose_calculator.lookup(ctx.state.trx, patient_case)
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
      <div class='flex flex-col gap-6 py-6 px-4'>
        <RecommendedDosesResults
          patient_case={patient_case}
          lookup={lookup}
          snomed_source_description='Optional SNOMED concept ids from the form above, translated to suggested ICD-10 candidate codes for matching.'
          icd10_lookup_description='Manually entered ICD-10 codes plus primary SNOMED-derived candidates only. Supplementary SNOMED map groups are listed in the audit trail below and do not broaden suggestions.'
        />
      </div>
    </HealthWorkerContentsWithSidebarAndDrawer>
  )
}
