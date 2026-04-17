import { Context } from 'fresh'
import SignupTemplate from '../../components/SignupTemplate.tsx'

// deno-lint-ignore require-await
export default async function MailingListPage(ctx: Context<unknown>) {
  return (
    <SignupTemplate
      url={ctx.url}
      title='Mailing List | Virtual Hospitals Africa'
      h1='Sign up for our mailing list'
      entrypoint='mailing_list_signup'
      rationale={
        <>
          Receive updates with
          <ul class='text-lg list-disc list-inside'>
            <li>progress in South Africa and beyond</li>
            <li>a refreshing perspective on the African digital health landscape</li>
            <li>clinical success stories & technical deep dives</li>
          </ul>
        </>
      }
    />
  )
}
