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
import { WARNING_SIGNS } from '../../../../../shared/warning_signs.ts'
import { WarningSignKey } from '../../../../../types.ts'

// Note: We don't import the schema from warning_signs.tsx because the POST body
// structure differs from the schema's internal structure. The handler uses
// z.record(z.string(), WarningSignSchema).transform(values) which means POST data
// is keyed by name, not an array.

// Import schemas from route files to ensure tests don't drift from implementation
import { TriageBriefHistorySchema } from '../../../../../routes/app/organizations/[organization_id]/patients/[patient_id]/open_encounter/triage/brief_history.tsx'
import { TriageHeightAndWeightSchema } from '../../../../../routes/app/organizations/[organization_id]/patients/[patient_id]/open_encounter/triage/height_and_weight.tsx'
import { TriageMeasureVitalsSchema } from '../../../../../routes/app/organizations/[organization_id]/patients/[patient_id]/open_encounter/triage/measure_vitals.tsx'

export type TriageScenario = {
  patient_demographics: PartialPatientDemographics
  warning_signs: WarningSignKey[]
  conditions?: z.input<typeof TriageBriefHistorySchema>
  height_and_weight?: z.input<
    typeof TriageHeightAndWeightSchema
  >['measurements']
  vitals?: z.input<typeof TriageMeasureVitalsSchema>
}

/**
 * Sets up a triage scenario, going as far into the workflow as data provided
 */
export async function setupTriage(
  {
    patient_demographics,
    warning_signs,
    conditions,
    height_and_weight,
    vitals,
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

  // Build warning signs POST data in the format expected by the handler:
  // { warning_signs: { [key]: { s_expression, existence, priority_level, ... } } }
  const warning_signs_post_data: Record<string, {
    s_expression: string
    existence: 'Yes'
    warning_sign_key: string
    priority_level: string
  }> = {}

  for (const key of warning_signs) {
    const sign = WARNING_SIGNS[key]
    warning_signs_post_data[key] = {
      s_expression: sign.clinical_finding_s_expression,
      existence: 'Yes',
      warning_sign_key: key,
      priority_level: sign.sats_priority,
    }
  }

  let $ = await nurse.fetchCheerio(
    `/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/triage/warning_signs`,
    {
      method: 'POST',
      body: asFormData({
        warning_signs: warning_signs_post_data,
      }),
    },
  )

  if (conditions) {
    $ = await nurse.fetchCheerio(
      `/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/triage/brief_history`,
      {
        method: 'POST',
        body: asFormData(conditions),
      },
    )
  } else {
    assert(!height_and_weight)
    assert(!vitals)
  }

  if (height_and_weight) {
    $ = await nurse.fetchCheerio(
      `/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/triage/height_and_weight`,
      {
        method: 'POST',
        body: asFormData({
          measurements: height_and_weight,
        }),
      },
    )
  } else {
    assert(!vitals)
  }

  if (vitals) {
    $ = await nurse.fetchCheerio(
      `/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/triage/measure_vitals`,
      {
        method: 'POST',
        body: asFormData(vitals),
      },
    )
  }

  return { $, clinic, nurse, encounter }
}
