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
          name: 'Dr. Buhlebenkosi Ndlovu',
          role: 'Medical Doctor',
          image: '/images/avatars/avatar-1.png',
        }}
      >
        <p>
          “Virtual hospitals can help ensure that everyone has access to the
          healthcare they need. I am excited about the personalized care options
          that virtual hospitals can offer my patients making much easier and
          more convenient.”
        </p>
      </Testimonial>
      <Patients />
      <Testimonial
        id='testimonial-from-gerardo-stark'
        author={{
          name: 'Sekuru Dube, 75',
          role: 'Patient',
          image: '/images/avatars/avatar-2.png',
        }}
      >
        <p>
          “I look forward to being able to communicate with all my care
          providers easily and efficiently, and to receive clear and concise
          information about my next steps and how to lead a healthy life.”
        </p>
      </Testimonial>
      <Research />
      <FreeChapters />
      <Partners />
      <TeamSection />
      <Footer />
    </>
  )
}
