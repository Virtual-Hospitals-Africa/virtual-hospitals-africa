import { Button } from '../library/Button.tsx'
import DemoVideoContainer from '../../components/landing-page/DemoVideoContainer.tsx'
import { LogoWithFullText } from '../library/Logo.tsx'
import RadialPattern from './RadialPattern.tsx'

export default function HeroContents() {
  return (
    <div className='relative flex items-end lg:col-span-5 lg:row-span-2'>
      <div className='lg:absolute w-full lg:w-auto md:-top-20 md:left-0 md:right-0 z-9 lg:p-0 md:p-14 py-8 lg:rounded-br-6xl bg-[#312E81] text-white md:bottom-8 lg:-inset-y-32 lg:left-[-100vw] lg:right-full lg:-mr-40'>
        <RadialPattern />
        <div className='lg:absolute w-full h-full lg:pl-80 lg:grid lg:place-items-center'>
          <div className='flex flex-col-reverse md:flex-row w-full h-full md:items-center items-start justify-start lg:justify-end'>
            <div className='ml-2 lg:ml-auto lg:mr-60 px-4 sm:px-6 md:max-w-2xl md:px-4 lg:px-0'>
              <h1 className='hidden gap-10 items-center font-display text-5xl font-extrabold text-white sm:text-6xl md:flex'>
                <LogoWithFullText variant='white' />
              </h1>
              <p className='md:mt-8 text-3xl text-white lg:pr-16 max-w-xs md:max-w-md'>
                Bringing accessible health care to Africans
              </p>
              <div className='mt-4 flex gap-4'>
                <Button href='#demo' color='blue'>
                  Learn more
                </Button>

                <Button
                  href='/waitlist?entrypoint=hero'
                  color='white'
                >
                  Join the waitlist
                </Button>
              </div>
            </div>
            <DemoVideoContainer className='flex lg:hidden mb-6 lg:mb-auto mt-24 lg:mt-auto' />
          </div>
        </div>
      </div>
      <DemoVideoContainer className='hidden lg:flex' />
    </div>
  )
}
