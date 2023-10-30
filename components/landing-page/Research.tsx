import { Container } from '../../components/library/Container.tsx'
import { PresentationChartBarIcon } from '../../components/library/icons/heroicons/outline.tsx'
import ArrowLink from './ArrowLink.tsx'
import { FeatureGrid } from './FeatureGrid.tsx'
import { SectionHeading } from './SectionHeading.tsx'

const features = [
  {
    title: 'Clean Data',
    description:
      'Fully paperless and designed from the ground up to keep patient data in sync across the whole platform',
    image: '',
  },
  {
    title: 'Large Population',
    description:
      'Our cloud-native system can scale to thousands of facilities serving millions of patients',
    image: '',
  },
  {
    title: 'Real-time Dashboards',
    description:
      'Get visibility into health trends with customizable time series graphs',
    image: '',
  },
  {
    title: 'AI Decision Support',
    description:
      'Proprietary models based on latest medical data can support making diagnoses, prescribing medications, and managing patients',
    image: '',
  },
]

export function Research() {
  return (
    <section
      id='research'
      aria-labelledby='research-title'
      className='scroll-mt-14 py-16 sm:scroll-mt-32 sm:py-20 lg:py-32'
    >
      <Container>
        <SectionHeading id='research-title' icon={<PresentationChartBarIcon />}>
          Research
        </SectionHeading>
        <p className='mt-8 font-display text-4xl font-bold tracking-tight text-slate-900'>
          Improve health outcomes for millions
        </p>
        <p className='mt-4 text-lg tracking-tight text-slate-700'>
          Monitor and evaluate at a country-wide level, with secure medical data
          sourced directly from patients
        </p>
        {
          /* <p className='mt-4'>
          <ArrowLink
            href='/learn-more?entrypoint=research'
            text='Learn more about how your institution can get involved'
          />
        </p> */
        }
      </Container>
      <Container size='lg' className='mt-16'>
        <ol
          role='list'
          className='-mx-3 grid grid-cols-1 gap-y-10 lg:grid-cols-3 lg:text-center xl:-mx-12 xl:divide-x xl:divide-slate-400/20'
        >
          <FeatureGrid features={features} />
        </ol>
      </Container>
    </section>
  )
}
