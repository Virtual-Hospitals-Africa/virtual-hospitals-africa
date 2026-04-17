import { PageProps } from 'fresh'

const DESCRIPTION =
  'Virtual Hospitals Africa is a non-profit addressing a critical healthcare gap in rural Africa, where diagnoses are delayed by infrequent doctor visits and costly travel.'

const OG_IMAGE = 'https://virtualhospitalsafrica.org/_assets/v11/d186af6af95c58d82fc06a2ab553f521c6ed82e6.png'

export default function App({ Component }: PageProps) {
  return (
    <html className='antialiased bg-white scroll-smooth' lang='en'>
      <head>
        <meta charset='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        <meta name='color-scheme' content='light dark' />
        <title>Virtual Hospitals Africa</title>
        <link rel='icon' href='/_assets/v11/615f938c5fe81a0f3d521410bc768edcdf5b7dbf.png' />
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />
        <link rel='stylesheet' href='/styles.css' />
        <link
          rel='stylesheet'
          href='https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Ubuntu:wght@300;400;500;600;700;800&family=Roboto&display=swap'
          media='print'
          // @ts-ignore - onload is valid on link elements
          onload="this.media='all'"
        />
        <meta name='description' content={DESCRIPTION} />
        <meta name='title' content='Virtual Hospitals Africa' />
        <meta name='robots' content='index,follow' />
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:url' content='https://www.virtualhospitalsafrica.org/' />
        <meta name='twitter:title' content='Virtual Hospitals Africa' />
        <meta name='twitter:description' content={DESCRIPTION} />
        <meta name='twitter:image' content={OG_IMAGE} />
        <meta name='twitter:image:alt' content='Virtual Hospitals Africa' />
        <meta property='og:title' content='Virtual Hospitals Africa' />
        <meta property='og:description' content={DESCRIPTION} />
        <meta property='og:type' content='website' />
        <meta property='og:url' content='https://www.virtualhospitalsafrica.org/' />
        <meta property='og:image' content={OG_IMAGE} />
        <meta property='og:image:alt' content='Virtual Hospitals Africa' />
        <meta property='og:site_name' content='Virtual Hospitals Africa' />
      </head>
      <body className='relative flex flex-col justify-between min-h-screen'>
        <Component />
      </body>
    </html>
  )
}
