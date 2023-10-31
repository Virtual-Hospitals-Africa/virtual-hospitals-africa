import { Button } from '../../components/library/Button.tsx'
import { LogoWithFullText } from '../../components/library/Logo.tsx'
import HeroContents from './HeroContents.tsx'

export function Hero() {
  return (
    <header className='overflow-hidden bg-slate-100 lg:bg-transparent'>
      <div className='absolute top-2 w-full z-10'>
        <div className='flex justify-between items-center w-full' // style={{ gridTemplateColumns: '1fr max-content' }}
        >
          <div className='md:hidden'>
            <LogoWithFullText
              variant='white'
              className='h-24 pt-2 pl-5 pr-4'
            />
          </div>

          <div className='grid place-items-center md:self-end grow p-2 pr-6'>
            <Button
              href='/login'
              color='blue'
              className='md:absolute md:top-3 md:right-3'
            >
              Sign&#160;In
            </Button>
          </div>
        </div>
      </div>

      <div className='mx-auto grid max-w-6xl grid-cols-1 lg:grid-rows-[auto_1fr] lg:pt-20 lg:grid-cols-12 lg:gap-y-20 lg:px-3 lg:pb-36 lg:pt-20 xl:py-32'>
        <div className='relative px-4 sm:px-6 lg:col-span-7 lg:pb-14 lg:pl-16 lg:pr-0 xl:pl-20'>
          <div className='hidden lg:absolute lg:-top-32 lg:bottom-0 lg:left-[-100vw] lg:right-[-100vw] lg:block lg:bg-slate-100' />
        </div>
        <HeroContents />
      </div>
    </header>
  )
}
