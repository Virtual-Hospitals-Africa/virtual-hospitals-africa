import Home from './home.tsx'

export default function Document() {
  return (
    <html className='scroll-smooth bg-white antialiased' lang='en'>
      <head>
        <title>
          Everything Starts as a Square - Get lost in the world of icon design
        </title>
        <meta
          name='description'
          content='A book and video course that teaches you how to design your own icons from scratch. '
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
          href='https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@800,500,700&display=swap'
        />
      </head>
      <body>
        <Home />
      </body>
    </html>
  )
}
