import { SectionHeading } from './SectionHeading.tsx'
import { GlobeEuropeAfricaIcon } from '../../components/library/icons/heroicons/outline.tsx'
import { Container } from '../../components/library/Container.tsx'
import ArrowLink from './ArrowLink.tsx'
import { MHILink } from '../../islands/landing-page/MHIDotsLogo.tsx'
import { Button } from '../../components/library/Button.tsx'
import USFLogo from './partner-logos/usf.tsx'
import VCULogo from './partner-logos/vcu.tsx'

export default function PartnersContent() {
  return (
    <div className='py-4 sm:py-6'>
      <div className='mx-auto max-w-7xl'>
        <div className='grid grid-cols-1 items-center gap-x-8 gap-y-16 lg:grid-cols-2'>
          <div className='mx-auto w-full max-w-xl lg:mx-0'>
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
            {
              /* <div className='mt-8 flex items-center gap-x-6'>
              <ArrowLink
                href='/learn-more?entrypoint=partners'
                text='Learn More'
              />
            </div> */
            }
          </div>
          <div className='mx-auto grid w-full max-w-xl grid-cols-2 items-center gap-y-12 sm:gap-y-14 lg:mx-0 lg:max-w-none lg:pl-8'>
            {/* <span className='m-8'> */}
            <MHILink />
            {/* </span> */}
            <img
              className='max-h-16 w-full object-contain object-left'
              src='/images/logos/hgat.png'
              alt='Health Gateway Africa Trust'
              width={304}
              // height={48}
            />
            {/* <span className='m-8'> */}
            <span className='pr-2'>
              <USFLogo />
            </span>
            {/* </span> */}
            {/* <span className='m-8'> */}
            <VCULogo />
            {/* </span> */}
            {/* <span className='m-8'> */}
            <img
              className='max-h-12 w-full object-contain object-left'
              src='/images/logos/bristol.webp'
              alt='University of Bristol'
              width={140}
              height={48}
            />
            {/* </span> */}
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
      // style={{
      //   background:
      //     'radial-gradient(circle at 100% 0%, rgba(255, 234, 202, 0.2) 0%, rgba(255, 255, 255, 0) 100%)',
      // }}
      style={{
        background:
          'linear-gradient(to bottom, #4F46E5 0%, white 40%, white 100%)',
      }}
    >
      <Container>
        <SectionHeading id='author-title' icon={<GlobeEuropeAfricaIcon />}>
          Partners
        </SectionHeading>
        <PartnersContent />
      </Container>
    </section>
  )
}
