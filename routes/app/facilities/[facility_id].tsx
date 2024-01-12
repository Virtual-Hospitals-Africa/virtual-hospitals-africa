import Layout from '../../../components/library/Layout.tsx'
import { Container } from '../../../components/library/Container.tsx'
import { FacilityContext } from './[facility_id]/_middleware.ts'

// deno-lint-ignore require-await
export default async function FacilityPage(
  req: Request,
  ctx: FacilityContext,
) {
  const { facility } = ctx.state

  return (
    <Layout
      title={facility.name}
      route={ctx.route}
      url={ctx.url}
      avatarUrl={ctx.state.healthWorker.avatar_url}
      variant='home page'
    >
      <Container size='lg'>
        TODO: facility page
      </Container>
    </Layout>
  )
}
