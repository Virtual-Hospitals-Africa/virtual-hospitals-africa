// import { CheckIcon } from '../../components/library/CheckIcon.tsx'
import { Container } from '../../components/library/Container.tsx'
import { CheckIcon } from '../library/icons/heroicons/mini.tsx'
import ArrowLink from './ArrowLink.tsx'

export function Introduction() {
  return (
    <section
      id='introduction'
      aria-label='Introduction'
      className='py-10 md:pb-20 md:pt-36 lg:py-32'
    >
      <Container className='md:text-lg text-md tracking-tight text-slate-700'>
        <p className='font-display text-4xl font-bold tracking-tight text-slate-900'>
          Local care backed by a worldwide network
        </p>
        <p className='mt-4'>
          Health workers in Africa are overwhelmed. Those living in far away
          villages forego care until their diseases are too far along. But what
          if patients and the facilities serving them could leverage a network
          of virtual hospitals with medical professionals all over the globe?
        </p>
        <p className='mt-4'>
          Our proof of concept telehealth solution supports:
        </p>
        <ul role='list' className='mt-4 space-y-3'>
          {[
            'chat, video, and in-person consultations',
            'advanced point-of-care testing and diagnosis',
            'automated prescription filling',
            'notifications for medications, test results, and general tips',
            'personalized plans with a clear path to better health',
          ].map((feature) => (
            <li key={feature} className='flex items-center'>
              <CheckIcon className='h-5 w-5 flex-none fill-blue-500' />
              <span className='ml-4'>{feature}</span>
            </li>
          ))}
          {
            /* <ArrowLink
            href='/learn-more?entrypoint=introduction'
            text='Learn more about the solution'
            className='mt-6'
          /> */
          }
        </ul>
      </Container>
    </section>
  )
}
