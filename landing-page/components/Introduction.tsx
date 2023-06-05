import { CheckIcon } from './CheckIcon.tsx'
import { Container } from './Container.tsx'

/*

          We’re partnering with universities to begin clinical trials in
          November 2023.
        </p>
        <p className='mt-4'>
          We’re looking to partner with organizations who want to improve
          patient outcomes in Africa at scale.
        </p>
        <p className='mt-4'>
          But it turns out this isn’t how great icon designers work at all.
        </p>
        <p className='mt-4'>
          In “Everything Starts as a Square”, you’ll learn the systems experts
          use to create pixel perfect icons, without relying on a steady hand.
*/

export function Introduction() {
  return (
    <section
      id='introduction'
      aria-label='Introduction'
      className='pb-16 pt-20 sm:pb-20 md:pt-36 lg:py-32'
    >
      <Container className='text-lg tracking-tight text-slate-700'>
        <p className='font-display text-4xl font-bold tracking-tight text-slate-900'>
          Through Virtual Hospitals Africa, doctors can leverage the latest
          technological advances to provide care patients to patients before
          it's a crisis
        </p>
        <p className='mt-4'>
          Hospitals in Africa are overwhelmed. Patients living far away forego
          care until their diseases are too far along. But what if patients
          could access care at the onset of symptoms from their mobile devices?
        </p>
        <p className='mt-4'>
          In our proof of concept, patients can:
        </p>
        <ul role='list' className='mt-8 space-y-3'>
          {[
            'connect with trained health workers',
            'easily schedule in person and video appointments',
            'send prescriptions securely to local pharmacies',
            'review their health status and obtain medical records, lab results',
            'be notified of upcoming appointments and medication reminders',
          ].map((feature) => (
            <li key={feature} className='flex'>
              <CheckIcon className='h-8 w-8 flex-none fill-blue-500' />
              <span className='ml-4'>{feature}</span>
            </li>
          ))}
        </ul>
        <p className='mt-8'>
          By the end of the book, you’ll have all the confidence you need to dig
          in and start creating beautiful icons that can hold their own against
          any of the sets you can find online.
        </p>
        <p className='mt-10'>
          <a
            href='#free-chapters'
            className='text-base font-medium text-blue-600 hover:text-blue-800'
          >
            Get two free chapters straight to your inbox{' '}
            <span aria-hidden='true'>&rarr;</span>
          </a>
        </p>
      </Container>
    </section>
  )
}
