import { ComponentChildren, JSX } from 'preact'
import { FreshContext } from '$fresh/server.ts'
import { assert } from 'std/assert/assert.ts'
import { Container } from '../../../../../components/library/Container.tsx'
import Layout from '../../../../../components/library/Layout.tsx'
import Form from '../../../../../components/library/form/Form.tsx'
import {
  RenderedPatientEncounter,
  RenderedPatientEncounterProvider,
} from '../../../../../types.ts'
import * as patients from '../../../../../db/models/patients.ts'
import * as patient_encounters from '../../../../../db/models/patient_encounters.ts'
import * as waiting_room from '../../../../../db/models/waiting_room.ts'
import {
  assertOr403,
  assertOr404,
  StatusError,
} from '../../../../../util/assertOr.ts'
import { getRequiredNumericParam } from '../../../../../util/getNumericParam.ts'
import { Person } from '../../../../../components/library/Person.tsx'
import {
  replaceParams,
  StepsSidebar,
} from '../../../../../components/library/Sidebar.tsx'
import capitalize from '../../../../../util/capitalize.ts'
import { completedStep } from '../../../../../db/models/doctor_reviews.ts'
import redirect from '../../../../../util/redirect.ts'
import { DOCTOR_REVIEW_STEPS } from '../../../../../shared/review.ts'
import { LoggedInHealthWorkerContext } from '../../../../../types.ts'

export type ReviewContext = {
  doctor_review: any
}

export async function addSelfAsReviewer(
  ctx: LoggedInHealthWorkerContext,
): Promise<{
  doctor_review: unknown
}> {
  const patient_id = getRequiredNumericParam(ctx, 'patient_id')
  const { trx, healthWorker } = ctx.state

  return {
    encounter,
    encounter_provider: matching_provider,
  }
}

export async function handler(
  _req: Request,
  ctx: LoggedInHealthWorkerContext,
) {
  Object.assign(
    ctx.state,
    await addSelfAsReviewer(ctx),
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

// export async function completeStep(ctx: ReviewContext) {
//   const step = nav_links.find((link) => link.route === ctx.route)?.step
//   assert(step)
//   await completedStep(ctx.state.trx, {
//     encounter_id: ctx.state.encounter.encounter_id,
//     step,
//   })

//   return redirect(nextLink(ctx))
// }

export function ReviewLayout({
  ctx,
  children,
}: { ctx: ReviewContext; children: ComponentChildren }): JSX.Element {
  return (
    <Layout
      title={capitalize(ctx.state.encounter.reason) + ' Review'}
      sidebar={
        <StepsSidebar
          ctx={ctx}
          nav_links={nav_links}
          top={{
            href: replaceParams('/app/patients/:patient_id', ctx.params),
            child: <Person person={ctx.state.patient} />,
          }}
          steps_completed={ctx.state.encounter.steps_completed}
        />
      }
      url={ctx.url}
      variant='form'
    >
      <Container size='md'>
        <Form method='POST'>
          {children}
        </Form>
      </Container>
    </Layout>
  )
}
