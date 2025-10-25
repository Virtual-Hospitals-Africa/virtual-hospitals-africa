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
import { getAll as getAllLanguages } from '../../../../../../../../db/models/languages.ts'
import { postHandler } from '../../../../../../../../util/postHandler.ts'
import { promiseProps } from '../../../../../../../../util/promiseProps.ts'
import PersonalSection from '../../../../../../../../islands/patient-registration/PersonalSection.tsx'

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
)

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
  const languages = await getAllLanguages(ctx.state.trx)
  return (
    <PersonalSection
      patient={ctx.state.patient}
      organization_default_language_code={ctx.state.organization
        .most_common_language_code_iso_639_2_b}
      languages={languages}
    />
  )
}

export default OpenEncounterWorkflowPage(PatientRegistrationPersonalPage)
