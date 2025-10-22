import {
  completeAndProceedToNextStep,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import * as patients from '../../../../../../../../db/models/patients.ts'
import PersonalSection from '../../../../../../../../components/patient-registration/PersonalSection.tsx'
import {
  gender,
  string_or_number_as_string,
  varchar255,
} from '../../../../../../../../util/validators.ts'
import compact from '../../../../../../../../util/compact.ts'
import { postHandler } from '../../../../../../../../util/postHandler.ts'
import { promiseProps } from '../../../../../../../../util/promiseProps.ts'

const PatientRegistrationPersonalSchema = z.object({
  first_name: varchar255,
  last_name: varchar255,
  middle_names: varchar255.optional(),
  national_id_number: string_or_number_as_string.optional(),
  no_national_id: z.boolean().optional(),
  date_of_birth: z.string().date(),
  gender,
}).refine(
  (data) => data.national_id_number || data.no_national_id,
  {
    message: 'Must either provide national id number or check no national id',
    path: ['national_id_number'],
  },
).transform((
  {
    first_name,
    middle_names,
    last_name,
    // deno-lint-ignore no-unused-vars
    no_national_id,
    ...data
  },
) => ({
  ...data,
  name: compact(
    [first_name, middle_names, last_name],
  ).join(' '),
}))

export const handler = postHandler(
  PatientRegistrationPersonalSchema,
  async (_req, ctx: OpenEncounterWorkflowContext, form_values) => {
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
  return <PersonalSection patient={ctx.state.patient} />
}

export default OpenEncounterWorkflowPage(PatientRegistrationPersonalPage)
