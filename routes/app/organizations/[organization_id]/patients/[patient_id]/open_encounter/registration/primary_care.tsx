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
import { string_or_number_as_string } from '../../../../../../../../util/validators.ts'

export const PatientRegistrationPrimaryCareSchema = z.object({
  primary_doctor_id: z.string().uuid().optional(),
  primary_doctor_name: z.string(),
  nearest_organization_id: z.string(),
  insurance: z.object({
    has_no_insurance: z.literal(true),
  }).or(z.object({
    has_no_insurance: z.boolean().optional(),
    insurance_provider: z.string(),
    plan_name: z.string().optional(),
    membership_number: string_or_number_as_string,
    valid_from: z.string().date(),
    expire_date: z.string().date(),
    is_dependent: z.boolean().optional().default(false),
  })),
})

export const handler = postHandler(
  PatientRegistrationPrimaryCareSchema,
  async (ctx: OpenEncounterWorkflowContext, {
    primary_doctor_id,
    primary_doctor_name,
    nearest_organization_id,
    insurance,
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
      updating_insurance: insurance.has_no_insurance
        ? patient_insurance.clearCurrent(trx, { patient_id })
        : patient_insurance.setCurrent(trx, {
          patient_id,
          ...insurance,
        }),
      response: completeAndProceedToNextStep(ctx),
    })

    return response
  },
)

export async function PatientRegistrationPrimaryCarePage(
  { state: { trx, patient, previously_completed_step } }:
    OpenEncounterWorkflowContext,
) {
  const { primary_care, current_insurance } = await promiseProps({
    primary_care: patient_primary_care.getById(trx, {
      patient_id: patient.id,
    }),
    current_insurance: patient_insurance.getCurrent(trx, {
      patient_id: patient.id,
    }),
  })

  return (
    <>
      <NearestHealthCareSection {...primary_care} />
      <HealthInsuranceSection
        current_insurance={current_insurance}
        previously_completed_form={previously_completed_step}
      />
    </>
  )
}

export default OpenEncounterWorkflowPage(PatientRegistrationPrimaryCarePage)
