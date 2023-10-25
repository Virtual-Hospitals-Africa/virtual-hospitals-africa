import { PageProps } from '$fresh/server.ts'
import Layout from '../components/library/Layout.tsx'
import Features from '../landing-page/components/Features.tsx'
import { Container } from '../components/library/Container.tsx'

export default function LearnMorePage(
  props: PageProps,
) {
  return (
    <Layout
      title='Learn More | Virtual Hospitals Africa'
      route={props.route}
      url={props.url}
      variant='just-logo'
    >
      <Container>
        <Features />
      </Container>
    </Layout>
  )
}
