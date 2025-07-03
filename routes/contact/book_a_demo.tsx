import { PageProps } from '$fresh/server.ts'
import ContactForm from '../../components/library/ContactForm.tsx'

export default function ContactFormPage(_props: PageProps) {
  return <ContactForm reason='book_a_demo' />
}
