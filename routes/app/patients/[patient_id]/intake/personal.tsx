import { IntakePage, postHandler } from './_middleware.tsx'
import * as patients from '../../../../../db/models/patients.ts'
import * as addresses from '../../../../../db/models/addresses.ts'
import * as patient_family from '../../../../../db/models/family.ts'
import compact from '../../../../../util/compact.ts'
import omit from '../../../../../util/omit.ts'
import { z } from 'zod'
import {
  e164_phone_number,
  gender,
  national_id_number,
  varchar255,
} from '../../../../../util/validators.ts'
import PatientIntakeForm from '../../../../../components/patient-intake/IntakeForm.tsx'

const FamilyRelationInsertSchema = z.object({
  patient_id: z.string().uuid().optional(),
  patient_name: z.string(),
  patient_phone_number: e164_phone_number.optional(),
  family_relation_gendered: z.string(),
  next_of_kin: z.boolean().default(false),
})

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
  address: z.object({
    street: z.string().optional(),
    locality: z.string(),
    administrative_area_level_2: z.string().optional(),
    administrative_area_level_1: z.string().optional(),
    country: z.string(),
  }),
  nearest_organization_id: z.string().uuid().optional(),
  nearest_organization_name: z.string().optional(),
  primary_doctor_id: z.string().uuid().optional(),
  primary_doctor_name: z.string().optional(),
  family: z.object({
    under_18: z.boolean().optional(),
    guardians: z.array(FamilyRelationInsertSchema).default([]),
    dependents: z.array(FamilyRelationInsertSchema).default([]),
    other_next_of_kin: FamilyRelationInsertSchema.optional(),
    religion: z.string().optional(),
    family_type: z.enum([
      '2 married parents',
      'Blended',
      'Child-headed',
      'Divorced',
      'Extended',
      'Grandparent-led',
      'Orphan',
      'Polygamous/Compound',
      'Single Parent',
    ]).optional(),
    marital_status: z.enum([
      'Co-habiting',
      'Divorced',
      'Married',
      'Never Married',
      'Separated',
      'Single',
      'Widowed',
    ]).optional(),
    patient_cohabitation: z.enum([
      'Father',
      'Foster Parent',
      'Grandparent(s)',
      'Mother',
      'Orphanage',
      'Other Relative',
      'Sibling',
      'Uncle or Aunt',
    ]).optional(),
  }).optional().default({
    dependents: [],
    guardians: [],
  }),
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
    // Updates Family Relations
    const created_address = await addresses.insert(
      ctx.state.trx,
      form_values.address,
    )

    await patients.update(ctx.state.trx, {
      id: patient_id,
      phone_number: form_values.phone_number,
      avatar_media_id: form_values.avatar_media_id,
      national_id_number: form_values.national_id_number,
      date_of_birth: form_values.date_of_birth,
      gender: form_values.gender,
      ethnicity: form_values.ethnicity,
      name: form_values.name,
      // Address information
      address_id: created_address.id,
      nearest_organization_id: form_values.nearest_organization_id,
      primary_doctor_id: form_values.primary_doctor_id,
    })

    await patient_family.upsert(
      ctx.state.trx,
      patient_id,
      form_values.family,
    )
  },
)

export default IntakePage(
  async function PersonalPage({ ctx, patient, previously_completed }) {
    const { healthWorker, trx } = ctx.state
    const country_address_tree = await addresses.getCountryAddressTree(trx)
    const family = await patient_family.get(ctx.state.trx, {
      patient_id: patient.id,
    })

    let default_organization:
      | { id: string; name: string; address: string }
      | undefined

    for (const employment of healthWorker.employment) {
      if (employment.organization.address) {
        default_organization = {
          id: employment.organization.id,
          name: employment.organization.name,
          address: employment.organization.address,
        }
        break
      }
    }

    return (
      <PatientIntakeForm
        patient={patient}
        previously_completed={previously_completed}
        default_organization={default_organization}
        country_address_tree={country_address_tree}
        family={family}
      />
    )
  },
)
