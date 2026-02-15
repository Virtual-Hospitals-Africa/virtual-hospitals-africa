import HealthWorkerForm from '../../../../islands/regulator/HealthWorkerForm.tsx'
import redirect from '../../../../util/redirect.ts'
import { health_workers, HealthWorkerUpsertSchema } from '../../../../db/models/health_workers.ts'
import { LoggedInRegulatorContext, RenderedHealthWorker } from '../../../../types.ts'
import compact from '../../../../util/compact.ts'
import { postHandler } from '../../../../backend/postHandler.ts'
import { RegulatorHomePageLayout } from '../../../regulator/_middleware.tsx'

export const handler = postHandler(
  HealthWorkerUpsertSchema,
  async (ctx, form_values) => {
    const { country } = ctx.params

    await health_workers.insert(ctx.state.trx, {
      ...form_values,
      country,
    })

    const success = encodeURIComponent(
      `New health_worker added`,
    )

    return redirect(
      `/regulator/${country}/health_workers?success=${success}`,
    )
  },
)

export default RegulatorHomePageLayout(
  'HealthWorkers',
  function InvitePage(
    ctx: LoggedInRegulatorContext,
  ) {
    const name = ctx.url.searchParams.get('name')
    const licence_number = ctx.url.searchParams.get('licence_number')
    const form_data: Partial<RenderedHealthWorker> = {}
    if (name) {
      const names = compact(name.split(' ').map((n) => n.trim()))
      if (names.length === 1) {
        form_data.family_name = names[0]
      } else {
        form_data.given_name = names[0]
        form_data.family_name = names.slice(1).join(' ')
      }
    }
    if (licence_number) {
      form_data.licence_number = licence_number
    }

    return <HealthWorkerForm form_data={form_data} country={SERVER_COUNTRY} />
  },
)
