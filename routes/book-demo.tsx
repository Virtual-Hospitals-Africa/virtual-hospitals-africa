import { PageProps } from '$fresh/server.ts'
import ContactPage from '../components/library/ContactPage.tsx'

export default function BookDemoPage(
  props: PageProps,
) {
  return (
    <ContactPage
      url={props.url}
      title='Book a demo'
      message={
        <p class='text-xl leading-8 text-gray-600'>
          <i>
            TK. Book a demo
          </i>
        </p>
      }
    />
  )
}
