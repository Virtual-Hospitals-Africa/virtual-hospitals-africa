import { Container } from '../../components/library/Container.tsx'

export function FeatureGrid({ features }: {
  features: {
    title: string
    description: string
    image: string
  }[]
}) {
  return (
    <Container size='lg' className='mt-4 md:mt-16'>
      <ol
        role='list'
        className='grid grid-cols-1 gap-x-8 gap-y-10 [counter-reset:feature] sm:grid-cols-2 lg:grid-cols-4'
      >
        {features.map((feature) => (
          <li key={feature.title} className='[counter-increment:feature]'>
            <div
              className='relative flex h-48 items-center justify-center rounded-2xl px-6 shadow-lg'
              style={{
                backgroundImage: `url(${feature.image})`,
                backgroundSize: 'cover',
                // 'conic-gradient(from -49.8deg at 50% 50%, #7331FF 0deg, #00A3FF 59.07deg, #4E51FF 185.61deg, #39DBFF 284.23deg, #B84FF1 329.41deg, #7331FF 360deg)',
              }}
            >
            </div>
            <h3 className='mt-8 text-base font-medium tracking-tight text-slate-900 before:mb-2 before:block before:font-mono before:text-sm before:text-slate-500 before:content-[counter(feature,decimal-leading-zero)]'>
              {feature.title}
            </h3>
            <p className='mt-2 text-sm text-slate-600'>{feature.description}</p>
          </li>
        ))}
      </ol>
    </Container>
  )
}
