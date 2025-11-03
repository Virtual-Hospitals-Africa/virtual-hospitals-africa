import { PageProps } from 'fresh'
import ContactPage from '../components/library/ContactPage.tsx'

export default function BookIntroCallPage(
  props: PageProps,
) {
  return (
    <ContactPage
      url={props.url}
      title='Book an intro call'
      message={
        <p class='text-xl leading-8 text-gray-600'>
          <i>
            TK. Book an intro call
          </i>
        </p>
      }
    />
  )
}
