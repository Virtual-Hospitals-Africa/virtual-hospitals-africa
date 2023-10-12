import * as preact from 'preact'
import GridPattern from '../../islands/landing-page/GridPattern.tsx'
import { SectionHeading } from './SectionHeading.tsx'
import { UserCircleIcon } from '../../components/library/icons/heroicons/outline.tsx'
import { Container } from '../../components/library/Container.tsx'

function TwitterIcon(props: Record<string, unknown>) {
  return (
    <svg aria-hidden='true' viewBox='0 0 40 40' {...props}>
      <path d='M13.817 33.753c12.579 0 19.459-10.422 19.459-19.458 0-.297 0-.592-.02-.884a13.913 13.913 0 0 0 3.411-3.543 13.65 13.65 0 0 1-3.928 1.077 6.864 6.864 0 0 0 3.007-3.784 13.707 13.707 0 0 1-4.342 1.66 6.845 6.845 0 0 0-11.655 6.239A19.417 19.417 0 0 1 5.654 7.915a6.843 6.843 0 0 0 2.117 9.128 6.786 6.786 0 0 1-3.104-.853v.086a6.842 6.842 0 0 0 5.487 6.704 6.825 6.825 0 0 1-3.088.116 6.847 6.847 0 0 0 6.39 4.75A13.721 13.721 0 0 1 3.334 30.68a19.36 19.36 0 0 0 10.483 3.066' />
    </svg>
  )
}

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
              <a
                href='#'
                className='rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
              >
                Create account
              </a>
              <a href='#' className='text-sm font-semibold text-gray-900'>
                Contact us <span aria-hidden='true'>&rarr;</span>
              </a>
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
      {
        /* <div className='absolute inset-x-0 bottom-0 top-1/2 text-slate-900/10 [mask-image:linear-gradient(transparent,white)]'>
        <GridPattern x='50%' y='100%' />
      </div> */
      }
      <Container>
        <SectionHeading id='author-title' icon={<UserCircleIcon />}>
          Partners
        </SectionHeading>
        <PartnersContent />
      </Container>
    </section>
  )
}
