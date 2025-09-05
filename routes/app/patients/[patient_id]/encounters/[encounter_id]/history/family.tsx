import { z } from 'zod'
import { FamilyHistoryPage } from '../../../../../../../islands/FamilyHistoryPage.tsx'
import { postHandler } from '../../../../../../../util/postHandler.ts'
import { promiseProps } from '../../../../../../../util/promiseProps.ts'
import * as patient_family_history from '../../../../../../../db/models/patient_family_history.ts'
import {
  completeAssessment,
  HistoryContext,
  HistoryPage,
} from './_middleware.tsx'
import { snomed_concept_id } from '../../../../../../../util/validators.ts'

const FamilyMemberSchema = z.object({
  relation_gendered: z.string(),
})

export const FamilyHistorySchema = z
  .object({
    done: z.boolean(),
  })
  .or(
    z.object({
      family_history: z.object({
        snomed_concept_id, // TODO, change this to the actual validator when we've wired up snomed
        family_members: z.array(FamilyMemberSchema),
      }),
    }),
  )

export const handler = postHandler(
  FamilyHistorySchema,
  async (_req, ctx: HistoryContext, form_values) => {
    console.log('form_values', form_values)
    // TODO insert family history values
    const { completing_assessment } = await promiseProps({
      completing_assessment: completeAssessment(ctx),
    })
    return completing_assessment
  },
)

export default HistoryPage(async function FamilyPage(ctx) {
  const patient_family_history_records = await patient_family_history
    .getEncounter(ctx.state.trx, {
      patient_id: ctx.state.patient.id,
      encounter_id: ctx.state.encounter.encounter_id,
    })
  return (
    <FamilyHistoryPage
      patient_family_history_records={patient_family_history_records}
    />
  )
})
