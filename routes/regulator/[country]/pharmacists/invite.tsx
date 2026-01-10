import PharmacistForm from '../../../../islands/regulator/PharmacistForm.tsx'
import redirect from '../../../../util/redirect.ts'
import {
  pharmacists,
  PharmacistUpsertSchema,
} from '../../../../db/models/pharmacists.ts'
import {
  LoggedInRegulatorContext,
  RenderedPharmacist,
} from '../../../../types.ts'
import compact from '../../../../util/compact.ts'
import { postHandler } from '../../../../backend/postHandler.ts'
import { RegulatorHomePageLayout } from '../../../regulator/_middleware.tsx'

export const handler = postHandler(
  PharmacistUpsertSchema,
  async (ctx, form_values) => {
    const { country } = ctx.params

    await pharmacists.insert(ctx.state.trx, {
      ...form_values,
      country,
    })

    const success = encodeURIComponent(
      `New pharmacist added`,
    )

    return redirect(
      `/regulator/${country}/pharmacists?success=${success}`,
    )
  },
)

export default RegulatorHomePageLayout(
  'Pharmacists',
  function InvitePage(
    ctx: LoggedInRegulatorContext,
  ) {
    const name = ctx.url.searchParams.get('name')
    const licence_number = ctx.url.searchParams.get('licence_number')
    const form_data: Partial<RenderedPharmacist> = {}
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

    return <PharmacistForm form_data={form_data} country={ctx.params.country} />
  },
)
