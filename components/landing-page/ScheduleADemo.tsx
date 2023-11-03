import { Button } from '../../components/library/Button.tsx'
import { Container } from '../../components/library/Container.tsx'
import { Pattern } from './Pattern.tsx'
import RadialPattern from './RadialPattern.tsx'
import WifiPattern from './WifiPattern.tsx'

export function ScheduleADemo() {
  return (
    <section
      id='schedule-a-demo'
      aria-label='Schedule a demo'
      className='scroll-mt-14 bg-blue-600 sm:scroll-mt-32 relative border-bottom border-white overflow-hidden'
    >
      <WifiPattern />
      <div className='overflow-hidden lg:relative'>
        <Container
          size='md'
          className='relative grid grid-cols-1 items-end gap-y-12 gap-x-8 py-20 lg:static lg:grid-cols-2 lg:py-28 xl:py-32 items-center'
        >
          <div className='h-full flex flex-col justify-center items-start'>
            <h2 className='font-display text-5xl font-extrabold tracking-tight text-white sm:w-3/4 sm:text-6xl md:w-2/3 lg:w-auto'>
              Schedule a demo
            </h2>
            <p className='mt-4 text-lg tracking-tight text-white'>
              Click below to set up time to chat with our team or to get more
              information about the services of Virtual Hospitals Africa.
            </p>
            <Button
              href='/schedule-demo'
              variant='solid'
              color='white'
              className='mt-4'
            >
              Meet with us
            </Button>
          </div>
          <img src='/images/schedule_demo.png'></img>
        </Container>
      </div>
    </section>
  )
}
