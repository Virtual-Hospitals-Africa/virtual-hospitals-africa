import { PageProps } from '$fresh/server.ts'
import ContactPage from '../components/library/ContactPage.tsx'

export default function RequestInvestorDeckPage(
  props: PageProps,
) {
  return (
    <ContactPage
      url={props.url}
      title='Request investor deck'
      message={
        <p class='text-xl leading-8 text-gray-600'>
          <i>
            TK. Request investor deck
          </i>
        </p>
      }
    />
  )
}
