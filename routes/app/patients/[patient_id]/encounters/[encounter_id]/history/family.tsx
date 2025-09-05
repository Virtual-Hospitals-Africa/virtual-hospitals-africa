import { z } from 'zod'
import { FamilyHistoryPage } from '../../../../../../../islands/FamilyHistoryPage.tsx'
import { postHandler } from '../../../../../../../util/postHandler.ts'
import { promiseProps } from '../../../../../../../util/promiseProps.ts'
import {
  completeAssessment,
  HistoryContext,
  HistoryPage,
} from './_middleware.tsx'

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
        snomed_concept_id: z.string(), // TODO, change this to the actual validator when we've wired up snomed
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

// deno-lint-ignore require-await
export default HistoryPage(async function FamilyPage(_ctx) {
  return <FamilyHistoryPage />
})
