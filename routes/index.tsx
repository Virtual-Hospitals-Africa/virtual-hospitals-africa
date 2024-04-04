import { PageProps } from '$fresh/server.ts'
import Layout from '../components/library/Layout.tsx'
import Home from '../components/landing-page/home.tsx'
import DemoVideo from '../islands/DemoVideo.tsx'

export default function Index(props: PageProps) {
  return (
    <Layout
      {...props}
      variant='landing page'
      title='Virtual Hospitals Africa'
    >
      <DemoVideo />
      <Home />
    </Layout>
  )
}
