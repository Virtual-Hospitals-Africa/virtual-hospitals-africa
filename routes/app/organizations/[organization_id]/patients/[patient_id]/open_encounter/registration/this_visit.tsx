import {
  completeAndProceedToNextStep,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import ThisVisitSection from '../../../../../../../../components/patient-registration/ThisVisitSection.tsx'
import { postHandler } from '../../../../../../../../util/postHandler.ts'
import * as patient_encounters from '../../../../../../../../db/models/patient_encounters.ts'
import { promiseProps } from '../../../../../../../../util/promiseProps.ts'

const PatientRegistrationThisVisitSchema = z.object({
  next_workflow: z.enum([
    'start_triage',
    'continue_with_registration',
  ]),
  reason: z.enum([
    'seeking treatment',
    'maternity',
    'follow up',
    'referral',
    'checkup',
  ]),
  notes: z.string().optional(),
})

export const handler = postHandler(
  PatientRegistrationThisVisitSchema,
  async (
    _req,
    ctx: OpenEncounterWorkflowContext,
    { reason, notes },
  ) => {
    const { trx, encounter } = ctx.state
    const { response } = await promiseProps({
      updating_encounter: patient_encounters.updateOne(
        trx,
        encounter.patient_encounter_id,
        { reason, notes },
      ),
      response: completeAndProceedToNextStep(ctx),
    })
    return response
  },
)

export async function PatientRegistrationThisVisitPage(
  {
    state: {
      trx,
      organization_employment,
      organization,
      patient,
      encounter: { reason, notes },
      organization: { departments },
    },
  }: OpenEncounterWorkflowContext,
) {
  return (
    <ThisVisitSection
      this_visit={{ reason, notes }}
      departments={departments}
    />
  )
}

export default OpenEncounterWorkflowPage(PatientRegistrationThisVisitPage)
