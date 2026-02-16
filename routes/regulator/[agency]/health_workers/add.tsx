import HealthWorkerForm from '../../../islands/regulator/HealthWorkerForm.tsx'
import redirect from '../../../util/redirect.ts'
import { health_workers } from '../../../db/models/health_workers.ts'
import { DeepPartial, LoggedInRegulatorContext, RenderedCountryHealthWorker } from '../../../types.ts'
import compact from '../../../util/compact.ts'
import { postHandler } from '../../../backend/postHandler.ts'
import { RegulatorHomePageLayout } from '../_middleware.tsx'
import { SERVER_COUNTRY } from '../../../db/models/countries.ts'
import z from 'zod'
import { profession, sex, varchar255 } from '../../../util/validators.ts'
import { asNames } from '../../../util/asNames.ts'
import { country_health_workers } from '../../../db/models/country_health_workers.ts'
import { LIVING_LANGUAGES } from '../../../shared/languages.ts'

export const handler = postHandler(
  z.object({
    first_names: varchar255,
    surname: varchar255,
    preferred_name: varchar255,
    date_of_birth: z.string().date(),
    sex,
    gender: varchar255,
    licences: z.object({
      profession,
      licence_number: z.string(),
      expiry_date: z.string().date(),
    }).array(),
  }),
  async (ctx, form_values) => {
    const country = SERVER_COUNTRY
    await country_health_workers.insert(ctx.state.trx, {
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
    const health_worker: DeepPartial<RenderedCountryHealthWorker> = {}
    if (name) {
      const names = asNames({ name })
      Object.assign(health_worker, names)
    }
    if (licence_number) {
      health_worker.licences = [{
        licence_number,
      }]
    }

    return <HealthWorkerForm health_worker={health_worker} country={SERVER_COUNTRY} />
  },
)
