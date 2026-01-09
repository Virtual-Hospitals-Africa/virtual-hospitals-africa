import { Context } from 'fresh'
import JustLogoLayout from '../components/library/JustLogoLayout.tsx'

// deno-lint-ignore require-await
export default async function ThankYouPage(ctx: Context<unknown>) {
  return (
    <JustLogoLayout url={ctx.url} title='Virtual Hospitals Africa'>
      <div />
    </JustLogoLayout>
  )
}
