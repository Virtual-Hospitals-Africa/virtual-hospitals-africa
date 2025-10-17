import {
  completeAndProceedToNextStep,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import { NearestHealthCareSection } from '../../../../../../../../islands/NearestHealthCare.tsx'
import { HealthInsuranceSection } from '../../../../../../../../islands/HealthInsurance.tsx'
import {
  setNearestHealthFacility,
  setPrimaryDoctor,
  setUnregisteredPrimaryDoctor,
} from '../../../../../../../../db/models/patient_primary_care.ts'
import { postHandler } from '../../../../../../../../util/postHandler.ts'
import * as patient_primary_care from '../../../../../../../../db/models/patient_primary_care.ts'
import * as patient_insurance from '../../../../../../../../db/models/patient_insurance.ts'
import { promiseProps } from '../../../../../../../../util/promiseProps.ts'

const PatientRegistrationPrimaryCareSchema = z.object({
  primary_doctor_id: z.string().uuid().optional(),
  primary_doctor_name: z.string(),
  nearest_organization_id: z.string(),
  insurance: z.object({
    insurance_provider: z.string(),
    plan_name: z.string().optional(),
    membership_number: z.string(),
    valid_from: z.string(),
    expire_date: z.string(),
    is_dependent: z.boolean().optional().default(false),
    has_no_insurance: z.boolean().optional(),
  }),
})

export const handler = postHandler(
  PatientRegistrationPrimaryCareSchema,
  async (_req, ctx: OpenEncounterWorkflowContext, {
    primary_doctor_id,
    primary_doctor_name,
    nearest_organization_id,
    insurance: { has_no_insurance, ...current_insurance },
  }) => {
    const { trx, patient } = ctx.state
    const patient_id = patient.id

    const { response } = await promiseProps({
      setting_primary_doctor: primary_doctor_id
        ? setPrimaryDoctor(trx, {
          patient_id,
          primary_doctor_id,
        })
        : setUnregisteredPrimaryDoctor(trx, {
          patient_id,
          primary_doctor_name,
        }),
      setting_nearest_facility: setNearestHealthFacility(trx, {
        patient_id,
        nearest_organization_id,
      }),
      updating_insurance: has_no_insurance
        ? patient_insurance.clearCurrent(trx, { patient_id })
        : patient_insurance.setCurrent(trx, {
          patient_id,
          ...current_insurance,
        }),
      response: completeAndProceedToNextStep(ctx),
    })

    return response
  },
)

export async function PatientRegistrationPrimaryCarePage(
  ctx: OpenEncounterWorkflowContext,
) {
  const primary_care = await patient_primary_care.getById(ctx.state.trx, {
    patient_id: ctx.state.patient.id,
  })
  const insurance = await patient_insurance.getCurrent(ctx.state.trx, {
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
