import { Context } from 'fresh'
import Layout from '../../components/library/Layout.tsx'
import { SparklinesExample } from '../../islands/SparklinesExample.tsx'

// deno-lint-ignore require-await
export default async function ICD10SearchPage(
  ctx: Context<unknown>,
) {
  return (
    <Layout
      title='Virtual Hospitals Africa'
      url={ctx.url}
      variant='just logo'
    >
      <SparklinesExample />
    </Layout>
  )
}
