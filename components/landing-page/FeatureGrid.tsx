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
        className='grid gap-x-8 gap-y-10 [counter-reset:feature] sm:grid-cols-2 lg:grid-cols-4'
      >
        {features.map((feature) => (
          <li
            key={feature.title}
            className='[counter-increment:feature] flex flex-col items-center'
          >
            <img
              className='h-48 rounded-2xl shadow-lg'
              src={feature.image}
              style={{ objectFit: 'fill' }}
            >
            </img>
            <h3 className='mt-4 text-lg font-medium tracking-tight text-slate-900 before:mb-2 before:block before:font-mono before:text-sm before:text-slate-500 before:content-[counter(feature,decimal-leading-zero)]'>
              {feature.title}
            </h3>
            <p className='mt-2 text-base text-slate-600'>
              {feature.description}
            </p>
          </li>
        ))}
      </ol>
    </Container>
  )
}
