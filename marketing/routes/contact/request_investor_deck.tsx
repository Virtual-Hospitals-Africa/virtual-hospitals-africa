import { PageProps } from 'fresh'
import SignupTemplate from '../../../components/SignupTemplate.tsx'

export default function RequestInvestorDeckPage({ url }: PageProps) {
  return (
    <SignupTemplate
      url={url}
      title='Request Investor Deck | Virtual Hospitals Africa'
      h1='Request our investor deck'
      entrypoint='request_investor_deck'
      rationale={
        <>
          Get the full picture on Virtual Hospitals Africa, including
          <ul class='text-lg list-disc list-inside'>
            <li>the problem we're solving and why now</li>
            <li>our clinical model, traction, and roadmap</li>
            <li>the opportunity across Sub-Saharan Africa</li>
          </ul>
        </>
      }
    />
  )
}
