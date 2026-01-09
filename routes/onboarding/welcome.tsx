import JustLogoLayout from '../../components/library/JustLogoLayout.tsx'
import * as organizations from '../../db/models/organizations.ts'
import * as regulators from '../../db/models/regulators.ts'
import * as employment from '../../db/models/employment.ts'
import * as health_workers from '../../db/models/health_workers.ts'
import { OnboardingContext } from './_middleware.tsx'
import { Onboarding } from '../../islands/Onboarding.tsx'
import { z } from 'zod'
import { postHandler } from '../../backend/postHandler.ts'
import redirect from '../../util/redirect.ts'
import { promiseProps } from '../../util/promiseProps.ts'
import { organizationDepartmentIdsOfProfession } from '../../shared/departments.ts'

const OnboardingSchema = z.object({
  organization_id: z.string().uuid(),
  profession: z.enum(['nurse', 'doctor']),
  specialty: z.string(),
}).or(z.object({
  organization_id: z.string().uuid(),
  profession: z.enum(['receptionist']),
})).or(z.object({
  profession: z.enum(['regulator']),
  country: z.string(),
}))

export const handler = postHandler(
  OnboardingSchema,
  async (ctx: OnboardingContext, form_values) => {
    const { trx, health_worker } = ctx.state
    // We had previously created a health worker for the user, but since they are indicating they are a regulator
    // this was incorrect, so we need to remove the health worker and create a regulator instead
    // Very hacky, but we move the google tokens and session to the regulator
    if (form_values.profession === 'regulator') {
      await promiseProps({
        health_worker: health_workers.removeById(trx, health_worker.id),
        session: trx.updateTable('sessions').where(
          'entity_id',
          '=',
          health_worker.id,
        ).where('entity_type', '=', 'health_worker').set({
          entity_type: 'regulator',
        })
          .returning('sessions.id')
          .executeTakeFirstOrThrow(),
        google_token: trx.updateTable('google_tokens').where(
          'entity_id',
          '=',
          health_worker.id,
        ).where('entity_type', '=', 'health_worker').set({
          entity_type: 'regulator',
        }).executeTakeFirstOrThrow(),
        regulator: regulators.upsert(trx, {
          id: health_worker.id,
          name: health_worker.name,
          email: health_worker.email,
          avatar_url: health_worker.avatar_url,
          country: form_values.country,
        }),
      })

      const response = redirect(
        `/regulator/${form_values.country}/pharmacies`,
      )

      return response
    }

    const { organization_id, profession } = form_values
    const specialty = 'specialty' in form_values ? form_values.specialty : null
    const organization = await organizations.getById(trx, organization_id)

    const department_ids = organizationDepartmentIdsOfProfession(
      organization,
      profession,
      specialty,
    )

    await employment.addOne(trx, {
      department_ids,
      organization_id,
      profession,
      specialty,
      health_worker_id: health_worker.id,
      is_admin: false,
    })

    return redirect('/app')
  },
)

export default async function OnboardingPage(
  ctx: OnboardingContext,
) {
  const test_organizations = await organizations.search(ctx.state.trx, {
    is_test: true,
  })

  return (
    <JustLogoLayout title='Virtual Hospitals Africa'>
      <Onboarding
        health_worker={ctx.state.health_worker}
        organizations={test_organizations.results}
      />
    </JustLogoLayout>
  )
}
