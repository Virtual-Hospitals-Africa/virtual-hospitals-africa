import Layout from '../../components/library/Layout.tsx'
import * as organizations from '../../db/models/organizations.ts'
import * as regulators from '../../db/models/regulators.ts'

import * as employment from '../../db/models/employment.ts'
import * as health_workers from '../../db/models/health_workers.ts'
import { OnboardingContext } from './_middleware.tsx'
import { Onboarding } from '../../islands/Onboarding.tsx'
import { z } from 'zod'
import { postHandler } from '../../util/postHandler.ts'
import redirect from '../../util/redirect.ts'
import { startRegulatorSession } from '../logged-in.tsx'

const OnboardingSchema = z.object({
  organization_id: z.string().uuid(),
  department_id: z.string().uuid(),
  profession: z.enum(['nurse', 'doctor']),
  specialty: z.string(),
}).or(z.object({
  profession: z.enum(['regulator']),
  country: z.string(),
}))

export const handler = postHandler(
  OnboardingSchema,
  async (_req, ctx: OnboardingContext, form_values) => {
    const { trx, healthWorker } = ctx.state
    // We had previously created a health worker for the user, but since they are indicating they are a regulator
    // this was incorrect, so we need to remove the health worker and create a regulator instead
    if (form_values.profession === 'regulator') {
      await health_workers.removeById(trx, healthWorker.id)
      const regulator = await regulators.upsert(trx, {
        name: healthWorker.name,
        email: healthWorker.email,
        avatar_url: healthWorker.avatar_url,
        country: form_values.country,
      })
      return startRegulatorSession(trx, regulator)
    }

    await employment.addOne(ctx.state.trx, {
      health_worker_id: ctx.state.healthWorker.id,
      ...form_values,
    })

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
