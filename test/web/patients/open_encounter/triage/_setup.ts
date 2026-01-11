import db from '../../../../../db/db.ts'
import asFormData from '../../../../../util/asFormData.ts'
import { addTestEmployeeWithSession } from '../../../../_helpers/employees.ts'
import { createTestOrganization } from '../../../../_helpers/organizations.ts'
import {
  insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest,
  PartialPatientDemographics,
} from '../../../../_helpers/workflows.ts'
import { assert } from 'std/assert/assert.ts'
import z from 'zod'
import { TriageWarningSignsSchema } from '../../../../../routes/app/organizations/[organization_id]/patients/[patient_id]/open_encounter/triage/warning_signs.tsx'
import { TriageBriefHistorySchema } from '../../../../../routes/app/organizations/[organization_id]/patients/[patient_id]/open_encounter/triage/brief_history.tsx'
import { TriageHeightAndWeightSchema } from '../../../../../routes/app/organizations/[organization_id]/patients/[patient_id]/open_encounter/triage/height_and_weight.tsx'
import { TriageMeasureVitalsSchema } from '../../../../../routes/app/organizations/[organization_id]/patients/[patient_id]/open_encounter/triage/measure_vitals.tsx'
import fromEntries from '../../../../../util/fromEntries.ts'
import { WARNING_SIGNS } from '../../../../../shared/warning_signs.ts'
import { CheerioAPI } from 'cheerio'
import entries from '../../../../../util/entries.ts'
import keys from '../../../../../util/keys.ts'

export type TriageSteps = {
  warning_signs?: z.input<typeof TriageWarningSignsSchema>
  brief_history?: z.input<typeof TriageBriefHistorySchema>
  height_and_weight?: z.input<
    typeof TriageHeightAndWeightSchema
  >
  vitals?: z.input<typeof TriageMeasureVitalsSchema>
}

export type TriageScenario = TriageSteps & {
  patient_demographics: PartialPatientDemographics
  early_brief_history?: z.input<typeof TriageBriefHistorySchema>
}

export function asWarningSigns(sign_keys: Array<keyof typeof WARNING_SIGNS>) {
  return {
    warning_signs: fromEntries(
      sign_keys.map((key) => [key, {
        existence: 'Yes' as const,
        warning_sign_key: key,
        priority_level: WARNING_SIGNS[key].sats_priority,
        s_expression: WARNING_SIGNS[key].clinical_finding_s_expression,
      }]),
    ),
  } satisfies TriageScenario['warning_signs']
}

/**
 * Sets up a triage scenario, going as far into the workflow as data provided
 */
export async function setupTriage(
  {
    patient_demographics,
    ...steps
  }: TriageScenario,
) {
  const clinic = await createTestOrganization(db)

  const nurse = await addTestEmployeeWithSession(db, {
    profession: 'nurse',
    registration_status: 'approved',
    organization_id: clinic.id,
  })

  const encounter =
    await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
      db,
      nurse.health_worker.organization_id,
      {
        patient_demographics,
        employment_id: nurse.health_worker.employee_id,
      },
    )

  function openEncounterRoute(path: string) {
    assert(!path.startsWith('/'))
    return `/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/${path}`
  }

  function triageRoute(step: keyof TriageSteps) {
    return openEncounterRoute(`triage/${step}`)
  }

  function getStep(step: keyof TriageSteps) {
    return nurse.fetchCheerio(triageRoute(step))
  }

  async function postStep(
    steps: Partial<NonNullable<Omit<TriageScenario, 'patient_demographics'>>>,
  ) {
    let $!: CheerioAPI & { url: string }
    for (const [step, data] of entries(steps)) {
      if (!data) continue
      const step_name = step === 'early_brief_history' ? 'brief_history' : step
      $ = await nurse.fetchCheerio(
        triageRoute(step_name),
        {
          method: 'POST',
          body: asFormData(data),
        },
      )
    }
    assert($)
    return $
  }

  const $ =
    await (keys(steps).length ? postStep(steps) : getStep('warning_signs'))

  return {
    $,
    clinic,
    nurse,
    encounter,
    getStep,
    postStep,
    openEncounterRoute,
    triageRoute,
  }
}
