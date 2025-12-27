import db from '../../../../../db/db.ts'
import { CommonConditionKey, WarningSignKey } from '../../../../../types.ts'
import asFormData from '../../../../../util/asFormData.ts'
import { addTestEmployeeWithSession } from '../../../../_helpers/employees.ts'
import { createTestOrganization } from '../../../../_helpers/organizations.ts'
import {
  insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest,
  PartialPatientDemographics,
} from '../../../../_helpers/workflows.ts'
import fromEntries from '../../../../../util/fromEntries.ts'
import { WARNING_SIGNS } from '../../../../../shared/warning_signs.ts'
import {
  VitalAssessment,
  VitalMeasurement,
} from '../../../../../shared/vitals.ts'
import { assert } from 'std/assert/assert.ts'

export type TriageScenario = {
  patient_demographics: PartialPatientDemographics
  warning_signs: WarningSignKey[]
  conditions?: CommonConditionKey[]
  height_and_weight?: {
    height: {
      value: number
      units: string
    }
    weight: {
      value: number
      units: string
    }
  }
  vitals?: {
    measurements: {
      [v in VitalMeasurement]?: {
        value: number
        units: string
      }
    }
    assessments: {
      [v in VitalAssessment]?: {
        value_snomed_concept_id: string
      }
    }
  }
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

  const warning_signs_post_data = fromEntries(
    warning_signs.map((
      warning_sign,
    ) => [
      warning_sign,
      WARNING_SIGNS[warning_sign].clinical_finding_s_expression,
    ]),
  )

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
    const conditions_post_data = fromEntries(
      conditions.map((condition) => [condition, { existence: 'Yes' }]),
    )
    if (!conditions_post_data.pregnancy) {
      conditions_post_data.pregnancy = { existence: 'No' }
    }
    if (!conditions_post_data.diabetes) {
      conditions_post_data.diabetes = { existence: 'No' }
    }
    $ = await nurse.fetchCheerio(
      `/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/triage/brief_history`,
      {
        method: 'POST',
        body: asFormData(conditions_post_data),
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
