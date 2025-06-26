import { PageProps } from '$fresh/server.ts'
import ContactPage from '../components/library/ContactPage.tsx'

export default function BookDemoPage(
  props: PageProps,
) {
  return (
    <ContactPage
      url={props.url}
      title='Contact Us'
      message={
        <p class='text-xl leading-8 text-gray-600'>
          <i>
            TK. Contact Us
          </i>
        </p>
      }
    />
  )
}
