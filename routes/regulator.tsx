import { FreshContext } from '$fresh/server.ts'
import Layout from '../components/library/Layout.tsx'
import { LoggedInRegulator } from '../types.ts'

// deno-lint-ignore require-await
export default async function AppPage(
  _req: Request,
  ctx: FreshContext<LoggedInRegulator>,
) {
  return (
    <Layout
      variant='regulator home page'
      title='Regulator Home'
      route={ctx.route}
      url={ctx.url}
      params={ctx.params}
      regulator={ctx.state.regulator}
    >
      TODO
    </Layout>
  )
}
