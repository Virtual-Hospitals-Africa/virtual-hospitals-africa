import { Context } from 'fresh'
import Home from '../components/landing-page/home.tsx'
import { AlertListener } from '../islands/alert/AlertListener.tsx'
import DemoVideo from '../islands/DemoVideo.tsx'

// deno-lint-ignore require-await
export default async function Index(ctx: Context<unknown>) {
  return (
    <>
      <AlertListener initial_url={ctx.url} />
      <DemoVideo />
      <Home />
    </>
  )
}
