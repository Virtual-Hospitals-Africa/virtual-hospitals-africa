import {
  completeStep,
  EncounterContext,
  EncounterPage,
  EncounterPageChildProps,
} from './_middleware.tsx'
import {
  Diagnosis,
  DiagnosesCollaboration,
  LoggedInHealthWorkerHandlerWithProps,
} from '../../../../../../types.ts'
import FormSection from '../../../../../../components/library/FormSection.tsx'
import DiagnosesForm from '../../../../../../islands/diagnoses/Form.tsx'
import * as diagnoses from '../../../../../../db/models/diagnoses.ts'
import { parseRequestAsserts } from '../../../../../../util/parseForm.ts'
import isObjectLike from '../../../../../../util/isObjectLike.ts'
import { assertOr400 } from '../../../../../../util/assertOr.ts'
import { getRequiredUUIDParam } from '../../../../../../util/getParam.ts'

type DiagnosisData = {
  diagnoses: Diagnosis[]
  diagnoses_collaborations: DiagnosesCollaboration[]
}

function assertIsDiagnoses(
  data: unknown,
): asserts data is DiagnosisData {
  assertOr400(isObjectLike(data), 'Invalid form values')
  if (data.diagnoses !== undefined) {
    assertOr400(
      Array.isArray(data.diagnoses),
      'diagnoses must be an array',
    )
    for (const diagnosis of data.diagnoses) {
      assertOr400(
        typeof diagnosis.id === 'string',
        'Each diagnosis must have an id of type string',
      )
    }
  }
  if (data.diagnoses_collaborations !== undefined) {
    assertOr400(
      Array.isArray(data.diagnoses_collaborations),
      'diagnoses_collaborations must be an array',
    )
    for (const diagnoses_collaboration of data.diagnoses_collaborations) {
      assertOr400(
        typeof diagnoses_collaboration.id === 'string',
        'Each diagnoses_collaboration must have an id of type string',
      )
    }
  }
}

export const handler: LoggedInHealthWorkerHandlerWithProps<
  unknown,
  EncounterContext['state']
> = {
  async POST(req, ctx: EncounterContext) {
    const data = await parseRequestAsserts(
      ctx.state.trx,
      req,
      assertIsDiagnoses,
    )

    const patient_diagnoses = (data.diagnoses || []).map((d) => ({
      condition_id: d.id,
      start_date: d.start_date,
    }))

    const diagnoses_collaborations = (data.diagnoses_collaborations || []).map(
      (d) => ({
        diagnosis_id: d.diagnosis_id,
        is_approved: d.approval === 'agree',
      }),
    )

    const patient_id = getRequiredUUIDParam(ctx, 'patient_id')

    await diagnoses.upsertForReview(
      ctx.state.trx,
      {
        encounter_id: ctx.state.encounter.encounter_id,
        patient_id,
        employment_id: ctx.state.encounter_provider.employment_id,
        diagnoses: patient_diagnoses,
        diagnoses_collaborations,
      },
    )

    const completing_step = completeStep(ctx)
    return completing_step
  },
}

export default EncounterPage(
  async function DiagnosisPage(
    { ctx, encounter }: EncounterPageChildProps,
  ) {
    const patient_diagnoses = await diagnoses.getFromReview(ctx.state.trx, {
      encounter_id: encounter.encounter_id,
      employment_id: ctx.state.encounter_provider.employment_id,
    })
    return (
      <FormSection header='Diagnoses'>
        <DiagnosesForm diagnoses={patient_diagnoses} />
      </FormSection>
    )
  },
)
