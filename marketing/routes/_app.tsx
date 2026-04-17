import { PageProps } from 'fresh'

export default function App({ Component }: PageProps) {
  return (
    <html className='antialiased bg-white scroll-smooth' lang='en'>
      <head>
        <meta charset='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        <title>Virtual Hospitals Africa</title>
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link
          rel='preconnect'
          href='https://fonts.gstatic.com'
          crossOrigin='anonymous'
        />
        <link rel='stylesheet' href='/styles.css' />
        <link
          rel='stylesheet'
          href='https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Ubuntu:wght@300;400;500;600;700;800&family=Roboto&display=swap'
          media='print'
          // @ts-ignore - onload is valid on link elements
          onload="this.media='all'"
        />
        <meta
          name='description'
          content='Bringing accessible health care to Africans'
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
        <meta property='og:image:type' content='image/png' />
        <meta property='og:image:width' content='256' />
        <meta property='og:image:height' content='256' />
        <meta property='og:site_name' content='Virtual Hospitals Africa' />
        <meta property='og:url' content='https://virtualhospitalsafrica.org' />
      </head>
      <body className='relative flex flex-col justify-between min-h-screen'>
        <Component />
      </body>
    </html>
  )
}
