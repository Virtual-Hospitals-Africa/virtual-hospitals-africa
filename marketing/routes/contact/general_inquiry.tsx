import { PageProps } from 'fresh'
import SignupTemplate from '../../../components/SignupTemplate.tsx'

export default function GeneralInquiryPage({ url }: PageProps) {
  return (
    <SignupTemplate
      url={url}
      title='Contact Us | Virtual Hospitals Africa'
      h1='Get in touch'
      entrypoint='general_inquiry'
      rationale={
        <>
          We'd love to hear from you — whether you're curious about
          <ul class='text-lg list-disc list-inside'>
            <li>how the platform works or could work for you</li>
            <li>partnering with us in any capacity</li>
            <li>anything else on your mind</li>
          </ul>
        </>
      }
    />
  )
}
