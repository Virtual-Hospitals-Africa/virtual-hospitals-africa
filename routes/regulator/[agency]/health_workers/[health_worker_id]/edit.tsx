import { Context } from 'fresh'
import { LoggedInRegulator } from '../../../../types.ts'
import HealthWorkerForm from '../../../../islands/regulator/HealthWorkerForm.tsx'
import redirect from '../../../../util/redirect.ts'
import { health_workers } from '../../../../db/models/health_workers.ts'
import { getRequiredUUIDParam } from '../../../../util/getParam.ts'
import { postHandler } from '../../../../backend/postHandler.ts'
import { RegulatorHomePageLayout } from '../../../regulator/_middleware.tsx'
import { SERVER_COUNTRY } from '../../../../db/models/countries.ts'
import z from 'zod'

export const HealthWorkerUpsertSchema = z.object({
  licence_number: z.string(),
  prefix: z.enum(['Mr', 'Mrs', 'Ms', 'Miss', 'Dr']),
  first_names: z.string(),
  surname: z.string(),
  address: z.string(),
  town: z.string(),
  expiry_date: z.string(),
  health_worker_type: z.enum([
    'Dispensing Medical Practitioner',
    'Ind Clinic Nurse',
    'HealthWorker',
    'Organization Technician',
  ]),
  organizations: z.optional(z.array(z.object({
    is_admin: z.boolean(),
    id: z.string(),
  }))),
})

export const handler = postHandler(
  HealthWorkerUpsertSchema,
  async (ctx, form_values) => {
    const { country } = ctx.params
    // const health_worker_id = getRequiredUUIDParam(ctx, 'health_worker_id')

    // await health_workers.update(ctx.state.trx, health_worker_id, form_values)
    await console.log('TODO, edit health_worker', form_values)

    const success = encodeURIComponent(
      `HealthWorker updated`,
    )

    return redirect(
      `/regulator/health_workers?success=${success}`,
    )
  },
)

export default RegulatorHomePageLayout(
  'HealthWorkers',
  async function EditHealthWorkerPage(
    ctx: Context<LoggedInRegulator>,
  ) {
    const { country } = ctx.params
    const health_worker_id = getRequiredUUIDParam(ctx, 'health_worker_id')

    const health_worker = await health_workers.getById(
      ctx.state.trx,
      health_worker_id,
    )
    if (!health_worker || health_worker.licence.country !== country) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: `/regulator/health_workers?error=` +
            encodeURIComponent('HealthWorker not found'),
        },
      })
    }

    return <HealthWorkerForm form_data={health_worker} country={SERVER_COUNTRY} />
  },
)
