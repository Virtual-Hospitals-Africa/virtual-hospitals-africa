import { Partners } from './Partners.tsx'
import { Footer } from './Footer.tsx'
import { FreeChapters } from './FreeChapters.tsx'
import { Hero } from './Hero.tsx'
import { Introduction } from './Introduction.tsx'
import { NavBar } from './NavBar.tsx'
import { Pricing } from './Pricing.tsx'
import { Research } from './Research.tsx'
import { Screencasts } from './Screencasts.tsx'
import { TableOfContents } from './TableOfContents.tsx'
import { Testimonial } from './Testimonial.tsx'
import { Testimonials } from './Testimonials.tsx'

export default function Home() {
  return (
    <>
      <Hero />
      <Introduction />
      <NavBar />
      <TableOfContents />
      <Testimonial
        id='testimonial-from-tommy-stroman'
        author={{
          name: 'Tommy Stroman',
          role: 'Front-end developer',
          image: '/images/avatars/avatar-1.png',
        }}
      >
        <p>
          “I didn’t know a thing about icon design until I read this book. Now I
          can create any icon I need in no time. Great resource!” Wow!
        </p>
      </Testimonial>
      <Screencasts />
      <Testimonial
        id='testimonial-from-gerardo-stark'
        author={{
          name: 'Gerardo Stark',
          role: 'Creator of Pandemicons',
          image: '/images/avatars/avatar-2.png',
        }}
      >
        <p>
          “I’ve tried to create my own icons in the past but quickly got
          frustrated and gave up. Now I sell my own custom icon sets online.”
        </p>
      </Testimonial>
      <Research />
      <FreeChapters />
      <Pricing />
      <Testimonials />
      <Partners />
      <Footer />
    </>
  )
}
