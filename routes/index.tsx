import { PageProps } from '$fresh/server.ts'
import Layout from '../components/library/Layout.tsx'
import Home from '../landing-page/components/home.tsx'

export default function Index(props: PageProps) {
  return (
    <Layout
      {...props}
      variant='landing-page'
      title='Virtual Hospitals Africa'
      head={
        <>
          <meta
            name='description'
            content='A telemedicine platform for African health workers providing accessible care'
          />
          <link rel='preconnect' href='https://fonts.googleapis.com' />
          <link
            rel='preconnect'
            href='https://fonts.gstatic.com'
            crossOrigin='anonymous'
          />
          <link
            rel='preconnect'
            href='https://cdn.fontshare.com'
            crossOrigin='anonymous'
          />
          <link
            rel='stylesheet'
            href='https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap'
          />
          <link
            rel='stylesheet'
            href='https://fonts.googleapis.com/css2?family=Roboto'
          />
          <link
            rel='stylesheet'
            href='/mhi.css'
          />
          <link
            rel='stylesheet'
            href='https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@800,500,700&display=swap'
          />
        </>
      }
    >
      <Home />
    </Layout>
  )
}
