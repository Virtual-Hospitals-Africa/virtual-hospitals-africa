import {
  completeAndProceedToNextStep,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import { NearestHealthCareSection } from '../../../../../../../../islands/NearestHealthCare.tsx'
import {
  setNearestHealthFacility,
  setPrimaryDoctor,
  setUnregisteredPrimaryDoctor,
} from '../../../../../../../../db/models/patient_primary_care.ts'
import { postHandler } from '../../../../../../../../util/postHandler.ts'
import * as patient_primary_care from '../../../../../../../../db/models/patient_primary_care.ts'

const PatientRegistrationPrimaryCareSchema = z.object({
  primary_doctor_id: z.string().uuid().optional(),
  primary_doctor_name: z.string(),
  nearest_organization_id: z.string(),
})

export const handler = postHandler(
  PatientRegistrationPrimaryCareSchema,
  async (_req, ctx: OpenEncounterWorkflowContext, {
    primary_doctor_id,
    primary_doctor_name,
    nearest_organization_id,
  }) => {
    const { trx, patient } = ctx.state
    const patient_id = patient.id

    await Promise.all([
      primary_doctor_id
        ? setPrimaryDoctor(trx, {
          patient_id,
          primary_doctor_id,
        })
        : setUnregisteredPrimaryDoctor(trx, {
          patient_id,
          primary_doctor_name,
        }),
      setNearestHealthFacility(trx, {
        patient_id,
        nearest_organization_id,
      }),
    ])
    return completeAndProceedToNextStep(ctx)
  },
)

export async function PatientRegistrationPrimaryCarePage(
  ctx: OpenEncounterWorkflowContext,
) {
  const primary_care = await patient_primary_care.getById(ctx.state.trx, {
    patient_id: ctx.state.patient.id,
  })
  return <NearestHealthCareSection {...primary_care} />
}

export default OpenEncounterWorkflowPage(PatientRegistrationPrimaryCarePage)
