import * as patients from '../../../../../db/models/patients.ts'
import PatientSummary from '../../../../../components/patients/intake/Summary.tsx'
import { IntakePage, postHandler } from './_middleware.tsx'
import { INTAKE_STEPS } from '../../../../../shared/intake.ts'
import { assertAllPriorStepsCompleted } from '../../../../../util/assertAllPriorStepsCompleted.ts'

function assertIsSummary(_patient: unknown): asserts _patient is unknown {
}

export const handler = postHandler(assertIsSummary)

const assertAllIntakeStepsCompleted = assertAllPriorStepsCompleted(
  INTAKE_STEPS,
  '/app/patients/:patient_id/intake/:step',
  'completing the intake process',
)

export default IntakePage(
  async function SummaryPage({ ctx, patient }) {
    const patient_summary = await patients.getIntakeSummaryById(
      ctx.state.trx,
      patient.id,
    )
    assertAllIntakeStepsCompleted(
      patient.intake_steps_completed,
      ctx.params,
    )
    return <PatientSummary patient={patient_summary} />
  },
)
