import { assert } from 'std/assert/assert.ts'
import { z } from 'zod'
import * as patient_family_history from '../../../../../../../../../db/models/patient_family_history.ts'
import { FamilyHistoryPage } from '../../../../../../../../../islands/FamilyHistoryPage.tsx'
import { SEXED_RELATION_SNOMED_CONCEPT_IDS } from '../../../../../../../../../shared/family.ts'
import keys from '../../../../../../../../../util/keys.ts'
import { postHandler } from '../../../../../../../../../util/postHandler.ts'
import { promiseProps } from '../../../../../../../../../util/promiseProps.ts'
import { snomed_concept_id } from '../../../../../../../../../util/validators.ts'
import { completeAndProceedToNextStep } from '../../_middleware.tsx'
import {
  completeAssessment,
  HistoryContext,
  HistoryPage,
} from './_middleware.tsx'

const FamilyMemberSchema = z.object({
  relation_sexed: z.enum(keys(SEXED_RELATION_SNOMED_CONCEPT_IDS)),
})

export const FamilyHistorySchema = z
  .object({
    done: z.boolean(),
  })
  .or(
    z.object({
      family_history: z.object({
        snomed_concept_id, // TODO, change this to the actual validator when we've wired up snomed
        family_members: z
          .array(FamilyMemberSchema)
          .nonempty()
          .refine(
            (members) =>
              members.filter((m) =>
                m.relation_sexed.match(/(biological mother)/gi)
              ).length <= 1,
            { message: 'Cannot have more than one bilogical mother.' },
          )
          .refine(
            (members) =>
              members.filter((m) =>
                m.relation_sexed.match(/(biological father)/gi)
              ).length <= 1,
            { message: 'Cannot have more than one bilogical father.' },
          ),
      }),
    }),
  )

export const handler = postHandler(
  FamilyHistorySchema,
  async (ctx: HistoryContext, form_values) => {
    const patient_id = ctx.state.patient.id
    const patient_encounter_employee_id =
      ctx.state.encounter_employee_presence.patient_encounter_employee_id
    const patient_encounter_id = ctx.state.encounter.patient_encounter_id

    if ('done' in form_values) {
      assert(form_values.done)
      return completeAndProceedToNextStep(ctx)
    }

    const family_history = form_values.family_history
    assert(family_history.family_members.length > 0)

    await patient_family_history.upsertOne(ctx.state.trx, {
      patient_id,
      patient_encounter_employee_id,
      patient_encounter_id,
      family_history,
    })

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
      patient_encounter_id: ctx.state.encounter.patient_encounter_id,
    })
  console.log('weklkelw', patient_family_history_records)
  return (
    <FamilyHistoryPage
      patient_family_history_records={patient_family_history_records}
    />
  )
})
