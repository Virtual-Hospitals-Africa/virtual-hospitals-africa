import { Container } from '../../components/library/Container.tsx'
import { PresentationChartBarIcon } from '../../components/library/icons/heroicons/outline.tsx'
import { SectionHeading } from './SectionHeading.tsx'

const features = [
  {
    title: 'Clean Data',
    description:
      'Fully paperless and designed from the ground up to keep patient data in sync across the whole platform',
    image: function FigmaImage() {
      return (
        <div className='absolute inset-0 flex items-center justify-center bg-[radial-gradient(#2C313D_35%,#000)]'>
          <img src='/images/resources/figma.svg' alt='' /* unoptimized */ />
        </div>
      )
    },
  },
  {
    title: 'Large Population',
    description:
      'Our cloud-native system can scale to thousands of facilities serving millions of patients',
    image: function VideoPlayerImage() {
      return (
        <div className='absolute inset-0 flex items-center justify-center'>
          <img
            className='absolute inset-0 h-full w-full object-cover'
            src='/images/resources/abstract-background.png'
            alt=''
            sizes='(min-width: 1280px) 21rem, (min-width: 1024px) 33vw, (min-width: 768px) 19rem, (min-width: 640px) 50vw, 100vw'
          />
          <img
            className='relative'
            src='/images/resources/video-player.svg'
            alt=''
            /* unoptimized */
          />
        </div>
      )
    },
  },
  {
    title: 'Real-time Dashboards',
    description:
      'Get visibility into health trends with customizable time series graphs',
    image: function DiscordImage() {
      return (
        <div className='absolute inset-0 flex items-center justify-center bg-[#6366F1]'>
          <img src='/images/resources/discord.svg' alt='' /* unoptimized */ />
        </div>
      )
    },
  },
  {
    title: 'AI Decision Support',
    description:
      'Proprietary models based on latest medical data can support making diagnoses, prescribing medications, and managing patients',
    image: function DiscordImage() {
      return (
        <div className='absolute inset-0 flex items-center justify-center bg-[#6366F1]'>
          <img src='/images/resources/discord.svg' alt='' /* unoptimized */ />
        </div>
      )
    },
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
        <p className='mt-4'>
          <a
            href='#learn-more'
            className='text-base font-bold text-blue-600 hover:text-blue-800'
          >
            Learn more about how your institution can get involved{' '}
            <span aria-hidden='true'>&rarr;</span>
          </a>
        </p>
      </Container>
      <Container size='lg' className='mt-16'>
        <ol
          role='list'
          className='-mx-3 grid grid-cols-1 gap-y-10 lg:grid-cols-3 lg:text-center xl:-mx-12 xl:divide-x xl:divide-slate-400/20'
        >
          {features.map((resource) => (
            <li
              key={resource.title}
              className='grid auto-rows-min grid-cols-1 items-center gap-8 px-3 sm:grid-cols-2 sm:gap-y-10 lg:grid-cols-1 xl:px-12'
            >
              <div className='relative h-48 overflow-hidden rounded-2xl shadow-lg sm:h-60 lg:h-40'>
                <resource.image />
              </div>
              <div>
                <h3 className='text-base font-medium tracking-tight text-slate-900'>
                  {resource.title}
                </h3>
                <p className='mt-2 text-sm text-slate-600'>
                  {resource.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
