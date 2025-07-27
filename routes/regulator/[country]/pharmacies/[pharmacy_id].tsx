import Layout from '../../../../components/library/Layout.tsx'
import * as pharmacies from '../../../../db/models/pharmacies.ts'
import { assertOr404 } from '../../../../util/assertOr.ts'
import { getRequiredUUIDParam } from '../../../../util/getParam.ts'
import { LoggedInRegulator } from '../../../../types.ts'
import { FreshContext } from '$fresh/server.ts'
import PharmacyDetailedCard from '../../../../components/regulator/PharmacyDetailedCard.tsx'

export default async function PharmacyPage(
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
    <Layout
      title='Pharmacies'
      route={ctx.route}
      url={ctx.url}
      regulator={ctx.state.regulator}
      params={{}}
      variant='regulator home page'
    >
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
    </Layout>
  )
}
