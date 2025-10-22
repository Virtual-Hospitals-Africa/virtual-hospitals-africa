import {
  completeAndProceedToNextStep,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import ThisVisitSection from '../../../../../../../../components/patient-registration/ThisVisitSection.tsx'
import { postHandler } from '../../../../../../../../util/postHandler.ts'
import * as patient_encounters from '../../../../../../../../db/models/patient_encounters.ts'
import * as appointments from '../../../../../../../../db/models/appointments.ts'
import { promiseProps } from '../../../../../../../../util/promiseProps.ts'
import { Button } from '../../../../../../../../components/library/Button.tsx'

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
  const appointments_today_at_this_organization = await appointments
    .getForPatient(
      trx,
      {
        patient_id: patient.id,
        organization_id: organization.id,
        time_range: 'today',
      },
    )

  const closed_encounters_at_this_organization = await patient_encounters
    .search(trx, {
      organization_id: organization.id,
      is_closed: true,
    })

  return {
    children: (
      <ThisVisitSection
        this_visit={{ reason, notes }}
        departments={departments}
      />
    ),
    buttons: (
      <>
        <Button
          type='submit'
          name='next_workflow'
          value='start_triage'
          className='flex-1 max-w-xl'
        >
          Continue with registration
        </Button>
        <Button
          type='submit'
          name='next_workflow'
          value='continue_with_registration'
          className='flex-1 max-w-xl'
        >
          Continue with registration
        </Button>
      </>
    ),
  }
}

export default OpenEncounterWorkflowPage(PatientRegistrationThisVisitPage)
