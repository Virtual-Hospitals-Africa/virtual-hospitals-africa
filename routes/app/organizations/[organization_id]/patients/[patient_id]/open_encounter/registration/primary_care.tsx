import {
  completeAndProceedToNextStep,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import { NearestHealthCareSection } from '../../../../../../../../islands/NearestHealthCare.tsx'
import { HealthInsuranceSection } from '../../../../../../../../islands/HealthInsurance.tsx'
import { setCurrentInsurance } from '../../../../../../../../db/models/patient_insurance.ts'
import {
  setNearestHealthFacility,
  setPrimaryDoctor,
  setUnregisteredPrimaryDoctor,
} from '../../../../../../../../db/models/patient_primary_care.ts'
import { postHandler } from '../../../../../../../../util/postHandler.ts'
import * as patient_primary_care from '../../../../../../../../db/models/patient_primary_care.ts'
import * as patient_insurance from '../../../../../../../../db/models/patient_insurance.ts'

const PatientRegistrationPrimaryCareSchema = z.object({
  primary_doctor_id: z.string().uuid().optional(),
  primary_doctor_name: z.string(),
  nearest_organization_id: z.string(),
  insurance_provider: z.string(),
  plan_name: z.string().optional(),
  membership_number: z.string(),
  valid_from: z.string(),
  expire_date: z.string(),
  is_dependent: z.boolean(),
  has_no_insurance: z.boolean().optional(),
})

export const handler = postHandler(
  PatientRegistrationPrimaryCareSchema,
  async (_req, ctx: OpenEncounterWorkflowContext, {
    primary_doctor_id,
    primary_doctor_name,
    nearest_organization_id,
    insurance_provider,
    plan_name,
    membership_number,
    valid_from,
    expire_date,
    is_dependent,
    has_no_insurance
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
    if (!has_no_insurance){
      setCurrentInsurance(trx, {
        patient_id,
        insurance_provider,
        plan_name,
        membership_number,
        valid_from,
        expire_date,
        is_dependent,
      })
    }
    return completeAndProceedToNextStep(ctx)
  },
)

export async function PatientRegistrationPrimaryCarePage(
  ctx: OpenEncounterWorkflowContext,
) {
  const primary_care = await patient_primary_care.getById(ctx.state.trx, {
    patient_id: ctx.state.patient.id,
  })
  const insurance = await patient_insurance.getById(ctx.state.trx, {
    patient_id: ctx.state.patient.id,
  })
  return (
    <>
      <NearestHealthCareSection {...primary_care} />
      <HealthInsuranceSection {...insurance} />
    </>
  )
}

export default OpenEncounterWorkflowPage(PatientRegistrationPrimaryCarePage)