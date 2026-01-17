import z from 'zod'
import { completeAndProceedToNextStep, OpenEncounterWorkflowContext, OpenEncounterWorkflowPage } from '../_middleware.tsx'
import { patients } from '../../../../../../../../db/models/patients.ts'
import { postHandler } from '../../../../../../../../backend/postHandler.ts'
import { promiseProps } from '../../../../../../../../util/promiseProps.ts'
import PersonalSection from '../../../../../../../../islands/patient-registration/PersonalSection.tsx'
import { SERVER_COUNTRY } from '../../../../../../../../db/models/countries.ts'
import { PatientRegistrationPersonalSchema } from '../registration/personal.tsx'
import { AddPatientSearch } from '../../../../../../../../islands/waiting_room/AddPatientSearch.tsx'
import FormSection from '../../../../../../../../components/library/FormSection.tsx'
import { RadioButtonGroup } from '../../../../../../../../components/library/RadioButtonGroup.tsx'
import { ModeOfArrivalFormSection } from '../../../../../../../../islands/ModeOfArrivalFormSection.tsx'
import { positive_integer, sex, varchar255 } from '../../../../../../../../util/validators.ts'
import { Separator } from '../../../../../../../../components/Separator.tsx'

import { ReturningOrNewPatient } from '../../../../../../../../islands/ReturningOrNewPatient.tsx'
import { asNames } from '../../../../../../../../util/asNames.ts'
import { assertNotEquals } from 'std/assert/assert_not_equals.ts'

const IdentifyPatientSchema = z.object({
  patient_id: z.string().uuid().optional(),
  patient_name: varchar255,
  date_of_birth: z.string().date(),
  sex,
  gender: varchar255,
  mode_of_arrival: z.enum(['just_arrived', 'en_route_personal', 'en_route_ambulance']),
  eta_minutes: positive_integer.optional().default(0),
})

export const handler = postHandler(
  IdentifyPatientSchema,
  async (ctx: OpenEncounterWorkflowContext, form_values) => {
    const { trx, patient_id } = ctx.state
    
    // New patient
    if (!form_values.patient_id) {
      const { response } = await promiseProps({
        updating_patient: patients.updateById(trx, patient_id, {
          ...asNames({
            name: form_values.patient_name,
          }),
          date_of_birth: form_values.date_of_birth,
          sex: form_values.sex,
          gender: form_values.gender,
        }),
        response: completeAndProceedToNextStep(ctx),
      })
      return response
    }

    assertNotEquals(form_values.patient_id, patient_id)

    await patients.removeById(trx, patient_id)
    
    // Returning patient
    // Here is a slightly odd case in that we started the process with a patient record we created,
    // but now that we've identified 
    console.log({ form_values })
    throw new Error('x')
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
    <>
      <ReturningOrNewPatient patient={ctx.state.patient} />
      <Separator />
      <ModeOfArrivalFormSection organization_category={ctx.state.organization.category} />
    </>
  )
}

export default OpenEncounterWorkflowPage(EmergencyEscalationIdentifyPatientPage)
