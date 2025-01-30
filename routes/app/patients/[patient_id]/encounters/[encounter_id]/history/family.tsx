import { z } from 'zod'
import { promiseProps } from '../../../../../../../util/promiseProps.ts'
import { parseRequest } from '../../../../../../../util/parseForm.ts'
import {
  completeAssessment,
  HistoryContext,
  HistoryPage,
} from './_middleware.tsx'
import * as patient_family from '../../../../../../../db/models/family.ts'
import PatientFamilyForm from '../../../../../../../islands/family/FamilyForm.tsx'
import { e164_phone_number } from '../../../../../../../util/validators.ts'
import { assert } from 'std/assert/assert.ts'

const FamilyRelationInsertSchema = z.object({
  patient_id: z.string().uuid().optional(),
  patient_name: z.string(),
  patient_phone_number: e164_phone_number.optional(),
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

export const handler = {
  async POST(req: Request, ctx: HistoryContext) {
    const form_values = await parseRequest(
      ctx.state.trx,
      req,
      FamilySchema.parse,
    )
    // TODO complete family examination
    const {
      completing_assessment,
    } = await promiseProps({
      completing_assessment: completeAssessment(ctx),
      upserting_family: patient_family.upsert(
        ctx.state.trx,
        ctx.state.patient.id,
        form_values.family,
      ),
    })
    return completing_assessment
  },
}

export default HistoryPage(async function FamilyPage(ctx) {
  const patient_id = ctx.state.patient.id
  const family = await patient_family.get(ctx.state.trx, { patient_id })
  assert(ctx.state.patient.age_years != null)
  const age_years = parseInt(ctx.state.patient.age_years, 10)
  assert(typeof age_years === 'number' && age_years >= 0)

  return (
    <PatientFamilyForm
      age_years={age_years}
      family={family}
    />
  )
})
