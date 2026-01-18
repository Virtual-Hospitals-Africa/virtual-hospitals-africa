import db from '../../../../../db/db.ts'
import { addTestEmployeeWithSession } from '../../../../_helpers/employees.ts'
import { createTestOrganization } from '../../../../_helpers/organizations.ts'
import z from 'zod'
import { EmergencyEscalationIdentifyPatientSchema } from '../../../../../routes/app/organizations/[organization_id]/patients/[patient_id]/open_encounter/emergency_escalation/identify_patient.tsx'
import { EmergencyEscalationEmergencyReasonSchema } from '../../../../../routes/app/organizations/[organization_id]/patients/[patient_id]/open_encounter/emergency_escalation/emergency_reason.tsx'
import { EmergencyEscalationNotifyStaffSchema } from '../../../../../routes/app/organizations/[organization_id]/patients/[patient_id]/open_encounter/emergency_escalation/notify_staff.tsx'
import { assert } from 'std/assert/assert.ts'
import asFormData from '../../../../../util/asFormData.ts'
import entries from '../../../../../util/entries.ts'
import keys from '../../../../../util/keys.ts'
import { extractUUIDParam } from 'test/_helpers/extractUUIDParam.ts'

export type EmergencyEscalationScenario = {
  identify_patient?: z.input<typeof EmergencyEscalationIdentifyPatientSchema>
  emergency_reason?: z.input<typeof EmergencyEscalationEmergencyReasonSchema>
  notify_staff?: z.input<typeof EmergencyEscalationNotifyStaffSchema>
}

/**
 * Sets up a EmergencyEscalationScenario, going as far into the workflow as data provided
 */
export async function setupEmergencyEscalation(
  steps: EmergencyEscalationScenario,
) {
  const clinic = await createTestOrganization(db)

  // const nurse = await addTestEmployeeWithSession(db, {
  //   profession: 'nurse',
  //   registration_status: 'approved',
  //   organization_id: clinic.id,
  // })

  const receptionist = await addTestEmployeeWithSession(db, {
    profession: 'receptionist',
    registration_status: 'approved',
    organization_id: clinic.id,
  })

  let $ = await receptionist.fetchCheerio(`/app/organizations/${clinic.id}/patients/start-emergency-escalation`, {
    method: 'POST',
  })

  const initial_patient_id = extractUUIDParam($, 'patients')

  function openEncounterRoute(path: string) {
    assert(!path.startsWith('/'))
    return `/app/organizations/${clinic.id}/patients/${initial_patient_id}/open_encounter/${path}`
  }

  function emergencyEscalationRoute(step: keyof EmergencyEscalationScenario) {
    return openEncounterRoute(`emergency_escalation/${step}`)
  }

  function getStep(step: keyof EmergencyEscalationScenario) {
    return receptionist.fetchCheerio(emergencyEscalationRoute(step))
  }

  async function postStep(
    steps: Partial<EmergencyEscalationScenario>,
  ) {
    for (const [step, data] of entries(steps)) {
      if (!data) continue

      $ = await receptionist.fetchCheerio(
        emergencyEscalationRoute(step),
        {
          method: 'POST',
          body: asFormData(data),
        },
      )
    }
    assert($)
    return $
  }

  if (keys(steps).length) {
    await postStep(steps)
  }

  return {
    $,
    clinic,
    receptionist,
    initial_patient_id,
    getStep,
    postStep,
    openEncounterRoute,
    emergencyEscalationRoute,
  }
}
