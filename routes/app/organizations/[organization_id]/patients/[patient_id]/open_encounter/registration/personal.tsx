import {
  completeAndProceedToNextStep,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import * as patients from '../../../../../../../../db/models/patients.ts'
import {
  sex,
  string_or_number_as_string,
  varchar255,
} from '../../../../../../../../util/validators.ts'
import { postHandler } from '../../../../../../../../util/postHandler.ts'
import { promiseProps } from '../../../../../../../../util/promiseProps.ts'
import PersonalSection from '../../../../../../../../islands/patient-registration/PersonalSection.tsx'
import { SERVER_COUNTRY } from '../../../../../../../../db/models/countries.ts'
import { nationalIdCheckResult } from '../../../../../../../../util/southAfricanNationalId.ts'
import omit from '../../../../../../../../util/omit.ts'

const PatientRegistrationPersonalSchema = z.object({
  first_names: varchar255,
  surname: varchar255,
  preferred_name: varchar255,
  national_id_number: string_or_number_as_string.optional(),
  no_national_id: z.boolean().optional(),
  date_of_birth: z.string().date(),
  sex,
  gender: varchar255,
}).refine(
  (data) => data.national_id_number || data.no_national_id,
  {
    message: 'Must either provide national id number or check no national id',
    path: ['national_id_number'],
  },
).superRefine((patient, ctx) => {
  if (!patient.national_id_number) return
  const result = nationalIdCheckResult({
    sex: patient.sex,
    date_of_birth: patient.date_of_birth,
    national_id_number: patient.national_id_number,
  })
  if (result.success) return
  ctx.addIssue({
    code: 'custom',
    message: result.error.message,
    path: ['national_id_number'],
  })
}).transform((patient) => omit(patient, ['no_national_id']))

export const handler = postHandler(
  PatientRegistrationPersonalSchema,
  async (ctx: OpenEncounterWorkflowContext, form_values) => {
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
export async function PatientRegistrationPersonalPage(
  ctx: OpenEncounterWorkflowContext,
) {
  return (
    <PersonalSection
      patient={ctx.state.patient}
      organization_default_language_code={ctx.state.organization
        .most_common_language_code}
      server_country={SERVER_COUNTRY}
      previously_completed_step={ctx.state.previously_completed_step}
    />
  )
}

export default OpenEncounterWorkflowPage(PatientRegistrationPersonalPage)
