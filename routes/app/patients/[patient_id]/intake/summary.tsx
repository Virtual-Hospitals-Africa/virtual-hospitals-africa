import * as patient_intake from '../../../../../db/models/patient_intake.ts'
import PatientSummary from '../../../../../components/patients/intake/Summary.tsx'
import { IntakePage, postHandlerAsserts } from './_middleware.tsx'
import { INTAKE_STEPS } from '../../../../../shared/intake.ts'
import { assertAllPriorStepsCompleted } from '../../../../../util/assertAllPriorStepsCompleted.ts'

function assertIsSummary(_patient: unknown): asserts _patient is unknown {
}

export const handler = postHandlerAsserts(
  assertIsSummary,
  async function noop() {},
)

const assertAllIntakeStepsCompleted = assertAllPriorStepsCompleted(
  INTAKE_STEPS,
  '/app/patients/:patient_id/intake/:step',
  'completing the intake process',
)

export default IntakePage(
  async function SummaryPage({ ctx, patient }) {
    const patient_summary = await patient_intake.getSummaryById(
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
