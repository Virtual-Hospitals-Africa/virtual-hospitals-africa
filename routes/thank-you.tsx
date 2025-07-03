import { PageProps } from '$fresh/server.ts'
import Layout from '../components/library/Layout.tsx'

export default function ThankYouPage(props: PageProps) {
  return (
    <Layout title='Virtual Hospitals Africa' url={props.url} variant='empty'>
      <div />
    </Layout>
  )
}
