import { Author } from './Author.tsx'
import { Footer } from './Footer.tsx'
import { FreeChapters } from './FreeChapters.tsx'
import { Hero } from './Hero.tsx'
import { Introduction } from './Introduction.tsx'
import { NavBar } from './NavBar.tsx'
import { Pricing } from './Pricing.tsx'
import { Resources } from './Resources.tsx'
import { Screencasts } from './Screencasts.tsx'
import { TableOfContents } from './TableOfContents.tsx'
import { Testimonial } from './Testimonial.tsx'
import { Testimonials } from './Testimonials.tsx'
// import avatarImage1 from './avatars.tsx/avatar-1.png'
// import avatarImage2 from './avatars.tsx/avatar-2.png'

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
          // image: avatarImage1,
        }}
      >
        <p>
          “I didn’t know a thing about icon design until I read this book. Now I
          can create any icon I need in no time. Great resource!”
        </p>
      </Testimonial>
      <Screencasts />
      <Testimonial
        id='testimonial-from-gerardo-stark'
        author={{
          name: 'Gerardo Stark',
          role: 'Creator of Pandemicons',
          // image: avatarImage2,
        }}
      >
        <p>
          “I’ve tried to create my own icons in the past but quickly got
          frustrated and gave up. Now I sell my own custom icon sets online.”
        </p>
      </Testimonial>
      <Resources />
      <FreeChapters />
      <Pricing />
      <Testimonials />
      <Author />
      <Footer />
    </>
  )
}
