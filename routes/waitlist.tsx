import { PageProps } from 'fresh'
import ContactPage from '../components/library/ContactPage.tsx'

export default function WaitlistPage(
  props: PageProps,
) {
  return (
    <ContactPage
      url={props.url}
      title='Join Waitlist'
      message={
        <p class='text-xl leading-8 text-gray-600'>
          <i>
            Stay in the loop about Virtual Hospitals Africa's progress. We'll
            let you know when it's time to sign up!
          </i>
        </p>
      }
    />
  )
}
