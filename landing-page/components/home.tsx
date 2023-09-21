import { Partners } from './Partners.tsx'
import { Footer } from './Footer.tsx'
import { FreeChapters } from './FreeChapters.tsx'
import { Hero } from './Hero.tsx'
import { Introduction } from './Introduction.tsx'
import NavBar from '../../islands/landing-page/NavBar.tsx'
import { Research } from './Research.tsx'
import { Patients } from './Patients.tsx'
import { HealthWorkers } from './HealthWorkers.tsx'
import { TeamSection } from './Team.tsx'
import { Testimonial } from './Testimonial.tsx'
import { Testimonials } from './Testimonials.tsx'

export default function Home() {
  return (
    <>
      <Hero />
      <Introduction />
      <NavBar />
      <HealthWorkers />
      <Testimonial
        id='testimonial-from-tommy-stroman'
        author={{
          name: 'Tommy Stroman',
          role: 'Front-end developer',
          image: '/images/avatars/avatar-1.png',
        }}
      >
        <p>
          “Equipping health facilities with Virtual Hospitals Africa will be a
          game changer in how care is provided in Southern Africa and beyond”
        </p>
      </Testimonial>
      <Patients />
      <Testimonial
        id='testimonial-from-gerardo-stark'
        author={{
          name: 'Gerardo Stark',
          role: 'Patient',
          image: '/images/avatars/avatar-2.png',
        }}
      >
        <p>
          “The nearest hospital is a 25 mile walk away, so often I just wouldn’t
          go even if I was sick. I feel so much better knowing I can get my
          questions answered and medications sent out from home.”
        </p>
      </Testimonial>
      <Research />
      <FreeChapters />
      <Testimonials />
      <Partners />
      <TeamSection />
      <Footer />
    </>
  )
}
