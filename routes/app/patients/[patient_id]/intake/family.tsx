import * as patient_family from '../../../../../db/models/family.ts'
import { assertAgeYearsKnown, IntakePage, postHandler } from './_middleware.tsx'
import PatientFamilyForm from '../../../../../islands/family/Form.tsx'
import { z } from 'zod'
import { phone_number } from '../../../../../util/validators.ts'

const FamilyRelationInsertSchema = z.object({
  patient_id: z.string().uuid().optional(),
  patient_name: z.string(),
  patient_phone_number: phone_number.optional(),
  family_relation_gendered: z.string(),
  next_of_kin: z.boolean().default(false),
})

export const FamilySchema = z.object({
  family: z.object({
    under_18: z.boolean().optional(),
    guardians: z.array(FamilyRelationInsertSchema).default([]),
    dependents: z.array(FamilyRelationInsertSchema).default([]),
    other_next_of_kin: FamilyRelationInsertSchema.optional(),
    religion: z.enum([
      'African Traditional Religion',
      'Apostolic Sect',
      'Islam',
      'Non-Religious',
      'Other',
      'Pentecostal/Protestant Christianity',
      'Roman Catholic',
    ]).optional(),
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
})

export const handler = postHandler(
  FamilySchema.parse,
  async function updateFamily(ctx, patient_id, form_values) {
    await patient_family.upsert(
      ctx.state.trx,
      patient_id,
      form_values.family,
    )
  },
)

export default IntakePage(async function FamilyPage({ ctx, patient }) {
  const age_years = assertAgeYearsKnown(ctx)
  const patient_id = patient.id
  const family = await patient_family.get(ctx.state.trx, { patient_id })

  return (
    <PatientFamilyForm
      age_years={age_years}
      family={family}
    />
  )
})
