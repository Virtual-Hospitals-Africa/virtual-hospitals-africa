import { ComponentChildren, JSX } from 'preact'
import { FreshContext } from '$fresh/server.ts'
import { assert } from 'std/assert/assert.ts'
import Layout from '../../../../../components/library/Layout.tsx'
import Form from '../../../../../components/library/Form.tsx'
import * as doctor_reviews from '../../../../../db/models/doctor_reviews.ts'
import { getRequiredUUIDParam } from '../../../../../util/getParam.ts'
import { StepsSidebar } from '../../../../../components/library/Sidebar.tsx'
import capitalize from '../../../../../util/capitalize.ts'
import { completedStep } from '../../../../../db/models/doctor_reviews.ts'
import redirect from '../../../../../util/redirect.ts'
import { DOCTOR_REVIEW_STEPS } from '../../../../../shared/review.ts'
import { LoggedInHealthWorkerContext } from '../../../../../types.ts'
import { RenderedDoctorReview } from '../../../../../types.ts'
import { replaceParams } from '../../../../../util/replaceParams.ts'
import { assertOr400 } from '../../../../../util/assertOr.ts'

export type ReviewContext = LoggedInHealthWorkerContext<
  {
    doctor_review: RenderedDoctorReview
    reviewing_via_employment: {
      organization_id: string
      employment_id: string
    }
  }
>

export async function handler(
  _req: Request,
  ctx: LoggedInHealthWorkerContext,
) {
  const { doctor_review } = await doctor_reviews.addSelfAsReviewer(
    ctx.state.trx,
    {
      patient_id: getRequiredUUIDParam(ctx, 'patient_id'),
      health_worker: ctx.state.healthWorker,
    },
  )

  const { employment } = ctx.state.healthWorker
  const { employment_id } = doctor_review
  const reviewing_via_employment = employment.find((e) =>
    e.roles.doctor?.employment_id === employment_id
  )
  assertOr400(reviewing_via_employment, 'Doctor employment not found')

  Object.assign(
    ctx.state,
    {
      doctor_review,
      reviewing_via_employment: {
        employment_id,
        organization_id: reviewing_via_employment.organization.id,
      },
    },
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
