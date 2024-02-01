import { PageProps } from '$fresh/server.ts'

export default function App({ Component, ...props }: PageProps) {
  return (
    <html className='scroll-smooth bg-white antialiased' lang='en'>
      <head>
        <meta charset='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        <title>Virtual Hospitals Africa</title>
        <link rel='stylesheet' href='/styles.css' />
        {props.route === '/' && (
          <>
            <meta
              name='description'
              content='Bringing accessible health care to Africans'
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
              href='https://fonts.googleapis.com/css2?family=Ubuntu:wght@100..900&display=swap'
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
            <meta property='og:type' content='website' />
            <meta property='og:title' content='Virtual Hospitals Africa' />
            <meta
              property='og:description'
              content='Bringing accessible health care to Africans'
            />
            <meta property='og:local' content='en_GB' />
            <meta
              property='og:image'
              content='https://virtualhospitalsafrica.org/images/ogimage.png'
            />

            <meta property='og:image:type' content={`image/png`} />
            <meta property='og:image:width' content='256' />
            <meta property='og:image:height' content='256' />

            <meta property='og:site_name' content='Virtual Hospitals Africa' />
            <meta
              property='og:url'
              content='https://virtualhospitalsafrica.org'
            />
            <link
              rel='apple-touch-icon'
              sizes='180x180'
              href='https://virtualhospitalsafrica.org/images/ogimage.png'
            />
          </>
        )}
        {props.route.startsWith('/app') && (
          <script src='/hijack-form-submission.js' defer />
        )}
      </head>
      <body className='min-h-screen flex flex-col relative justify-between'>
        <Component />
      </body>
    </html>
  )
}
