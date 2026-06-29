import { parseRequest } from '../../../backend/parseForm.ts'
import { TrxContext } from '../../../backend/attachTrx.ts'
import {
  DecisionSupportDisclaimer,
  SnomedIcd10MappingAudit,
} from '../../../components/SnomedIcd10MappingAudit.tsx'
import HealthWorkerContentsWithSidebarAndDrawer from '../../../components/library/layout/HealthWorkerContentsWithSidebarAndDrawer.tsx'
import { RecommendedMedication } from '../../../components/RecommendedMedication.tsx'
import { LogoWithFullText } from '../../../components/library/Logo.tsx'
import { recommended_doses } from '../../../db/models/recommended_doses.ts'
import { snomed_to_icd10 } from '../../../db/models/snomed_to_icd10.ts'
import {
  RECOMMENDED_DOSE_CALCULATOR_SUGGESTED_MEDICATIONS_HEADER,
} from '../../../shared/snomed_to_icd10.ts'
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
  const mapping_result = await snomed_to_icd10.mapConcepts(
    ctx.state.trx,
    patient_case.snomed_concept_ids,
    { sex: patient_case.sex, dob: patient_case.dob },
  )
  const primary_snomed_icd10 = snomed_to_icd10.primaryIcd10CodesForLookup(mapping_result)
  const conditions_for_lookup = [...patient_case.conditions, ...primary_snomed_icd10]
  const matching_medicines = await recommended_doses.getRecommendedDosesWithPatientCaseApplied({
    ...patient_case,
    conditions: conditions_for_lookup,
  })
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
        <DecisionSupportDisclaimer />

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
          <h2 class='text-lg font-semibold text-gray-900'>ICD-10 codes used for dose lookup</h2>
          <p class='text-sm text-gray-600'>
            Manually entered ICD-10 codes plus primary SNOMED-derived candidates only. Supplementary SNOMED map groups are listed in the audit trail below and do not broaden suggestions.
          </p>
          {conditions_for_lookup.length > 0
            ? (
              <ul class='flex flex-col gap-1 list-disc list-inside'>
                {conditions_for_lookup.map((code) => <li key={code} class='text-sm text-gray-900'>{code}</li>)}
              </ul>
            )
            : <p class='text-sm text-gray-500'>No ICD-10 codes available for lookup. Enter ICD-10 manually or add SNOMED concepts above.</p>}
        </section>

        <SnomedIcd10MappingAudit
          snomed_concept_ids={patient_case.snomed_concept_ids}
          mappings={mapping_result}
        />

        <section class='flex flex-col gap-2'>
          <h2 class='text-lg font-semibold text-gray-900'>
            {RECOMMENDED_DOSE_CALCULATOR_SUGGESTED_MEDICATIONS_HEADER}
            {matching_medicines.length > 0 && <span class='ml-2 text-sm font-normal text-gray-500'>({matching_medicines.length})</span>}
          </h2>
          <p class='text-sm text-gray-600'>
            Dose calculations below are suggestions based on the codes above. Review each option before prescribing.
          </p>
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
                {!conditions_for_lookup.length
                  ? 'No ICD-10 codes specified for lookup.'
                  : 'No suggested medications matched the specified ICD-10 codes.'}
              </p>
            )}
        </section>
      </div>
    </HealthWorkerContentsWithSidebarAndDrawer>
  )
}
