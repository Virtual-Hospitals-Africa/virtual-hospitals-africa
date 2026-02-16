import HealthWorkerForm from '../../../islands/regulator/HealthWorkerForm.tsx'
import redirect from '../../../util/redirect.ts'
import { health_workers } from '../../../db/models/health_workers.ts'
import { DeepPartial, LoggedInRegulatorContext, RenderedCountryHealthWorker } from '../../../types.ts'
import compact from '../../../util/compact.ts'
import { postHandler } from '../../../backend/postHandler.ts'
import { RegulatorHomePageLayout } from '../_middleware.tsx'
import { SERVER_COUNTRY } from '../../../db/models/countries.ts'
import z from 'zod'
import { profession } from '../../../util/validators.ts'
import { asNames } from '../../../util/asNames.ts'

export const handler = postHandler(
  z.object({
    name: z.string(),
    profession,
    licence_number: z.string(),
    expiry_date: z.string().date(),
  }),
  async (ctx, form_values) => {
    const country = SERVER_COUNTRY
    await health_workers.insert(ctx.state.trx, {
      ...form_values,
      country,
    })

    const success = encodeURIComponent(
      `New health_worker added`,
    )

    return redirect(
      `/regulator/health_workers?success=${success}`,
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
    const form_data: DeepPartial<RenderedCountryHealthWorker> = {}
    if (name) {
      const names = asNames({ name })
      Object.assign(form_data, names)
    }
    if (licence_number) {
      form_data.licences = [{
        licence_number,
      }]
    }

    return <HealthWorkerForm form_data={form_data} country={SERVER_COUNTRY} />
  },
)
