import { EncounterContext, EncounterLayout, nextLink } from './_middleware.tsx'
import {
  LoggedInHealthWorkerHandlerWithProps,
} from '../../../../../../types.ts'
import FormButtons from '../../../../../../components/library/form/buttons.tsx'
import * as general_assessments from '../../../../../../db/models/general_assessments.ts'
import * as patient_general_assessments from '../../../../../../db/models/patient_general_assessment.ts'
import { assertOr400 } from '../../../../../../util/assertOr.ts'
import isObjectLike from '../../../../../../util/isObjectLike.ts'
import { parseRequestAsserts } from '../../../../../../util/parseForm.ts'
import { getRequiredNumericParam } from '../../../../../../util/getNumericParam.ts'
import { completedStep } from '../../../../../../db/models/patient_encounters.ts'
import redirect from '../../../../../../util/redirect.ts'
import GeneralAssessmentForm from '../../../../../../islands/general-assessment/Form.tsx'

function assertIsAssessments(
  values: unknown,
): asserts values is {
  patient_assessments: number[]
  all_normal: boolean
} {
  assertOr400(isObjectLike(values), 'Invalid form values')
  assertOr400(values.all_normal || (values.patient_assessments as number [] ?? []).length > 0 ,
   'Please select one item before proceeding')
}

export const handler: LoggedInHealthWorkerHandlerWithProps<
  unknown,
  EncounterContext['state']
> = {
  async POST(req, ctx: EncounterContext) {
    const { patient_assessments } = await parseRequestAsserts(
      ctx.state.trx,
      req,
      assertIsAssessments,
    )
    const patient_id = getRequiredNumericParam(ctx, 'patient_id')

    const completing_step =  completedStep(ctx.state.trx, {
      encounter_id: ctx.state.encounter.encounter_id,
      step: 'general_assessments',
    })

    await patient_general_assessments.upsert(
      ctx.state.trx,
      patient_id,
      (patient_assessments?.map((c) => ({ id: c })) ?? []),
    )

    await completing_step
    return redirect(nextLink(ctx))
  },
}

export default async function GeneralAssessmentsPage(
  _req: Request,
  ctx: EncounterContext,
) {
  const list = await general_assessments.getAll(ctx.state.trx)
  const patientAssessments = await patient_general_assessments.get(
    ctx.state.trx,
    ctx.state.patient.id,
  )

  return (
    <EncounterLayout ctx={ctx}>
      <GeneralAssessmentForm
        assessmentList={list}
        selectedItems={patientAssessments}
      />
      <FormButtons />
    </EncounterLayout>
  )
}
