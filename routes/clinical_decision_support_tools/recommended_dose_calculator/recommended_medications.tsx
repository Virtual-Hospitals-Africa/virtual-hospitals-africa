import { parseRequest } from '../../../backend/parseForm.ts'
import { TrxContext } from '../../../backend/attachTrx.ts'
import { DecisionSupportDisclaimer } from '../../../components/SnomedIcd10MappingAudit.tsx'
import { RecommendedDosesResults } from '../../../components/RecommendedDosesResults.tsx'
import HealthWorkerContentsWithSidebarAndDrawer from '../../../components/library/layout/HealthWorkerContentsWithSidebarAndDrawer.tsx'
import { LogoWithFullText } from '../../../components/library/Logo.tsx'
import { snomed_to_icd10 } from '../../../db/models/snomed_to_icd10.ts'
import { recommended_doses } from '../../../db/models/recommended_doses.ts'
import { PatientCaseSchema } from '../../../shared/recommended_doses.ts'
import { primaryIcd10CodesFromSnomedMappings } from '../../../shared/snomed_to_icd10.ts'
import type { CdsSnomedRecord } from '../../../shared/recommended_dose_calculator/lookup.ts'
import { StepsSidebar } from '../../../components/library/sidebar/Steps.tsx'
import { Top } from '../../../components/library/sidebar/Top.tsx'
import { z } from 'zod'

const create_patient_case_route = '/clinical_decision_support_tools/recommended_dose_calculator/create_patient_case'

// Parse SNOMED concept IDs from a comma/whitespace-separated string in query params.
// Kept separate from PatientCaseSchema since the schema covers only demographics.
const SnomedIdsSchema = z.preprocess(
  (value) => {
    if (Array.isArray(value)) return value
    if (typeof value === 'string') return value.split(/[\s,]+/).filter(Boolean)
    return []
  },
  z.string().regex(/^\d+$/).array(),
)

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
  const url_params = new URL(ctx.req.url).searchParams
  const snomed_ids_result = SnomedIdsSchema.safeParse(url_params.getAll('snomed_concept_ids').join(',') || url_params.get('snomed_concept_ids'))
  const snomed_records: CdsSnomedRecord[] = snomed_ids_result.success ? snomed_ids_result.data.map((id) => ({ specific_snomed_concept_id: id })) : []

  const mapping_result = await snomed_to_icd10.mapConcepts<CdsSnomedRecord>(
    ctx.state.trx,
    patient_case,
    snomed_records,
  )
  const conditions_for_lookup = primaryIcd10CodesFromSnomedMappings(mapping_result.by_concept.values())
  const sources = [...mapping_result.by_concept.entries()].flatMap(([record, mapping]) => {
    const codes = mapping.codes.filter((c) => c.is_primary).map((c) => c.icd10_code)
    return codes.length ? [{ due_to: record, codes }] : []
  })
  const matching_medicines_raw = await recommended_doses.getRecommendedDosesWithPatientCaseApplied<CdsSnomedRecord>(
    patient_case,
    sources,
  )
  const matching_medicines = matching_medicines_raw.map((med) => ({
    ...med,
    due_to: med.due_to,
  }))

  const lookup = { mapping_result, conditions_for_lookup, matching_medicines }

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
