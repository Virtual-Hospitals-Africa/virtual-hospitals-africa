import {
  completeLastStep,
  nextRouteAfterCompletingWorkflow,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import * as patient_registration from '../../../../../../../../db/models/patient_registration.ts'
import * as patient_encounters from '../../../../../../../../db/models/patient_encounters.ts'
import { postHandler } from '../../../../../../../../util/postHandler.ts'
import PatientRegistrationSummary from '../../../../../../../../components/patients/registration/Summary.tsx'
import { promiseProps } from '../../../../../../../../util/promiseProps.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import redirect from '../../../../../../../../util/redirect.ts'

const PatientRegistrationConfirmSchema = z.object({})

export const handler = postHandler(
  PatientRegistrationConfirmSchema,
  async (_req, ctx: OpenEncounterWorkflowContext) => {
    const {
      trx,
      patient,
      organization,
      organization_employment,
      encounter,
    } = ctx.state

    const patient_id = patient.id

    const { next_patient_presence } = await promiseProps({
      completed_last_step: completeLastStep(ctx),
      completed_registration: patient_registration.completed(trx, {
        patient_id,
      }),
      next_patient_presence: patient_encounters
        .insertSeekingTreatmentForRegisteredPatient(
          trx,
          organization,
          organization_employment,
          {
            patient_id,
            encounter: {
              create: false,
              patient_encounter_id: encounter.patient_encounter_id,
              existing: encounter,
            },
          },
        ),
    })

    assertEquals(
      next_patient_presence.id,
      patient_id,
    )

    return redirect(
      nextRouteAfterCompletingWorkflow(ctx, next_patient_presence),
    )
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
  return {
    children: (
      <PatientRegistrationSummary
        organization_id={ctx.state.organization.id}
        patient={patient_registration_summary}
        this_visit={ctx.state.encounter}
      />
    ),
    next_step_text: 'End and Save Registration',
  }
}

export default OpenEncounterWorkflowPage(PatientRegistrationConfirmPage)
