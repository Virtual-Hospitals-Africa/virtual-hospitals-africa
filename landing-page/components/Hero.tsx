import { Button } from '../../components/library/Button.tsx'
import GridPattern from '../../islands/landing-page/GridPattern.tsx'
import { Logo } from '../../components/library/Logo.tsx'
import { PlayCircleIcon } from '../../components/library/icons/heroicons/outline.tsx'
// import { StarRating } from './StarRating.tsx'

// function Testimonial() {
//   return (
//     <figure className='relative mx-auto max-w-md text-center lg:mx-0 lg:text-left'>
//       <div className='flex justify-center text-blue-600 lg:justify-start'>
//         <StarRating />
//       </div>
//       <blockquote className='mt-2'>
//         <p className='font-display text-xl font-medium text-slate-900'>
//           “This method of designing icons is genius. I wish I had known this
//           method a lot sooner.”
//         </p>
//       </blockquote>
//       <figcaption className='mt-2 text-sm text-slate-500'>
//         <strong className="font-semibold text-blue-600 before:content-['—_']">
//           Stacey Solomon
//         </strong>
//         , Founder at Retail Park
//       </figcaption>
//     </figure>
//   )
// }

export function Hero() {
  return (
    <header className='overflow-hidden bg-slate-100 lg:bg-transparent lg:px-5'>
      <Button
        href='/login'
        color='blue'
        className='absolute right-3 top-3 z-10'
      >
        Sign In
      </Button>
      <div className='mx-auto grid max-w-6xl grid-cols-1 grid-rows-[auto_1fr] gap-y-16 pt-16 md:pt-20 lg:grid-cols-12 lg:gap-y-20 lg:px-3 lg:pb-36 lg:pt-20 xl:py-32'>
        <div className='relative px-4 sm:px-6 lg:col-span-7 lg:pb-14 lg:pl-16 lg:pr-0 xl:pl-20'>
          <div className='hidden lg:absolute lg:-top-32 lg:bottom-0 lg:left-[-100vw] lg:right-[-100vw] lg:block lg:bg-slate-100' />
          {/* <Testimonial /> */}
        </div>
        <div className='relative flex items-end lg:col-span-5 lg:row-span-2'>
          <div className='absolute -bottom-12 -top-20 left-0 right-1/2 z-10 rounded-br-6xl bg-foo-900 text-white/10 md:bottom-8 lg:-inset-y-32 lg:left-[-100vw] lg:right-full lg:-mr-40'>
            <GridPattern
              x='100%'
              y='100%'
              patternTransform='translate(112 64)'
            />
            <div className='absolute grid place-items-center w-full h-full pl-80'>
              <div className='flex w-full h-full items-center justify-end'>
                <div className='lg:ml-auto lg:mr-60 md:mx-auto px-4 sm:px-6 md:max-w-2xl md:px-4 lg:px-0'>
                  <h1 className='flex gap-10 items-center font-display text-5xl font-extrabold text-white sm:text-6xl'>
                    <Logo height='130' />
                    Virtual<br />Hospitals<br /> Africa
                  </h1>
                  <p className='mt-8 text-3xl text-white max-w-md'>
                    Bringing accessible health care to Africans
                  </p>
                  <div className='mt-8 flex gap-4'>
                    <Button href='#free-chapters' color='blue'>
                      Watch the demo
                    </Button>
                    <Button href='#pricing' variant='solid' color='white'>
                      Join the waitlist
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='relative z-10 mx-auto flex w-64 rounded-xl bg-slate-600 shadow-xl md:w-80 lg:w-auto'>
            <img
              className='w-full'
              src='images/doctor_using_app.jpg'
              alt=''
              /* priority */
            />
            {/* place in the center */}
            <button className='absolute '>
              <svg
                width='121'
                height='120'
                viewBox='0 0 121 120'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  fill-rule='evenodd'
                  clip-rule='evenodd'
                  d='M60.71 108C73.4404 108 85.6493 102.943 94.6511 93.9411C103.653 84.9394 108.71 72.7304 108.71 60C108.71 47.2696 103.653 35.0606 94.6511 26.0589C85.6493 17.0571 73.4404 12 60.71 12C47.9796 12 35.7706 17.0571 26.7688 26.0589C17.7671 35.0606 12.71 47.2696 12.71 60C12.71 72.7304 17.7671 84.9394 26.7688 93.9411C35.7706 102.943 47.9796 108 60.71 108ZM58.04 43.008C57.1364 42.4051 56.086 42.0589 55.0011 42.0062C53.9161 41.9535 52.8371 42.1963 51.8794 42.7088C50.9216 43.2212 50.1209 43.9841 49.5627 44.9159C49.0045 45.8478 48.7098 46.9137 48.71 48V72C48.7098 73.0863 49.0045 74.1522 49.5627 75.0841C50.1209 76.0159 50.9216 76.7788 51.8794 77.2912C52.8371 77.8037 53.9161 78.0465 55.0011 77.9938C56.086 77.9411 57.1364 77.5949 58.04 76.992L76.04 64.992C76.8617 64.4441 77.5355 63.7017 78.0015 62.8309C78.4675 61.9601 78.7113 60.9877 78.7113 60C78.7113 59.0123 78.4675 58.0399 78.0015 57.1691C77.5355 56.2983 76.8617 55.5559 76.04 55.008L58.04 43.008Z'
                  fill='#2563EB'
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
