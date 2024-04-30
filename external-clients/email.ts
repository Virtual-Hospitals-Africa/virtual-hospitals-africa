// TODO: get this working
// import {
//   ConnectConfigWithAuthentication,
//   SmtpClient,
// } from 'https://deno.land/x/smtp@v0.7.0/mod.ts'

// async function sendInviteMail(
//   email: string,
//   organization_id: string,
// ) {
//   const client = new SmtpClient()
//   const { SEND_EMAIL, PWD } = Deno.env.toObject()
//   const connectConfig: ConnectConfigWithAuthentication = {
//     hostname: 'smtp.gmail.com',
//     port: 465,
//     username: SEND_EMAIL,
//     password: PWD,
//   }
//   await client.connect(connectConfig)

//   await client.send({
//     from: SEND_EMAIL,
//     to: email,
//     subject: 'Welcome to VHA',
//     content: `Please visit ${origin}/login?invited=true`,
//   })

//   await client.close()
// }
