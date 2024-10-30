import { FamilyRelationInsert } from '../../../../../types.ts'
import * as patient_family from '../../../../../db/models/family.ts'
import {
  assertAgeYearsKnown,
  IntakePage,
  postHandler,
} from './_middleware.tsx'
import {
  FamilyType,
  MaritalStatus,
  PatientCohabitation,
  Religion,
} from '../../../../../db.d.ts'
import PatientFamilyForm from '../../../../../islands/family/Form.tsx'
import { z } from 'zod'

type FamilyFormValues = {
  family: {
    under_18?: boolean
    guardians: FamilyRelationInsert[]
    dependents: FamilyRelationInsert[]
    other_next_of_kin?: FamilyRelationInsert
    religion?: Religion
    family_type?: FamilyType
    marital_status?: MaritalStatus
    patient_cohabitation?: PatientCohabitation
  }
}

const FamilyRelationInsertSchema = z.object({
  patient_id: z.string().optional(),
  patient_name: z.string(),
  patient_phone_number: z.string().optional(),
  family_relation_gendered: z.string(),
  next_of_kin: z.boolean().default(false),
})

export const FamilySchema = z.object({
  family: z.object({
    under_18: z.boolean().optional(),
    guardians: z.array(FamilyRelationInsertSchema).default([]),
    dependents: z.array(FamilyRelationInsertSchema).default([]),
    other_next_of_kin: FamilyRelationInsertSchema.optional(),
    religion: z.string().optional(),
    family_type: z.string().optional(),
    marital_status: z.string().optional(),
    patient_cohabitation: z.string().optional(),
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
