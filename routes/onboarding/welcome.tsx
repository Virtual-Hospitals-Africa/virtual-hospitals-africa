import Layout from '../../components/library/Layout.tsx'
import * as organizations from '../../db/models/organizations.ts'
import * as employment from '../../db/models/employment.ts'
import { OnboardingContext } from './_middleware.tsx'
import { Onboarding } from '../../islands/Onboarding.tsx'
import z from 'zod'
import { postHandler } from '../../util/postHandler.ts'
import redirect from '../../util/redirect.ts'

const OnboardingSchema = z.object({
  organization_id: z.string().uuid(),
  profession: z.enum(['nurse', 'doctor']),
  specialty: z.string(),
})

export const handler = postHandler(
  OnboardingSchema,
  async (_req, ctx: OnboardingContext, form_values) => {
    await employment.add(ctx.state.trx, [{
      health_worker_id: ctx.state.healthWorker.id,
      ...form_values,
    }])

    return redirect('/app')
  },
)

export default async function OnboardingPage(
  _req: Request,
  ctx: OnboardingContext,
) {
  const test_organizations = await organizations.search(ctx.state.trx, {
    is_test: true,
  })

  return (
    <Layout
      title='Virtual Hospitals Africa'
      url={ctx.url}
      variant='just logo'
    >
      <Onboarding
        health_worker={ctx.state.healthWorker}
        organizations={test_organizations.results}
      />
    </Layout>
  )
}
