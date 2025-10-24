import {
  insertSeekingTreatmentForRegisteredPatient,
} from '../../../../../../db/models/patient_encounters.ts'
import { OrganizationContext } from '../../_middleware.ts'
import { postHandler } from '../../../../../../util/postHandler.ts'
import redirect from '../../../../../../util/redirect.ts'
import { replaceParams } from '../../../../../../util/replaceParams.ts'
import { WORKFLOW_STEPS } from '../../../../../../shared/workflow.ts'
import { assert } from 'std/assert/assert.ts'
import { getRequiredUUIDParam } from '../../../../../../util/getParam.ts'
import * as patient_encounters from '../../../../../../db/models/patient_encounters.ts'
import * as patients from '../../../../../../db/models/patients.ts'
import * as appointments from '../../../../../../db/models/appointments.ts'
import z from 'zod'
import generateUUID from '../../../../../../util/uuid.ts'
import { promiseProps } from '../../../../../../util/promiseProps.ts'

export const InsertForRegisteredPatientSchema = z.object({
  reason: z.enum([
    'checkup',
    'follow up',
    'maternity',
    'referral',
    'seeking treatment',
  ]),
  notes: z.string().optional(),
  appointment_id: z.string().uuid().nullable().optional(),
})

export const handler = postHandler(
  InsertForRegisteredPatientSchema,
  async (_req, ctx: OrganizationContext, form_values) => {
    const patient_id = getRequiredUUIDParam(ctx, 'patient_id')
    const { current_workflow } =
      await insertSeekingTreatmentForRegisteredPatient(
        ctx.state.trx,
        ctx.state.organization,
        ctx.state.organization_employment,
        {
          patient_id,
          encounter: {
            create: true,
            to_create: form_values,
            patient_encounter_id: generateUUID(),
          },
        },
      )

    assert(current_workflow)
    const first_step = WORKFLOW_STEPS[current_workflow][0]

    return redirect(
      replaceParams(
        `/app/organizations/:organization_id/patients/:patient_id/open_encounter/${current_workflow}/${first_step}`,
        ctx.params,
      ),
    )
  },
)

export default async function PatientRegisteredIntakePage(
  ctx: OrganizationContext,
) {
  const {
    state: {
      trx,
      organization,
    },
  } = ctx
  const patient_id = getRequiredUUIDParam(ctx, 'patient_id')

  const {
    patient,
    appointments_today_at_this_organization,
    closed_encounters_at_this_organization,
  } = await promiseProps({
    patient: patients.getById(trx, patient_id),

    appointments_today_at_this_organization: appointments
      .getForPatient(
        trx,
        {
          patient_id,
          organization_id: organization.id,
          time_range: 'today',
        },
      ),

    closed_encounters_at_this_organization: patient_encounters
      .search(trx, {
        patient_id,
        organization_id: organization.id,
        is_closed: true,
      }),
  })

  return (
    <div>
      TODO
    </div>
  )
}
