import * as pharmacies from '../../../../db/models/pharmacies.ts'
import { assertOr404 } from '../../../../util/assertOr.ts'
import { getRequiredUUIDParam } from '../../../../util/getParam.ts'
import { LoggedInRegulator } from '../../../../types.ts'
import { FreshContext } from '$fresh/server.ts'
import PharmacyDetailedCard from '../../../../components/regulator/PharmacyDetailedCard.tsx'
import { RegulatorHomePageLayout } from '../../../regulator/_middleware.tsx'

export default RegulatorHomePageLayout(
  'Pharmacies',
  async function PharmacyPage(
    _req: Request,
    ctx: FreshContext<LoggedInRegulator>,
  ) {
    const pharmacy_id = getRequiredUUIDParam(ctx, 'pharmacy_id')

    const pharmacy = await pharmacies.getById(
      ctx.state.trx,
      pharmacy_id,
    )
    assertOr404(
      pharmacy,
      `Pharmacy ${pharmacy_id} not found`,
    )

    return (
      <div className='mt-4 text-sm leading-6 lg:col-span-7 xl:col-span-8 row-span-full'>
        <div className='my-6 overflow-hidden bg-slate-50'>
          <dt className='mt-2 text-lg font-bold leading-6 text-gray-900'>
            {pharmacy.name}
          </dt>
        </div>
        <PharmacyDetailedCard
          pharmacy={pharmacy}
        />
      </div>
    )
  },
)
