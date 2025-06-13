import {
  PatientIntake,
  PatientIntakeContext,
  PatientIntakePage,
} from './_middleware.tsx'
import { z } from 'zod'
import { LoggedInHealthWorkerHandler } from '../../../../../../../types.ts'
import { parseRequest } from '../../../../../../../util/parseForm.ts'
import { completeStep } from './_middleware.tsx'
import * as patients from '../../../../../../../db/models/patients.ts'
import PersonalSection from '../../../../../../../components/patient-intake/PersonalSection.tsx'
import {
  gender,
  national_id_number,
  varchar255,
} from '../../../../../../../util/validators.ts'
import compact from '../../../../../../../util/compact.ts'

const PatientIntakePersonalSchema = z.object({
  first_name: varchar255,
  last_name: varchar255,
  middle_names: varchar255.optional(),
  avatar_media: z.object({ id: z.string().uuid() }).optional(),
  national_id_number: national_id_number.optional(),
  no_national_id: z.boolean().optional(),
  date_of_birth: z.string().date(),
  gender,
  ethnicity: varchar255.optional(),
}).refine(
  (data) => data.national_id_number || data.no_national_id,
  {
    message: 'Must either provide national id number or check no national id',
    path: ['national_id_number'],
  },
).transform((
  {
    avatar_media,
    first_name,
    middle_names,
    last_name,
    // deno-lint-ignore no-unused-vars
    no_national_id,
    ...data
  },
) => ({
  ...data,
  avatar_media_id: avatar_media?.id,
  name: compact(
    [first_name, middle_names, last_name],
  ).join(' '),
}))

export const handler: LoggedInHealthWorkerHandler<PatientIntakeContext> = {
  async POST(req, ctx: PatientIntakeContext) {
    const { trx, intake } = ctx.state
    const personal_updates = await parseRequest(
      trx,
      req,
      PatientIntakePersonalSchema.parse,
    )

    if (intake.new) {
      const inserted = await patients.insert(
        trx,
        personal_updates,
      )
      return completeStep(ctx, inserted.id)
    }

    await patients.upsert(trx, {
      id: intake.patient.personal.id,
      ...personal_updates,
    })
    return completeStep(ctx, intake.patient.personal.id)
  },
}

export async function PatientIntakePersonalPage(ctx: PatientIntakeContext) {
  const { intake } = ctx.state
  const personal: Partial<PatientIntake['personal']> = intake.new
    ? {}
    : intake.patient.personal

  return <PersonalSection patient={personal} />
}

export default PatientIntakePage(PatientIntakePersonalPage)
