import Layout from '../../../components/library/Layout.tsx'
import PharmacistDetailedCard from '../../../components/regulator/DetailedCard.tsx'
import { LoggedInRegulatorContext } from '../../../types.ts'
import { getRequiredUUIDParam } from '../../../util/getParam.ts'
import * as pharmacists from '../../../db/models/pharmacists.ts'
import { assertOr404 } from '../../../util/assertOr.ts'


export default async function PharmacistPage(
    _req: Request,
    ctx: LoggedInRegulatorContext
  ) {
    const { regulator } = ctx.state
    const pharmacist_id = getRequiredUUIDParam(ctx, 'pharmacist_id')
    const pharmacist = await pharmacists.getById(ctx.state.trx,pharmacist_id)
    assertOr404(
      pharmacist,
      `Pharmacists not found for pharmacist ${pharmacist_id}`,
    )
    return (
      <Layout
        title={pharmacist.given_name}
        route={ctx.route}
        url={ctx.url}
        regulator={regulator}
        params={{}}
        variant='regulator home page'
      >
        <div className='mt-4 text-sm leading-6 lg:col-span-7 xl:col-span-8 row-span-full'>
        <div className='my-6 overflow-hidden bg-slate-50'>
          <img
            className='h-20 w-20 object-cover display:inline rounded-full'
            src={``}
            alt=''
            width={48}
            height={48}
          />
          <dt className='mt-2 text-lg font-bold leading-6 text-gray-900'>
            {pharmacist.given_name}
          </dt>
          <dt className='text-sm font-sm leading-6 text-gray-400'>
            {"Pharmacist"}
          </dt>
        </div>
          <PharmacistDetailedCard pharmacist={pharmacist}/>
          </div>
      </Layout>
    )
  }
  