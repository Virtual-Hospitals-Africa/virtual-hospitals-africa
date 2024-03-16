import { assert } from 'std/assert/assert.ts'
import {
  completeStep,
  EncounterContext,
  EncounterLayout,
} from './_middleware.tsx'
import {
  LoggedInHealthWorkerHandlerWithProps,
  RenderedPatientEncounterExamination,
} from '../../../../../../types.ts'
import FormButtons from '../../../../../../islands/form/buttons.tsx'
import * as examinations from '../../../../../../db/models/examinations.ts'
import {
  assertOr400,
  assertOrRedirect,
} from '../../../../../../util/assertOr.ts'
import isObjectLike from '../../../../../../util/isObjectLike.ts'
import { parseRequestAsserts } from '../../../../../../util/parseForm.ts'
import { getRequiredNumericParam } from '../../../../../../util/getNumericParam.ts'
import redirect from '../../../../../../util/redirect.ts'
import { TabProps, Tabs } from '../../../../../../components/library/Tabs.tsx'
import * as ProgressIcons from '../../../../../../components/library/icons/progress.tsx'
import {
  ForwardIcon,
  PlusCircleIcon,
} from '../../../../../../components/library/icons/heroicons/outline.tsx'
import { PatientExaminationForm } from '../../../../../../islands/examinations/Form.tsx'
import { NewExaminationForm } from '../../../../../../islands/examinations/New.tsx'
import omit from '../../../../../../util/omit.ts'
import hrefFromCtx from '../../../../../../util/hrefFromCtx.ts'
import { getAvailableTestsInFacility } from '../../../../../../db/models/inventory.ts'
import {
  Examination,
  EXAMINATIONS,
} from '../../../../../../shared/examinations.ts'

function assertIsExaminationFindings(
  values: unknown,
): asserts values is Record<string, Record<string, unknown>> {
  assertOr400(isObjectLike(values), 'Invalid form values')
}

function assertIsAddExaminations(
  values: unknown,
): asserts values is {
  assessments?: Examination[]
  diagnostic_tests_at_facility?: Examination[]
  diagnostic_test_orders?: Examination[]
} {
  assertOr400(isObjectLike(values), 'Invalid form values')
  for (const key in values) {
    assertOr400(
      key === 'assessments' || key === 'diagnostic_tests_at_facility' ||
        key === 'diagnostic_test_orders',
      `Unrecognized examination type: ${key}`,
    )
    const examinations = values[key]
    assertOr400(
      Array.isArray(examinations),
      `Invalid ${key} value, must be an array`,
    )
    for (const exam of examinations) {
      assertOr400(
        typeof exam === 'string',
        `Invalid examination value, must be a string`,
      )
      assertOr400(
        EXAMINATIONS.includes(exam as Examination),
        `Invalid examination value, ${exam} is not a valid examination`,
      )
    }
  }
}

function noExaminationSpecifiedHref(ctx: EncounterContext) {
  return hrefFromCtx(ctx, (url) => {
    url.searchParams.delete('add')
    url.searchParams.delete('examination')
  })
}

function examinationHref(ctx: EncounterContext, examination_name: string) {
  return hrefFromCtx(ctx, (url) => {
    url.searchParams.delete('add')
    url.searchParams.set('examination', examination_name)
  })
}

function addExaminationsHref(ctx: EncounterContext) {
  return hrefFromCtx(ctx, (url) => {
    url.searchParams.delete('examination')
    url.searchParams.set('add', 'examinations')
  })
}

function matchingExamination(
  ctx: EncounterContext,
): RenderedPatientEncounterExamination | null {
  const { encounter } = ctx.state
  const adding_examination = ctx.url.searchParams.get('add') === 'examinations'
  if (adding_examination) return null
  const examination_name = ctx.url.searchParams.get('examination')

  const next_incomplete_exam = ctx.state.encounter.examinations.find(
    (exam) => !exam.completed && !exam.skipped,
  ) || encounter.examinations[0]
  if (!examination_name) {
    return next_incomplete_exam
  }
  const matching_examination = encounter.examinations.find(
    (examination) => examination.examination_name === examination_name,
  )
  assertOrRedirect(
    matching_examination,
    examinationHref(ctx, next_incomplete_exam.examination_name),
  )
  return matching_examination
}

async function handleAddExamination(req: Request, ctx: EncounterContext) {
  const { trx, encounter, encounter_provider } = ctx.state

  const {
    assessments = [],
    diagnostic_tests_at_facility = [],
    diagnostic_test_orders = [],
  } = await parseRequestAsserts(
    trx,
    req,
    assertIsAddExaminations,
  )

  console.log(`TODO: handle diagnostic_test_orders: ${diagnostic_test_orders}`)

  const patient_id = getRequiredNumericParam(ctx, 'patient_id')

  const examinations_to_add = [
    ...assessments,
    ...diagnostic_tests_at_facility,
  ]

  await examinations.add(trx, {
    patient_id,
    encounter_id: encounter.encounter_id,
    encounter_provider_id: encounter_provider.patient_encounter_provider_id,
    examinations: examinations_to_add,
  })

  return redirect(noExaminationSpecifiedHref(ctx))
}

async function handleExaminationFindings(req: Request, ctx: EncounterContext) {
  const examination = matchingExamination(ctx)
  assert(examination, 'No matching examination')

  const { trx, encounter, encounter_provider } = ctx.state
  const next_incomplete_exam = encounter.examinations.find(
    (exam) => exam !== examination && !exam.completed && !exam.skipped,
  )

  const once_done = next_incomplete_exam
    ? redirect(examinationHref(ctx, next_incomplete_exam.examination_name))
    : completeStep(ctx)

  const { skipped, ...values } = await parseRequestAsserts(
    trx,
    req,
    assertIsExaminationFindings,
  )

  const patient_id = getRequiredNumericParam(ctx, 'patient_id')

  await examinations.upsertFindings(
    trx,
    {
      patient_id,
      encounter_id: encounter.encounter_id,
      encounter_provider_id: encounter_provider.patient_encounter_provider_id,
      examination_name: examination.examination_name,
      skipped: !!skipped,
      values: skipped ? {} : omit(values, ['examination']),
    },
  )

  return once_done
}

export const handler: LoggedInHealthWorkerHandlerWithProps<
  unknown,
  EncounterContext['state']
> = {
  POST(req, ctx: EncounterContext) {
    const handle = ctx.url.searchParams.get('add') === 'examinations'
      ? handleAddExamination
      : handleExaminationFindings

    return handle(req, ctx)
  },
}

export default async function ExaminationsPage(
  _req: Request,
  ctx: EncounterContext,
) {
  const { trx, encounter } = ctx.state
  const adding_examination = ctx.url.searchParams.get('add') === 'examinations'

  const examination = adding_examination ? null : matchingExamination(ctx)

  if (!adding_examination) {
    assert(examination, 'No matching examination')
  }

  const add_examinations_href = addExaminationsHref(ctx)

  const tabs: TabProps[] = encounter.examinations.map((exam) => {
    const active = exam === examination
    return {
      tab: exam.examination_name as string,
      href: examinationHref(ctx, exam.examination_name),
      active,
      leftIcon: exam.completed
        ? <ProgressIcons.Check active={active} />
        : exam.skipped && !active
        ? <ForwardIcon className='w-5 h-5' />
        : <ProgressIcons.Dot active={active} />,
    }
  }).concat([
    {
      tab: 'Add Examinations',
      href: add_examinations_href,
      active: adding_examination,
      leftIcon: <PlusCircleIcon className='w-5 h-5' />,
    },
  ])

  return (
    <EncounterLayout ctx={ctx}>
      <Tabs tabs={tabs} />
      {adding_examination && (
        <NewExaminationForm
          recommended_examinations={encounter.examinations.filter((ex) =>
            ex.recommended
          ).map((ex) => ex.examination_name)}
          selected_examinations={encounter.examinations.map((ex) =>
            ex.examination_name
          )}
          available_diagnostic_tests={await getAvailableTestsInFacility(trx, {
            facility_id: ctx.state.encounter.providers[0].facility_id,
          })}
        />
      )}
      {examination && (
        <PatientExaminationForm
          patient_examination={await examinations.getPatientExamination(trx, {
            patient_id: encounter.patient_id,
            encounter_id: encounter.encounter_id,
            examination_name: examination.examination_name,
          })}
        />
      )}
      <FormButtons />
    </EncounterLayout>
  )
}
