import { assert } from 'std/assert/assert.ts'
import {
  completeStep,
  EncounterContext,
  EncounterPage,
  EncounterPageChildProps,
} from './_middleware.tsx'
import {
  LoggedInHealthWorkerHandlerWithProps,
  RenderedPatientEncounterExamination,
} from '../../../../../../types.ts'
import * as examinations from '../../../../../../db/models/examinations.ts'
import {
  assertOr400,
  assertOrRedirect,
} from '../../../../../../util/assertOr.ts'
import isObjectLike from '../../../../../../util/isObjectLike.ts'
import { parseRequestAsserts } from '../../../../../../util/parseForm.ts'
import { getRequiredUUIDParam } from '../../../../../../util/getParam.ts'
import redirect from '../../../../../../util/redirect.ts'
import { TabProps, Tabs } from '../../../../../../components/library/Tabs.tsx'
import {
  PaperAirplaneIcon,
  PlusCircleIcon,
} from '../../../../../../components/library/icons/heroicons/outline.tsx'
import { PatientExaminationForm } from '../../../../../../components/examinations/Form.tsx'
import { NewExaminationForm } from '../../../../../../islands/examinations/New.tsx'
import hrefFromCtx from '../../../../../../util/hrefFromCtx.ts'
import { getAvailableTests } from '../../../../../../db/models/inventory.ts'
import {
  Examination,
  EXAMINATIONS,
} from '../../../../../../shared/head_to_toe_assessment.ts'
import partition from '../../../../../../util/partition.ts'
import { RenderedPatientEncounterProvider } from '../../../../../../types.ts'
import { Progress } from '../../../../../../components/library/icons/progress.tsx'

function matchingExamination(
  ctx: EncounterContext,
  patient_examinations: RenderedPatientEncounterExamination[],
): RenderedPatientEncounterExamination | null {
  const adding_examinations = ctx.url.searchParams.get('add') === 'examinations'
  if (adding_examinations) return null
  const examination_identifier = ctx.url.searchParams.get('examination')

  const next_incomplete_exam = patient_examinations.find(
    (exam) => !exam.completed && !exam.skipped,
  ) || patient_examinations[0]
  if (!examination_identifier) {
    return next_incomplete_exam
  }
  const matching_examination = patient_examinations.find(
    (examination) =>
      examination.examination_identifier === examination_identifier,
  )
  assertOrRedirect(
    matching_examination,
    examinationHref(ctx, next_incomplete_exam.examination_identifier),
  )
  return matching_examination
}

export const handler: LoggedInHealthWorkerHandlerWithProps<
  unknown,
  EncounterContext['state']
> = {
  async POST(req: Request, ctx: EncounterContext) {
    const patient_examinations = await examinations.forPatientEncounter(
      ctx.state.trx,
      {
        patient_id: ctx.state.encounter.patient_id,
        encounter_id: ctx.params.encounter_id,
      },
    )

    return handle(req, ctx, patient_examinations)
  },
}

type HistoryAssessment =
  | 'conditions'
  | 'family'
  | 'lifestyle'

function assessmentInSearch(ctx: EncounterContext): HistoryAssessment {
  const assessment = ctx.url.searchParams.get('assessment')
  switch (assessment) {
    case 'conditions':
    case 'family':
    case 'lifestyle':
      return assessment
    default:
      return 'conditions'
  }
}

export async function HistoryPage(
  { ctx }: EncounterPageChildProps,
) {
  const { trx, encounter, encounter_provider } = ctx.state
  const assessment = assessmentInSearch(ctx)

  const placing_orders = ctx.url.searchParams.get('place') === 'orders'

  const next_incomplete_exam = during_this_encounter.find(
    (exam) => exam !== examination && !exam.completed && !exam.skipped,
  )

  const once_done = next_incomplete_exam
    ? next_incomplete_exam.examination_identifier
    : orders.length
    ? 'Orders'
    : 'Diagnosis'

  const tabs: TabProps[] = during_this_encounter.map((exam) => {
    const active = exam === examination
    return {
      tab: exam.examination_identifier as string,
      href: examinationHref(ctx, exam.examination_identifier),
      active,
      leftIcon: <Progress {...exam} active={active} />,
    }
  })

  return {
    next_step_text: adding_examinations
      ? 'Add Examinations'
      : `Continue to ${once_done}`,

    children: (
      <>
        <Tabs tabs={tabs} />
        {adding_examinations && (
          <NewExaminationForm
            recommended_examinations={patient_examinations.filter((ex) =>
              ex.recommended
            ).map((ex) => ex.examination_identifier)}
            selected_examinations={patient_examinations.map((ex) =>
              ex.examination_identifier
            )}
            available_diagnostic_tests={await getAvailableTests(trx, {
              organization_id: ctx.state.encounter.providers[0].organization_id,
            })}
            allowed_to_place_orders={allowedToPlaceOrders(encounter_provider)}
          />
        )}
        {placing_orders && (
          <div>
            TODO
            {orders.map((order) => (
              <p>
                {order.examination_identifier}
              </p>
            ))}
          </div>
        )}
        {examination && (
          <PatientExaminationForm
            patient_examination={await examinations.getPatientExamination(trx, {
              patient_id: encounter.patient_id,
              encounter_id: encounter.encounter_id,
              examination_identifier: examination.examination_identifier,
            })}
          />
        )}
      </>
    ),
  }
}

export default EncounterPage(HistoryPage)
