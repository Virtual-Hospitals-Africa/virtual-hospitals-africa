import PatientPersonalForm from '../../../../../islands/patient-intake/PersonalForm.tsx'
import { IntakePage, postHandler } from './_middleware.tsx'
import * as patients from '../../../../../db/models/patients.ts'
import compact from '../../../../../util/compact.ts'
import omit from '../../../../../util/omit.ts'
import { z } from 'zod'
import {
  e164_phone_number,
  gender,
  national_id_number,
  varchar255,
} from '../../../../../util/validators.ts'

const PersonalSchema = z.object({
  first_name: varchar255,
  last_name: varchar255,
  middle_names: varchar255.optional(),
  avatar_media: z.object({ id: z.string().uuid() }).optional(),
  national_id_number: national_id_number.optional(),
  no_national_id: z.boolean().optional(),
  phone_number: e164_phone_number.optional(),
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
  { avatar_media, first_name, middle_names, last_name, ...data },
) => ({
  ...omit(data, ['no_national_id']),
  avatar_media_id: avatar_media?.id,
  name: compact(
    [first_name, middle_names, last_name],
  ).join(' '),
}))

export const handler = postHandler(
  PersonalSchema.parse,
  async function updatePersonal(
    ctx,
    patient_id,
    form_values,
  ) {
    await patients.update(ctx.state.trx, {
      id: patient_id,
      ...form_values,
    })
  },
)

export default IntakePage(
  function PersonalPage({ patient, previously_completed }) {
    return (
      <PatientPersonalForm
        patient={patient}
        previously_completed={previously_completed}
      />
    )
  },
)
