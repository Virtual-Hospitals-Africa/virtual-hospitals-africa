import { PageProps } from 'fresh'
import SignupTemplate from '../../../components/SignupTemplate.tsx'

export default function BookAnIntroCallPage({ url }: PageProps) {
  return (
    <SignupTemplate
      url={url}
      title='Book an Intro Call | Virtual Hospitals Africa'
      h1='Book an intro call'
      entrypoint='book_an_intro_call'
      rationale={
        <>
          Let's get to know each other — a short, no-pressure conversation about
          <ul class='text-lg list-disc list-inside'>
            <li>where you're coming from and what you're working on</li>
            <li>where Virtual Hospitals Africa is headed</li>
            <li>whether there's a fit worth exploring further</li>
          </ul>
        </>
      }
    />
  )
}
