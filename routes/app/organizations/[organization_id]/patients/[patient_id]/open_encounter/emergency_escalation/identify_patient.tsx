import z from 'zod'
import { completeAndProceedToNextStep, OpenEncounterWorkflowContext, OpenEncounterWorkflowPage } from '../_middleware.tsx'
import { patients } from '../../../../../../../../db/models/patients.ts'
import { postHandler } from '../../../../../../../../backend/postHandler.ts'
import { promiseProps } from '../../../../../../../../util/promiseProps.ts'
import PersonalSection from '../../../../../../../../islands/patient-registration/PersonalSection.tsx'
import { SERVER_COUNTRY } from '../../../../../../../../db/models/countries.ts'
import { PatientRegistrationPersonalSchema } from '../registration/personal.tsx'
import { AddPatientSearch } from '../../../../../../../../islands/waiting_room/AddPatientSearch.tsx'
import FormSection from '../../../../../../../../components/library/FormSection.tsx'
import { RadioButtonGroup } from '../../../../../../../../components/library/RadioButtonGroup.tsx'
import { ModeOfArrivalFormSection } from '../../../../../../../../islands/ModeOfArrivalFormSection.tsx'
import { positive_integer, sex, varchar255 } from '../../../../../../../../util/validators.ts'
import { Separator } from '../../../../../../../../components/Separator.tsx'

import { ReturningOrNewPatient } from '../../../../../../../../islands/ReturningOrNewPatient.tsx'
import { asNames } from '../../../../../../../../util/asNames.ts'
import { assertNotEquals } from 'std/assert/assert_not_equals.ts'
import { patient_new_encounters } from '../../../../../../../../db/models/patient_new_encounters.ts'
import { patient_workflows } from '../../../../../../../../db/models/patient_workflows.ts'
import redirect from '../../../../../../../../util/redirect.ts'

const IdentifyPatientSchema = z.object({
  patient_id: z.string().uuid().optional(),
  patient_name: varchar255,
  date_of_birth: z.string().date(),
  sex,
  gender: varchar255,
  mode_of_arrival: z.enum(['just_arrived', 'en_route_personal', 'en_route_ambulance']),
  eta_minutes: positive_integer.optional().default(0),
})

export const handler = postHandler(
  IdentifyPatientSchema,
  async (ctx: OpenEncounterWorkflowContext, { patient_id: identified_patient_id, ...form_values }) => {
    console.log({ identified_patient_id })
    const { trx, organization, organization_employment, workflow, step, organization_id } = ctx.state
    const newly_created_patient = ctx.state.patient_id

    // New patient
    if (!identified_patient_id) {
      const { response } = await promiseProps({
        updating_patient: patients.updateById(trx, newly_created_patient, {
          ...asNames({
            name: form_values.patient_name,
          }),
          date_of_birth: form_values.date_of_birth,
          sex: form_values.sex,
          gender: form_values.gender,
        }),
        response: completeAndProceedToNextStep(ctx),
      })
      return response
    }

    // Returning patient
    assertNotEquals(identified_patient_id, newly_created_patient)

    await patients.removeById(trx, newly_created_patient)

    const { patient_workflow_id } = await patient_new_encounters.create(
      trx,
      {
        organization,
        organization_employment,
        patient: { patient_id: identified_patient_id },
        current_workflow: 'emergency_escalation',
        next_workflows: ['stabilization'],
      },
    )

    await patient_workflows.completedStep(trx, {
      workflow,
      step,
      patient_workflow_id,
    })

    const first_incomplete_step = 'emergency_reason'

    return redirect(`/app/organizations/${organization_id}/patients/${identified_patient_id}/open_encounter/${workflow}/${first_incomplete_step}`)
  },
)

// deno-lint-ignore require-await
export async function EmergencyEscalationIdentifyPatientPage(
  ctx: OpenEncounterWorkflowContext,
) {
  return (
    <>
      <ReturningOrNewPatient patient={ctx.state.patient} />
      <Separator />
      <ModeOfArrivalFormSection organization_category={ctx.state.organization.category} />
    </>
  )
}

export default OpenEncounterWorkflowPage(EmergencyEscalationIdentifyPatientPage)
