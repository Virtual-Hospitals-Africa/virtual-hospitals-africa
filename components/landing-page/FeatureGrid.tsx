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
        className='grid gap-x-8 gap-y-10 grid-cols-2 lg:grid-cols-4'
      >
        {features.map((feature) => (
          <li
            key={feature.title}
            className='flex flex-col items-center'
          >
            <img
              className='h-40 w-60 rounded-2xl shadow-lg'
              src={feature.image}
            />
            <h3 className='mt-4 text-lg font-medium tracking-tight text-slate-900 before:mb-2 before:block before:font-mono before:text-sm before:text-slate-500'>
              {feature.title}
            </h3>
            <p className='mt-2 text-base text-slate-600 text-justify'>
              {feature.description}
            </p>
          </li>
        ))}
      </ol>
    </Container>
  )
}
