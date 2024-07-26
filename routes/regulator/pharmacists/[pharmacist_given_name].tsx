import Layout from '../../../components/library/Layout.tsx'
import PharmacistDetailedCard from '../../../components/regulator/DetailedCard.tsx'
import { LoggedInRegulator, TrxOrDb } from '../../../types.ts'


export default async function PharmacistPage(
    _req: Request,
    ctx: {
        route: string
        url: URL
        state: { regulator: LoggedInRegulator['regulator']; trx: TrxOrDb }
      },
  ) {
    console.log(23444)
    const { regulator } = ctx.state
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
        
        </div>
      </Layout>
    )
  }
  