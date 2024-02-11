import { EncounterContext, EncounterLayout, nextLink } from './_middleware.tsx'
import {
  LoggedInHealthWorkerHandlerWithProps,
} from '../../../../../../types.ts'
import FormButtons from '../../../../../../components/library/form/buttons.tsx'
import * as patient_general_assessments from '../../../../../../db/models/patient_general_assessments.ts'
import { assertOr400 } from '../../../../../../util/assertOr.ts'
import isObjectLike from '../../../../../../util/isObjectLike.ts'
import { parseRequestAsserts } from '../../../../../../util/parseForm.ts'
import { getRequiredNumericParam } from '../../../../../../util/getNumericParam.ts'
import { completedStep } from '../../../../../../db/models/patient_encounters.ts'
import redirect from '../../../../../../util/redirect.ts'
import GeneralAssessmentForm from '../../../../../../islands/general-assessment/Form.tsx'

function assertIsAssessments(
  values: unknown,
): asserts values is Record<string, true> {
  assertOr400(isObjectLike(values), 'Invalid form values')
  for (const key in values) {
    assertOr400(values[key] === true, 'Only checkboxes supported')
  }
}

export const handler: LoggedInHealthWorkerHandlerWithProps<
  unknown,
  EncounterContext['state']
> = {
  async POST(req, ctx: EncounterContext) {
    const assessment_form_values = await parseRequestAsserts(
      ctx.state.trx,
      req,
      assertIsAssessments,
    )
    const patient_id = getRequiredNumericParam(ctx, 'patient_id')

    const completing_step = completedStep(ctx.state.trx, {
      encounter_id: ctx.state.encounter.encounter_id,
      step: 'general_assessments',
    })

    await patient_general_assessments.upsert(
      ctx.state.trx,
      {
        patient_id,
        encounter_id: ctx.state.encounter.encounter_id,
        encounter_provider_id:
          ctx.state.encounter_provider.patient_encounter_provider_id,
        assessments: Object.keys(assessment_form_values),
      },
    )

    await completing_step
    return redirect(nextLink(ctx))
  },
}

export default async function GeneralAssessmentsPage(
  _req: Request,
  ctx: EncounterContext,
) {
  const { trx, patient, encounter } = ctx.state
  const previously_filled = encounter.steps_completed.includes(
    'general_assessments',
  )
  const categories = await patient_general_assessments
    .getByCategory(
      trx,
      {
        encounter_id: encounter.encounter_id,
        patient_id: patient.id,
      },
    )

  return (
    <EncounterLayout ctx={ctx}>
      <GeneralAssessmentForm
        previously_filled={previously_filled}
        categories={categories}
      />
      <FormButtons />
    </EncounterLayout>
  )
}
