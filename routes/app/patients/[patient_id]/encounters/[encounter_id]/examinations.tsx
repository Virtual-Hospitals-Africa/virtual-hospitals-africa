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
import FormButtons from '../../../../../../components/library/form/buttons.tsx'
import {
  getPatientExamination,
  upsertFindings,
} from '../../../../../../db/models/examinations.ts'
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
import omit from '../../../../../../util/omit.ts'

function assertIsExaminationFindings(
  values: unknown,
): asserts values is Record<string, Record<string, unknown>> {
  assertOr400(isObjectLike(values), 'Invalid form values')
}

function examinationHref(ctx: EncounterContext, examination_name: string) {
  const url = new URL(ctx.url)
  url.searchParams.delete('add')
  url.searchParams.set('examination', examination_name)
  return url.toString()
}

function addExaminationHref(ctx: EncounterContext) {
  const url = new URL(ctx.url)
  url.searchParams.delete('examination')
  url.searchParams.set('add', 'examination')
  return url.toString()
}

function matchingExamination(
  ctx: EncounterContext,
): RenderedPatientEncounterExamination | null {
  const { encounter } = ctx.state
  const adding_examination = ctx.url.searchParams.get('add') === 'examination'
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

export const handler: LoggedInHealthWorkerHandlerWithProps<
  unknown,
  EncounterContext['state']
> = {
  async POST(req, ctx: EncounterContext) {
    const examination = matchingExamination(ctx)
    assert(examination, 'No matching examination')

    const next_incomplete_exam = ctx.state.encounter.examinations.find(
      (exam) => exam !== examination && !exam.completed && !exam.skipped,
    )

    const once_done = next_incomplete_exam
      ? redirect(examinationHref(ctx, next_incomplete_exam.examination_name))
      : completeStep(ctx)

    const values = await parseRequestAsserts(
      ctx.state.trx,
      req,
      assertIsExaminationFindings,
    )

    console.log('values', values)
    const patient_id = getRequiredNumericParam(ctx, 'patient_id')
    console.log('patient_id', patient_id)

    await upsertFindings(
      ctx.state.trx,
      {
        patient_id,
        encounter_id: ctx.state.encounter.encounter_id,
        encounter_provider_id:
          ctx.state.encounter_provider.patient_encounter_provider_id,
        examination_name: examination.examination_name,
        values: omit(values, ['examination']),
      },
    )

    console.log('fffff')

    return once_done
  },
}

export default async function ExaminationsPage(
  _req: Request,
  ctx: EncounterContext,
) {
  const { trx, encounter } = ctx.state
  const adding_examination = ctx.url.searchParams.get('add') === 'examination'

  const examination = adding_examination ? null : matchingExamination(ctx)

  if (!adding_examination) {
    assert(examination, 'No matching examination')
  }

  const add_examination_href = addExaminationHref(ctx)

  const tabs: TabProps[] = encounter.examinations.map((exam) => {
    const active = exam === examination
    return {
      tab: exam.examination_name,
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
      tab: 'Add Examination',
      href: add_examination_href,
      active: ctx.url.searchParams.has('add'),
      leftIcon: <PlusCircleIcon className='w-5 h-5' />,
    },
  ])

  return (
    <EncounterLayout ctx={ctx}>
      <Tabs tabs={tabs} />
      {adding_examination && <div>TODO: enable adding new examinations</div>}
      {examination && (
        <PatientExaminationForm
          patient_examination={await getPatientExamination(trx, {
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
