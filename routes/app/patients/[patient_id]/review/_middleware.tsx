import { ComponentChildren, JSX } from 'preact'
import { FreshContext } from '$fresh/server.ts'
import { assert } from 'std/assert/assert.ts'
import Layout from '../../../../../components/library/Layout.tsx'
import Form from '../../../../../islands/form/Form.tsx'
import * as doctor_reviews from '../../../../../db/models/doctor_reviews.ts'
import { getRequiredNumericParam } from '../../../../../util/getNumericParam.ts'
import { Person } from '../../../../../components/library/Person.tsx'
import { StepsSidebar } from '../../../../../components/library/Sidebar.tsx'
import capitalize from '../../../../../util/capitalize.ts'
import { completedStep } from '../../../../../db/models/doctor_reviews.ts'
import redirect from '../../../../../util/redirect.ts'
import { DOCTOR_REVIEW_STEPS } from '../../../../../shared/review.ts'
import { LoggedInHealthWorkerContext } from '../../../../../types.ts'
import { RenderedDoctorReview } from '../../../../../types.ts'
import { replaceParams } from '../../../../../util/replaceParams.ts'

export type ReviewContext = LoggedInHealthWorkerContext<
  {
    doctor_review: RenderedDoctorReview
  }
>

export async function handler(
  _req: Request,
  ctx: LoggedInHealthWorkerContext,
) {
  Object.assign(
    ctx.state,
    await doctor_reviews.addSelfAsReviewer(ctx.state.trx, {
      patient_id: getRequiredNumericParam(ctx, 'patient_id'),
      health_worker: ctx.state.healthWorker,
    }),
  )
  return ctx.next()
}

const nav_links = DOCTOR_REVIEW_STEPS.map((step) => ({
  step,
  route: `/app/patients/:patient_id/review/${step}`,
}))

export const nextLink = ({ route, params }: FreshContext) => {
  const current_index = nav_links.findIndex(
    (link) => link.route === route,
  )
  assert(current_index >= 0)
  const next_link = nav_links[current_index + 1]
  if (!next_link) {
    return replaceParams(
      `/app/patients/:patient_id/review/clinical_notes`,
      params,
    )
  }
  assert(next_link)
  return replaceParams(next_link.route, params)
}

export async function completeStep(ctx: ReviewContext) {
  const step = nav_links.find((link) => link.route === ctx.route)?.step
  assert(step)
  await completedStep(ctx.state.trx, {
    doctor_review_id: ctx.state.doctor_review.review_id,
    step,
  })

  return redirect(nextLink(ctx))
}

export function ReviewLayout({
  ctx,
  children,
}: { ctx: ReviewContext; children: ComponentChildren }): JSX.Element {
  return (
    <Layout
      title={capitalize(ctx.state.doctor_review.encounter.reason) + ' Review'}
      sidebar={
        <StepsSidebar
          ctx={ctx}
          nav_links={nav_links}
          top={{
            href: replaceParams('/app/patients/:patient_id', ctx.params),
            child: <Person person={ctx.state.doctor_review.patient} />,
          }}
          steps_completed={ctx.state.doctor_review.steps_completed}
        />
      }
      url={ctx.url}
      variant='form'
    >
      <Form method='POST'>
        {children}
      </Form>
    </Layout>
  )
}
