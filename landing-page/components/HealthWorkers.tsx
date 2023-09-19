import { Container } from '../../components/library/Container.tsx'
import { IdentificationIcon } from '../../components/library/icons/heroicons.tsx'
// import { Expandable } from './Expandable.tsx'
import { SectionHeading } from './SectionHeading.tsx'

export function HealthWorkers() {
  return (
    <section
      id='health-workers'
      aria-labelledby='health-workers-title'
      className='scroll-mt-14 py-16 sm:scroll-mt-32 sm:py-20 lg:py-32'
    >
      <Container>
        <SectionHeading
          icon={<IdentificationIcon />}
          id='health-workers-title'
        >
          Health Workers
        </SectionHeading>
        <p className='mt-8 font-display text-4xl font-bold tracking-tight text-slate-900'>
          Focus on care, get help with everything else
        </p>
        <p className='mt-4 text-lg tracking-tight text-slate-700'>
          Local doctors and health administrators can easily set up their own
          virtual hospitals, granting them a shared digital space to monitor,
          communicate with, and improve outcomes for patients.
        </p>
        <p className='mt-10'>
          <a
            href='#free-chapters'
            className='text-base font-bold text-blue-600 hover:text-blue-800'
          >
            See how seamless digital systems can help your facility{' '}
            <span aria-hidden='true'>&rarr;</span>
          </a>
        </p>
      </Container>
    </section>
  )
}
