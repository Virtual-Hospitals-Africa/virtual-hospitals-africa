import { organizations } from '../../../../db/models/organizations.ts'
import { assertOr404 } from '../../../../util/assertOr.ts'
import { getRequiredUUIDParam } from '../../../../util/getParam.ts'
import { LoggedInRegulator } from '../../../../types.ts'
import { Context } from 'fresh'
import OrganizationDetailedCard from '../../../../components/regulator/OrganizationDetailedCard.tsx'
import { RegulatorHomePageLayout } from '../../../regulator/_middleware.tsx'

export default RegulatorHomePageLayout(
  'Pharmacies',
  async function OrganizationPage(
    ctx: Context<LoggedInRegulator>,
  ) {
    const pharmacy_id = getRequiredUUIDParam(ctx, 'pharmacy_id')

    const pharmacy = await organizations.getById(
      ctx.state.trx,
      pharmacy_id,
    )
    assertOr404(
      pharmacy,
      `Organization ${pharmacy_id} not found`,
    )

    return (
      <div className='mt-4 text-sm leading-6 lg:col-span-7 xl:col-span-8 row-span-full'>
        <div className='my-6 overflow-hidden bg-slate-50'>
          <dt className='mt-2 text-lg font-bold leading-6 text-gray-900'>
            {pharmacy.name}
          </dt>
        </div>
        <OrganizationDetailedCard
          pharmacy={pharmacy}
        />
      </div>
    )
  },
)
