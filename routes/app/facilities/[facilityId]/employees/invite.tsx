import { PageProps } from '$fresh/server.ts'
import Layout from '../../../../../components/library/Layout.tsx'
import {
  HealthWorker,
  LoggedInHealthWorkerHandler,
  ReturnedSqlRow,
} from '../../../../../types.ts'
import * as health_workers from '../..../../../../../../db/models/health_workers.ts'
import { assert } from 'std/testing/asserts.ts'
import parseForm from '../../../../../util/parseForm.ts'
import InviteEmployeesForm from '../../../../../islands/invites-form.tsx'
import { SmtpClient, ConnectConfigWithAuthentication } from 'https://deno.land/x/smtp@v0.7.0/mod.ts'

type EmployeesPageProps = {
  healthWorker: ReturnedSqlRow<HealthWorker>
}

function generateInviteCode(length = 8): string {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

interface Invite {
  email: string;
  profession: string;
}

async function sendInviteMail(email: string, inviteCode: string) {
  const client = new SmtpClient();
  const { SEND_EMAIL, PWD } = Deno.env.toObject();
  const connectConfig: ConnectConfigWithAuthentication = {
    hostname: "smtp.gmail.com",
    port: 465,
    username: SEND_EMAIL,
    password: PWD,
  };
  await client.connectTLS(connectConfig);

  await client.send({
    from: SEND_EMAIL,
    to: email,
    subject: "Welcome to VHA",
    content: `Please visit ${origin}/accept-invite/${inviteCode}`
  });

  await client.close();
  
}


export const handler: LoggedInHealthWorkerHandler<EmployeesPageProps> = {
  async GET(req, ctx) {
    const healthWorker = ctx.state.session.data
    const facilityId = parseInt(ctx.params.facilityId)
    assert(facilityId)
    assert(health_workers.isHealthWorkerWithGoogleTokens(healthWorker))
    const isAdmin = await health_workers.isAdmin(
      ctx.state.trx,
      {
        employee_id: healthWorker.id,
        facility_id: facilityId,
      },
    )
    assert(isAdmin)
    assert(facilityId)
    return ctx.render({ healthWorker })
  },
  async POST(req, ctx) {
    console.log('DID WE GET IN HERE')
    const healthWorker = ctx.state.session.data

    assert(health_workers.isHealthWorkerWithGoogleTokens(healthWorker))
    const isAdmin = await health_workers.isAdmin(
      ctx.state.trx,
      {
        employee_id: healthWorker.id,
        facility_id: parseInt(ctx.params.facilityId),
      },
    )

    assert(isAdmin)

    const facilityId = parseInt(ctx.params.facilityId)
    assert(facilityId)

    console.log(`Inviting user to facility ${facilityId}`)

    const params = new URLSearchParams(await req.text())
    
    const defaultInvite: Invite = { email: '', profession: '' }
    const values: Invite[] = parseForm(params, [{email: '', profession: ''}]);
    console.log('values', values)
    for (let invite of values) {
      const email = invite.email;
      const profession = invite.profession;
    
      if (email) { // Ensure that email is not empty
        const inviteCode = generateInviteCode();
        await sendInviteMail(email, inviteCode);
        // Do something with profession if necessary
      }
    }
    return new Response('OK')
  },
}

export default function InviteEmployees(props: PageProps) {
  return (
    <Layout
      title='Invite Employees'
      route={props.route}
      avatarUrl={props.data.healthWorker.avatar_url}
      variant='standard'
    >
      <InviteEmployeesForm />
    </Layout>
  )
}
