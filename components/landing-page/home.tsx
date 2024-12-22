import { Partners } from './Partners.tsx'
import { FullFooter } from './Footer.tsx'
import { ScheduleADemo } from './ScheduleADemo.tsx'
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
      {/* <div id='zoop' style={{ width: 600, height: 400 }} /> */}
      <Introduction />
      <NavBar />
      <HealthWorkers />
      <Testimonial
        author={{
          name: 'Dr. Buhlebenkosi Ndlovu',
          role: 'Medical Doctor',
          image: '/images/avatars/ndlovu.png',
        }}
      >
        <p>
          “Virtual hospitals can help ensure that everyone has access to the
          healthcare they need. I am excited about the personalized care options
          that will make caring for my patients much easier and more
          convenient.”
        </p>
      </Testimonial>
      <Patients />
      <Testimonial
        author={{
          name: 'Sekuru Dube, 75',
          role: 'Patient, Midlands Province',
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
      <ScheduleADemo />
      <Partners />
      <TeamSection />
      <FullFooter />
    </>
  )
}
