import { PageProps } from 'fresh'
import SignupTemplate from '../../../components/SignupTemplate.tsx'

export default function BookADemoPage({ url }: PageProps) {
  return (
    <SignupTemplate
      url={url}
      title='Book a Demo | Virtual Hospitals Africa'
      h1='Book a demo'
      entrypoint='book_a_demo'
      rationale={
        <>
          See Virtual Hospitals Africa in action — a live walkthrough of
          <ul class='text-lg list-disc list-inside'>
            <li>the WhatsApp patient triage and consultation flow</li>
            <li>the web app your health workers use day-to-day</li>
            <li>how clinical data is captured, stored, and acted on</li>
          </ul>
        </>
      }
    />
  )
}
