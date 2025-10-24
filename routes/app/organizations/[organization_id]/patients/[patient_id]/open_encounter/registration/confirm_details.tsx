import {
  completeAndProceedToNextStep,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import * as patient_registration from '../../../../../../../../db/models/patient_registration.ts'
import { postHandler } from '../../../../../../../../util/postHandler.ts'
import PatientRegistrationSummary from '../../../../../../../../components/patients/registration/Summary.tsx'

const PatientRegistrationConfirmDetailsSchema = z.object({})

export const handler = postHandler(
  PatientRegistrationConfirmDetailsSchema,
  (_req, ctx: OpenEncounterWorkflowContext) => {
    return completeAndProceedToNextStep(ctx)
  },
)

export async function PatientRegistrationConfirmPage(
  ctx: OpenEncounterWorkflowContext,
) {
  const patient_registration_summary = await patient_registration
    .getSummaryById(
      ctx.state.trx,
      ctx.state.patient.id,
    )
  return (
    <PatientRegistrationSummary
      organization_id={ctx.state.organization.id}
      patient={patient_registration_summary}
      this_visit={ctx.state.encounter}
    />
  )
}

export default OpenEncounterWorkflowPage(PatientRegistrationConfirmPage)
