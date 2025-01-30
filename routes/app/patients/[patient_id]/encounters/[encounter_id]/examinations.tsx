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
import { assertOrRedirect } from '../../../../../../util/assertOr.ts'
import { parseRequest } from '../../../../../../util/parseForm.ts'
import { getRequiredUUIDParam } from '../../../../../../util/getParam.ts'
import redirect from '../../../../../../util/redirect.ts'
import { TabProps, Tabs } from '../../../../../../components/library/Tabs.tsx'
import {
  PaperAirplaneIcon,
  PlusCircleIcon,
} from '../../../../../../components/library/icons/heroicons/outline.tsx'
// import { PatientExaminationForm } from '../../../../../../components/examinations/Form.tsx'
// import { NewExaminationForm } from '../../../../../../islands/examinations/New.tsx'
import hrefFromCtx from '../../../../../../util/hrefFromCtx.ts'
// import { getAvailableTests } from '../../../../../../db/models/inventory.ts'
import partition from '../../../../../../util/partition.ts'
import { RenderedPatientEncounterProvider } from '../../../../../../types.ts'
import { assertOr403 } from '../../../../../../util/assertOr.ts'
import { Progress } from '../../../../../../components/library/icons/progress.tsx'
import { z } from 'zod'

const AddExaminationsSchema = z.object({
  assessments: z.string().array().default([]),
  diagnostic_tests_at_organization: z.string().array().default([]),
  diagnostic_test_orders: z.string().array().default([]),
})

function noExaminationSpecifiedHref(ctx: EncounterContext) {
  return hrefFromCtx(ctx, (url) => {
    url.searchParams.delete('add')
    url.searchParams.delete('examination')
    url.searchParams.delete('place')
  })
}

function placeOrdersHref(ctx: EncounterContext) {
  return hrefFromCtx(ctx, (url) => {
    url.searchParams.delete('add')
    url.searchParams.delete('examination')
    url.searchParams.set('place', 'orders')
  })
}

function examinationHref(
  ctx: EncounterContext,
  examination_identifier: string,
) {
  return hrefFromCtx(ctx, (url) => {
    url.searchParams.delete('add')
    url.searchParams.set('examination', examination_identifier)
    url.searchParams.delete('place')
  })
}

function addExaminationsHref(ctx: EncounterContext) {
  return hrefFromCtx(ctx, (url) => {
    url.searchParams.set('add', 'examinations')
    url.searchParams.delete('examination')
    url.searchParams.delete('place')
  })
}

function allowedToPlaceOrders(
  encounter_provider: RenderedPatientEncounterProvider,
): boolean {
  return encounter_provider.profession === 'doctor'
}

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

async function handleAddExaminations(
  req: Request,
  ctx: EncounterContext,
  _patient_examinations: RenderedPatientEncounterExamination[],
) {
  const { trx, encounter, encounter_provider } = ctx.state

  const {
    assessments,
    diagnostic_tests_at_organization,
    diagnostic_test_orders,
  } = await parseRequest(
    trx,
    req,
    AddExaminationsSchema.parse,
  )

  if (diagnostic_test_orders.length) {
    assertOr403(
      allowedToPlaceOrders(encounter_provider),
      'Only doctors can place orders',
    )
  }

  const patient_id = getRequiredUUIDParam(ctx, 'patient_id')

  await examinations.add(trx, {
    patient_id,
    encounter_id: encounter.encounter_id,
    encounter_provider_id: encounter_provider.patient_encounter_provider_id,
    examinations: {
      during_this_encounter: [
        ...assessments,
        ...diagnostic_tests_at_organization,
      ],
      orders: diagnostic_test_orders,
    },
  })

  return redirect(noExaminationSpecifiedHref(ctx))
}

// deno-lint-ignore require-await
async function handlePlaceOrders(
  _req: Request,
  ctx: EncounterContext,
  patient_examinations: RenderedPatientEncounterExamination[],
): Promise<Response> {
  // TODO: Place orders
  const { encounter_provider } = ctx.state
  assertOr403(
    allowedToPlaceOrders(encounter_provider),
    'Only doctors can place orders',
  )

  const [_orders, during_this_encounter] = partition(
    patient_examinations,
    (ex) => !!ex.ordered,
  )
  const next_incomplete_exam = during_this_encounter.find(
    (exam) => !exam.completed && !exam.skipped,
  )

  return next_incomplete_exam
    ? redirect(
      examinationHref(ctx, next_incomplete_exam.examination_identifier),
    )
    : completeStep(ctx)
}

// deno-lint-ignore require-await
async function handleExaminationFindings(
  _req: Request,
  ctx: EncounterContext,
  patient_examinations: RenderedPatientEncounterExamination[],
) {
  const examination = matchingExamination(ctx, patient_examinations)
  assert(examination, 'No matching examination')

  /* const { encounter, trx, encounter_provider } = ctx.state */

  const [orders, during_this_encounter] = partition(
    patient_examinations,
    (ex) => !!ex.ordered,
  )
  const next_incomplete_exam = during_this_encounter.find(
    (exam) => exam !== examination && !exam.completed && !exam.skipped,
  )

  const once_done = next_incomplete_exam
    ? redirect(
      examinationHref(ctx, next_incomplete_exam.examination_identifier),
    )
    : orders.length
    ? redirect(placeOrdersHref(ctx))
    : completeStep(ctx)

  // const { skipped, ...values } = await parseRequestAsserts(
  //   trx,
  //   req,
  //   assertIsExaminationFindings,
  // )

  // const patient_id = getRequiredUUIDParam(ctx, 'patient_id')

  // await examinations.upsertFindings(
  //   trx,
  //   {
  //     patient_id,
  //     encounter_id: encounter.encounter_id,
  //     encounter_provider_id: encounter_provider.patient_encounter_provider_id,
  //     examination_identifier: examination.examination_identifier,
  //     skipped: !!skipped,
  //     values: skipped ? {} : omit(values, ['examination']),
  //   },
  // )

  return once_done
}

export const handler: LoggedInHealthWorkerHandlerWithProps<
  unknown,
  EncounterContext['state']
> = {
  async POST(req: Request, ctx: EncounterContext) {
    const adding_examinations =
      ctx.url.searchParams.get('add') === 'examinations'
    const placing_orders = ctx.url.searchParams.get('place') === 'orders'
    const patient_examinations = await examinations.forPatientEncounter(
      ctx.state.trx,
      {
        patient_id: ctx.state.encounter.patient_id,
        encounter_id: ctx.params.encounter_id,
        encounter_step: 'examinations',
      },
    )

    const handle = adding_examinations
      ? handleAddExaminations
      : placing_orders
      ? handlePlaceOrders
      : handleExaminationFindings

    return handle(req, ctx, patient_examinations)
  },
}

export async function ExaminationsPage(
  ctx: EncounterContext,
) {
  const { trx, encounter /*, encounter_provider */ } = ctx.state
  const adding_examinations = ctx.url.searchParams.get('add') === 'examinations'
  const placing_orders = ctx.url.searchParams.get('place') === 'orders'

  const doing_examination = !adding_examinations && !placing_orders

  const patient_examinations = await examinations.forPatientEncounter(trx, {
    patient_id: encounter.patient_id,
    encounter_id: ctx.params.encounter_id,
    encounter_step: 'examinations',
  })

  console.log('patient_examinations', patient_examinations)

  const examination = doing_examination &&
    matchingExamination(ctx, patient_examinations)

  if (doing_examination) {
    assert(examination, 'No matching examination')
  }

  const add_examinations_href = addExaminationsHref(ctx)
  const place_orders_href = placeOrdersHref(ctx)

  const [orders, during_this_encounter] = partition(
    patient_examinations,
    (ex) => !!ex.ordered,
  )

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

  if (orders.length) {
    tabs.push({
      tab: 'Place Orders',
      href: place_orders_href,
      active: placing_orders,
      leftIcon: <PaperAirplaneIcon className='w-5 h-5' />,
    })
  }

  tabs.push({
    tab: 'Add Examinations',
    href: add_examinations_href,
    active: adding_examinations,
    leftIcon: <PlusCircleIcon className='w-5 h-5' />,
  })

  return {
    next_step_text: adding_examinations
      ? 'Add Examinations'
      : `Continue to ${once_done}`,
    children: (
      <>
        <Tabs tabs={tabs} />
        {adding_examinations && (
          <>TODO: reimplement</>
          // <NewExaminationForm
          //   recommended_examinations={patient_examinations.filter((ex) =>
          //     ex.recommended
          //   ).map((ex) => ex.examination_identifier)}
          //   selected_examinations={patient_examinations.map((ex) =>
          //     ex.examination_identifier
          //   )}
          //   available_diagnostic_tests={await getAvailableTests(trx, {
          //     organization_id: ctx.state.encounter.providers[0].organization_id,
          //   })}
          //   allowed_to_place_orders={allowedToPlaceOrders(encounter_provider)}
          // />
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
          <>TODO implement examinations</>
          // <PatientExaminationForm
          //   patient_examination={await examinations.getPatientExamination(trx, {
          //     patient_id: encounter.patient_id,
          //     encounter_id: encounter.encounter_id,
          //     examination_identifier: examination.examination_identifier,
          //   })}
          // />
        )}
      </>
    ),
  }
}

export default EncounterPage(ExaminationsPage)
