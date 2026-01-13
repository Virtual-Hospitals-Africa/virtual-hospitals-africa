import db from '../../../../../db/db.ts'
import asFormData from '../../../../../util/asFormData.ts'
import { addTestEmployeeWithSession, TestEmployeeWithSession } from '../../../../_helpers/employees.ts'
import { createTestOrganization } from '../../../../_helpers/organizations.ts'
import {
  insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest,
  insertReturningSeekingTreatmentWithEmployeeForTest,
  PartialPatientDemographics,
  TestEncounterRelativeToHealthWorker,
} from '../../../../_helpers/workflows.ts'
import { assert } from 'std/assert/assert.ts'
import z from 'zod'
import {
  TriageWarningSignSchema,
  TriageWarningSignsSchema,
} from '../../../../../routes/app/organizations/[organization_id]/patients/[patient_id]/open_encounter/triage/warning_signs.tsx'
import { TriageBriefHistorySchema } from '../../../../../routes/app/organizations/[organization_id]/patients/[patient_id]/open_encounter/triage/brief_history.tsx'
import { TriageHeightAndWeightSchema } from '../../../../../routes/app/organizations/[organization_id]/patients/[patient_id]/open_encounter/triage/height_and_weight.tsx'
import { TriageMeasureVitalsSchema } from '../../../../../routes/app/organizations/[organization_id]/patients/[patient_id]/open_encounter/triage/measure_vitals.tsx'
import fromEntries from '../../../../../util/fromEntries.ts'
import { KEYED_WARNING_SIGNS, WARNING_SIGNS } from '../../../../../shared/warning_signs.ts'
import { CheerioAPI } from 'cheerio'
import entries from '../../../../../util/entries.ts'
import keys from '../../../../../util/keys.ts'
import isKeyOf from '../../../../../util/isKeyOf.ts'

export type TriageSteps = {
  warning_signs?: z.input<typeof TriageWarningSignsSchema>
  brief_history?: z.input<typeof TriageBriefHistorySchema>
  height_and_weight?: z.input<
    typeof TriageHeightAndWeightSchema
  >
  measure_vitals?: z.input<typeof TriageMeasureVitalsSchema>
}

export type TriageScenarioNewPatient = TriageSteps & {
  patient_demographics: PartialPatientDemographics
  early_brief_history?: z.input<typeof TriageBriefHistorySchema>
}

const ONLY_WHEN_PREGNANCY_STATUS = {
  'Pregnancy and abdominal trauma': true,
  'Pregnancy and abdominal pain': true,
  'Abdominal pain': false,
}

export function asWarningSigns(
  sign_keys: Array<keyof typeof KEYED_WARNING_SIGNS>,
  opts: { pregnant: boolean },
): z.input<typeof TriageWarningSignsSchema> {
  return { warning_signs: fromEntries(applicableWarningSigns()) }

  function* applicableWarningSigns(): Generator<
    [string, z.input<typeof TriageWarningSignSchema>]
  > {
    for (const sign of WARNING_SIGNS) {
      if (
        isKeyOf(sign.key, ONLY_WHEN_PREGNANCY_STATUS) &&
        ONLY_WHEN_PREGNANCY_STATUS[sign.key] !== opts.pregnant
      ) continue

      const field: z.input<typeof TriageWarningSignSchema> = {
        warning_sign_key: sign.key,
        priority_level: sign.sats_priority,
        s_expression: sign.clinical_finding_s_expression,
      }
      if (sign_keys.includes(sign.key)) {
        field.existence = 'Yes'
      }
      yield [sign.key, field]
    }
  }
}

async function setupTriage({
  clinic,
  nurse,
  encounter,
  steps,
}: {
  clinic: { id: string }
  nurse: TestEmployeeWithSession
  encounter: TestEncounterRelativeToHealthWorker
  steps: TriageSteps
}) {
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
    steps: Partial<NonNullable<Omit<TriageScenarioNewPatient, 'patient_demographics'>>>,
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

  const $ = await (keys(steps).length ? postStep(steps) : getStep('warning_signs'))

  return {
    $,
    clinic,
    nurse,
    encounter,
    patient_id: encounter.patient.id,
    patient_encounter_id: encounter.patient_encounter_id,
    getStep,
    postStep,
    openEncounterRoute,
    triageRoute,
  }
}

/**
 * Sets up a triage scenario for a new patient, going as far into the workflow steps as data provided
 */
export async function setupTriageNewPatient(
  {
    patient_demographics,
    ...steps
  }: TriageScenarioNewPatient,
) {
  const clinic = await createTestOrganization(db)

  const nurse = await addTestEmployeeWithSession(db, {
    profession: 'nurse',
    registration_status: 'approved',
    organization_id: clinic.id,
  })

  const encounter = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
    db,
    nurse.health_worker.organization_id,
    {
      patient_demographics,
      employment_id: nurse.health_worker.employee_id,
    },
  )

  return setupTriage({ clinic, nurse, encounter, steps })
}

/**
 * Sets up a triage scenario for a returning patient, going as far into the workflow steps as data provided
 */
export async function setupTriageReturningPatient(
  {
    nurse,
    clinic,
    patient_id,
    ...steps
  }: TriageSteps & {
    nurse: TestEmployeeWithSession
    clinic: { id: string }
    patient_id: string
  },
) {
  const encounter = await insertReturningSeekingTreatmentWithEmployeeForTest(
    db,
    nurse.health_worker.organization_id,
    {
      patient_id,
      employment_id: nurse.health_worker.employee_id,
    },
  )

  return setupTriage({ clinic, nurse, encounter, steps })
}
