import { CheckIcon } from '../../components/library/CheckIcon.tsx'
import { Container } from '../../components/library/Container.tsx'
import ArrowLink from './ArrowLink.tsx'

export function Introduction() {
  return (
    <section
      id='introduction'
      aria-label='Introduction'
      className='pb-16 pt-20 sm:pb-20 md:pt-36 lg:py-32'
    >
      <Container className='text-lg tracking-tight text-slate-700'>
        <p className='font-display text-4xl font-bold tracking-tight text-slate-900'>
          Local care backed by a worldwide network
        </p>
        <p className='mt-4'>
          Health care systems in Africa are overwhelmed. Those living in far
          away villages forego care until their diseases are too far along. But
          what if patients and the facilities serving them could leverage a
          network of virtual hospitals with medical professionals all over the
          globe?
        </p>
        <p className='mt-4'>
          Our proof of concept telehealth solution supports:
        </p>
        <ul role='list' className='mt-8 space-y-3'>
          {[
            'chat, video, and in-person consultations',
            'advanced point-of-care testing and diagnosis',
            'automated prescription filling',
            'research opportunities',
            'reminders to follow health plans',
          ].map((feature) => (
            <li key={feature} className='flex'>
              <CheckIcon className='h-8 w-8 flex-none fill-blue-500' />
              <span className='ml-4'>{feature}</span>
            </li>
          ))}
        </ul>
        {
          /* <p className='mt-10'>
          <ArrowLink
            href='/learn-more?entrypoint=introduction'
            text='Learn more about the solution'
          />
        </p> */
        }
      </Container>
    </section>
  )
}
