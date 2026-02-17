import JustLogoLayout from '../../components/library/JustLogoLayout.tsx'
import { employment } from '../../db/models/employment.ts'
import { OnboardingContext } from './_middleware.tsx'
import { Onboarding } from '../../islands/Onboarding.tsx'
import { z } from 'zod'
import { postHandler } from '../../backend/postHandler.ts'
import redirect from '../../util/redirect.ts'
import { organizationDepartmentIdsOfProfession } from '../../shared/departments.ts'
import { assert } from 'std/assert/assert.ts'
import { organizations_with_departments } from '../../db/models/organizations_with_departments.ts'
import { health_worker_licences } from '../../db/models/health_worker_licences.ts'
import { SERVER_COUNTRY } from '../../db/models/countries.ts'

const OnboardingSchema = z.object({
  organization_id: z.string().uuid(),
  profession: z.enum(['nurse', 'doctor']),
  specialty: z.string(),
}).or(z.object({
  organization_id: z.string().uuid(),
  profession: z.enum(['receptionist']),
}))

export const handler = postHandler(
  OnboardingSchema,
  async (ctx: OnboardingContext, form_values) => {
    const { trx, health_worker } = ctx.state

    const { organization_id, profession } = form_values
    const specialty = 'specialty' in form_values ? form_values.specialty : null
    const organization = await organizations_with_departments.getById(trx, organization_id)

    const department_ids = organizationDepartmentIdsOfProfession(
      organization,
      profession,
      specialty,
    )

    const result = await employment.addOne(trx, {
      department_ids,
      organization_id,
      role: profession,
      health_worker_id: health_worker.id,
      is_admin: false,
    })
    assert(result.id)

    await Promise.all([
      health_worker_licences.insertTest(trx, {
        health_worker_id: result.health_worker_id,
        country: SERVER_COUNTRY,
        role: profession,
        specialty,
      }),
      trx.insertInto('employment_presence')
        .values({
          id: result.id,
          at_work: true,
        }).execute(),
    ])

    return redirect('/app')
  },
)

export default async function OnboardingPage(
  ctx: OnboardingContext,
) {
  const test_organizations = await organizations_with_departments.search(ctx.state.trx, {
    is_test: true,
  })

  return (
    <JustLogoLayout url={ctx.url} title='Virtual Hospitals Africa'>
      <Onboarding
        health_worker={ctx.state.health_worker}
        organizations={test_organizations.results}
      />
    </JustLogoLayout>
  )
}
