import { Context } from 'fresh'
import JustLogoLayout from '../../components/library/JustLogoLayout.tsx'
import { SparklinesExample } from '../../islands/SparklinesExample.tsx'

// deno-lint-ignore require-await
export default async function ICD10SearchPage(ctx: Context<unknown>) {
  return (
    <JustLogoLayout url={ctx.url} title='Virtual Hospitals Africa'>
      <SparklinesExample />
    </JustLogoLayout>
  )
}
