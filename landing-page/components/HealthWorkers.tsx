import { Container } from '../../components/library/Container.tsx'
import { IdentificationIcon } from '../../components/library/icons/heroicons/outline.tsx'
import ArrowLink from './ArrowLink.tsx'
import { FeatureGrid } from './FeatureGrid.tsx'
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
          <ArrowLink
            href='/learn-more?entrypoint=health-workers'
            text='See how seamless digital systems can help your facility'
          />
        </p>
      </Container>
      <FeatureGrid
        features={[
          {
            title: 'Crystal Clear Medical Records',
            description:
              'Find and evaluate patient medical records quickly and easily.',
            image: '/images/screencasts/setup.svg',
          },
          {
            title: 'One Click Prescriptions',
            description:
              'Upon making a diagnosis, health workers can send prescriptions to local pharmacies with a single click.',
            image: '/images/screencasts/grids.svg',
          },
          {
            title: 'Painless Follow Up',
            description:
              'When needed, create follow up appointments with other doctors or specialists even those at other facilities.',
            image: '/images/screencasts/strokes.svg',
          },
          {
            title: 'Built-in Metrics',
            description:
              'Clinic and hospital leaders can view aggregates at a facility and country wide level to monitor and evaluate how they can improve patient outcomes.',
            image: '/images/screencasts/duotone.svg',
          },
        ]}
      />
    </section>
  )
}
