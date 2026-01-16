import { completeAndProceedToNextStep, OpenEncounterWorkflowContext, OpenEncounterWorkflowPage } from '../_middleware.tsx'
import { patients } from '../../../../../../../../db/models/patients.ts'
import { postHandler } from '../../../../../../../../backend/postHandler.ts'
import { promiseProps } from '../../../../../../../../util/promiseProps.ts'
import PersonalSection from '../../../../../../../../islands/patient-registration/PersonalSection.tsx'
import { SERVER_COUNTRY } from '../../../../../../../../db/models/countries.ts'
import { PatientRegistrationPersonalSchema } from '../registration/personal.tsx'

export const handler = postHandler(
  PatientRegistrationPersonalSchema,
  async (ctx: OpenEncounterWorkflowContext, form_values) => {
    const { response } = await promiseProps({
      upserting_patient: patients.upsert(ctx.state.trx, {
        id: ctx.state.patient.id,
        ...form_values,
      }),
      response: completeAndProceedToNextStep(ctx),
    })
    return response
  },
)

// deno-lint-ignore require-await
export async function EmergencyEscalationIdentifyPatientPage(
  ctx: OpenEncounterWorkflowContext,
) {
  return (
    <PersonalSection
      patient={ctx.state.patient}
      organization_default_language_code={ctx.state.organization
        .most_common_language_code}
      server_country={SERVER_COUNTRY}
      previously_completed_step={ctx.state.previously_completed_step}
    />
  )
}

export default OpenEncounterWorkflowPage(EmergencyEscalationIdentifyPatientPage)
