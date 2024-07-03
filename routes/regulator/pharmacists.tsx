import Layout from '../../components/library/Layout.tsx'
import PharmacistsTable from '../../components/regulator/PharmacistsTable.tsx'
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
    pharmacist_type: 'Pharmacist' as const,
  },
  {
    license_number: '234567',
    prefix: 'Miss',
    given_name: 'Bbb',
    family_name: 'Ttt',
    address: '456 Dean St yyyyyyyyy',
    town: 'Bbb',
    expiry_date: '2025-12-31',
    pharmacist_type: 'Pharmacist' as const,
  },
]

// deno-lint-ignore require-await
export default async function PharmacistsPage(
  _req: Request,
  ctx: {
    route: string
    url: URL
    state: { regulator: LoggedInRegulator['regulator'] }
  },
) {
  const regulator = ctx.state.regulator

  return (
    <Layout
      title='Pharmacists'
      route={ctx.route}
      url={ctx.url}
      regulator={regulator}
      params={{}}
      variant='regulator home page'
    >
      <PharmacistsTable
        pharmacists={pharmacists}
        pathname={ctx.url.pathname}
      />
    </Layout>
  )
}
