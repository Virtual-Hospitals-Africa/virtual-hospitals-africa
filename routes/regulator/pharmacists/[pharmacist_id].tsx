import Layout from '../../../components/library/Layout.tsx'
import PharmacistDetailedCard from '../../../components/regulator/DetailedCard.tsx'
import { LoggedInRegulatorContext } from '../../../types.ts'
import { getRequiredUUIDParam } from '../../../util/getParam.ts'
import * as pharmacists from '../../../db/models/pharmacists.ts'


export default async function PharmacistPage(
    _req: Request,
    ctx: LoggedInRegulatorContext
  ) {
    const { regulator } = ctx.state
    const pharmacist_id = getRequiredUUIDParam(ctx, 'pharmacist_id')
    const pharmacist = await pharmacists.getById(ctx.state.trx,pharmacist_id)
    return (
      <Layout
        title='Pharmacist Profile'
        route={ctx.route}
        url={ctx.url}
        regulator={regulator}
        params={{}}
        variant='regulator home page'
      >
        <div className='mt-4 divide-y divide-gray-100 text-sm leading-6 lg:col-span-7 xl:col-span-8 row-span-full'>
          <PharmacistDetailedCard pharmacist={pharmacist}/>
        </div>
      </Layout>
    )
  }
  