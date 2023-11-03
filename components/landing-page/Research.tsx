import { Container } from '../../components/library/Container.tsx'
import { PresentationChartBarIcon } from '../../components/library/icons/heroicons/outline.tsx'
import ArrowLink from './ArrowLink.tsx'
import { FeatureGrid } from './FeatureGrid.tsx'
import SectionHeading from './SectionHeading.tsx'

const features = [
  {
    title: 'Clean Data',
    description:
      'Fully paperless and designed from the ground up to keep patient data in sync across the whole platform',
    image: '/images/demos/cloud.png',
  },
  {
    title: 'Large Population',
    description:
      'Our cloud-native system can scale to thousands of facilities serving millions of patients',
    image: '/images/demos/large_population.png',
  },
  {
    title: 'Real-time Dashboards',
    description:
      'Get visibility into health trends with customizable time series graphs',
    image: '/images/demos/dashboards.png',
  },
  {
    title: 'AI Decision Support',
    description:
      'Proprietary models based on latest medical data can support making diagnoses, prescribing medications, and managing patients',
    image: '/images/demos/ai_decision_support.png',
  },
]

export function Research() {
  return (
    <section
      id='research'
      aria-labelledby='research-title'
      className='scroll-mt-14 py-16 sm:scroll-mt-32 sm:py-20 lg:py-32'
      style={{
        background:
          'linear-gradient(to bottom, white 0%, white 50%, rgba(79, 70, 229, 0.47) 100%)',
      }}
    >
      <Container>
        <SectionHeading name='research' />
        <p className='mt-8 font-display text-4xl font-bold tracking-tight text-slate-900'>
          Improve health outcomes for millions
        </p>
        <p className='mt-4 text-lg tracking-tight text-slate-700'>
          Our goal is to enable monitoring and evaluation at a country-wide
          level, with secure medical data sourced directly from patients.
        </p>
        <p className='mt-4'>
          <ArrowLink
            href='/meet-us?entrypoint=research'
            text='Reach out to see how your institution can get involved'
          />
        </p>
      </Container>
      <FeatureGrid features={features} />
    </section>
  )
}
