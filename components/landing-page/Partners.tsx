import SectionHeading from './SectionHeading.tsx'
import { Container } from '../../components/library/Container.tsx'
import { MHILink } from '../../islands/landing-page/MHIDotsLogo.tsx'
import { Button } from '../../components/library/Button.tsx'
import USFLogo from './partner-logos/usf.tsx'
import VCULogo from './partner-logos/vcu.tsx'

export default function PartnersContent() {
  return (
    <div className='py-4 sm:py-6'>
      <div className='mx-auto max-w-7xl'>
        <div className='grid grid-cols-1 lg:items-center gap-x-8 gap-y-16 lg:grid-cols-2'>
          <div className='mx-0 w-full max-w-xl'>
            <h2 className='text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl'>
              Driving innovative<br />health care
            </h2>
            <p className='mt-6 text-lg leading-8 text-gray-600'>
              We’re interested in collaborating with funders passionate about
              global health to pilot this system in 5 rural clinics in Zimbabwe
              in early 2024. Your support will enable software development,
              health worker training, internet access, point of care testing,
              implementation, and other essential services.
            </p>
            <p className='mt-6 text-lg leading-8 text-gray-600'>
              In creating this integrated platform together we can demonstrate
              how higher quality care can be delivered to patients with less
              stress at lower cost.
            </p>
            <Button
              className='mt-4'
              variant='solid'
              color='indigo'
              href='/partner'
            >
              Join us
            </Button>
          </div>
          <div className='mx-0 grid w-full max-w-xl grid-cols-2 items-center gap-y-12 sm:gap-y-14 lg:max-w-none lg:pl-8'>
            <MHILink />
            <a href='https://healthgatewayafrica.org'>
              <img
                className='max-h-20 w-full object-contain object-left'
                src='/images/logos/hgat.png'
                alt='Health Gateway Africa Trust'
                width={304}
              />
            </a>
            <span className='pr-8'>
              <USFLogo />
            </span>
            <span className='max-h-12'>
              <VCULogo className='max-h-12' />
            </span>
            <img
              className='max-h-12 w-full object-contain object-left'
              src='/images/logos/bristol.webp'
              alt='University of Bristol'
              height={64}
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
        <SectionHeading name='partners' />
        <PartnersContent />
      </Container>
    </section>
  )
}
