import { SectionHeading } from './SectionHeading.tsx'
import { UserCircleIcon } from '../../components/library/icons/heroicons/outline.tsx'
import { Container } from '../../components/library/Container.tsx'
import ArrowLink from './ArrowLink.tsx'

export default function PartnersContent() {
  return (
    <div className='bg-white py-4 sm:py-6'>
      <div className='mx-auto max-w-7xl'>
        <div className='grid grid-cols-1 items-center gap-x-8 gap-y-16 lg:grid-cols-2'>
          <div className='mx-auto w-full max-w-xl lg:mx-0'>
            <h2 className='text-3xl font-bold tracking-tight text-gray-900'>
              Driving innovative health care
            </h2>
            <p className='mt-6 text-lg leading-8 text-gray-600'>
              We’re interested in collaborating with funders passionate about
              global health to pilot this system in 5 rural clinics in Zimbabwe
              in early 2024. Your support will enable software development,
              health worker training, internet access, point of care testing,
              implementation, other essential services and associated costs.
            </p>
            <p className='mt-6 text-lg leading-8 text-gray-600'>
              In creating this integrated platform together we can demonstrate
              how higher quality care can be delivered to patients with less
              stress at lower cost.
            </p>
            <div className='mt-8 flex items-center gap-x-6'>
              <ArrowLink
                href='/learn-more?entrypoint=partners'
                text='Learn More'
              />
            </div>
          </div>
          <div className='mx-auto grid w-full max-w-xl grid-cols-2 items-center gap-y-12 sm:gap-y-14 lg:mx-0 lg:max-w-none lg:pl-8'>
            <img
              className='max-h-12 w-full object-contain object-left'
              src='https://tailwindui.com/img/logos/tuple-logo-gray-900.svg'
              alt='Tuple'
              width={105}
              height={48}
            />
            <img
              className='max-h-12 w-full object-contain object-left'
              src='https://tailwindui.com/img/logos/reform-logo-gray-900.svg'
              alt='Reform'
              width={104}
              height={48}
            />
            <img
              className='max-h-12 w-full object-contain object-left'
              src='https://tailwindui.com/img/logos/savvycal-logo-gray-900.svg'
              alt='SavvyCal'
              width={140}
              height={48}
            />
            <img
              className='max-h-12 w-full object-contain object-left'
              src='https://tailwindui.com/img/logos/laravel-logo-gray-900.svg'
              alt='Laravel'
              width={136}
              height={48}
            />
            <img
              className='max-h-12 w-full object-contain object-left'
              src='https://tailwindui.com/img/logos/transistor-logo-gray-900.svg'
              alt='Transistor'
              width={158}
              height={48}
            />
            <img
              className='max-h-12 w-full object-contain object-left'
              src='https://tailwindui.com/img/logos/statamic-logo-gray-900.svg'
              alt='Statamic'
              width={147}
              height={48}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export function Partners() {
  return (
    <section
      id='partners'
      aria-labelledby='partners-title'
      className='scroll-mt-14 py-16 sm:scroll-mt-32 sm:py-20 lg:py-32'
    >
      <Container>
        <SectionHeading id='author-title' icon={<UserCircleIcon />}>
          Partners
        </SectionHeading>
        <PartnersContent />
      </Container>
    </section>
  )
}
