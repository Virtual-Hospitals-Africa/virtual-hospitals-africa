import { FreshContext, PageProps } from '$fresh/server.ts'
import Layout from '../../components/library/Layout.tsx'
import PharmacistsTable from '../../components/health_worker/PharmacistsTable.tsx'
import { LoggedInRegulator } from '../../types.ts'

const pharmacists = [
  { 
    license_number: '123456',
    prefix: 'Ms',
    given_name: 'Aaa',
    family_name: 'Sss',
    address: '123 Main St xxxxxx',
    town: 'Aaa',
    expiry_date: '2025-12-31',
    pharmacist_type: 'Pharmacist'
  },
  { 
    license_number: '234567',
    prefix: 'Miss',
    given_name: 'Bbb',
    family_name: 'Ttt',
    address: '456 Dean St yyyyyyyyy',
    town: 'Bbb',
    expiry_date: '2025-12-31',
    pharmacist_type: 'Pharmacist'
  }
]

type PharmacistsPageProps = {
    pharmacists: typeof pharmacists
    regulator: LoggedInRegulator['regulator']
}

export const handler: PageProps<PharmacistsPageProps> = {
    async GET(_req: Request, ctx: FreshContext<LoggedInRegulator>) {
        return ctx.render({
            pharmacists,
            regulator: ctx.state.regulator
        })
    },
}

export default function PharmacistTable(
    props: PageProps<PharmacistsPageProps>,
) {
    return (
        <Layout
          title="Pharmacists"
          route={props.route}
          url={props.url}
          regulator={props.data.regulator}
          params={props.params}
          variant='regulator home page'
        >
          <PharmacistsTable
            isAdmin={true} 
            pharmacists={props.data.pharmacists}
            pathname={props.url.pathname}
          />    
        </Layout>  
    )
}
