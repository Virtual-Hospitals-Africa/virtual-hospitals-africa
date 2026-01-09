// import { Profession } from '../../../../../types.ts'
// import { parseRequestAsserts } from '../../../../../backend/parseForm.ts'
// import InviteEmployeesForm from '../../../../../islands/invites-form.tsx'
// import * as organizations from '../../../../../db/models/organizations.ts'
// import isObjectLike from '../../../../../util/isObjectLike.ts'
// import redirect from '../../../../../util/redirect.ts'
// import { assertOr400, assertOr403 } from '../../../../../util/assertOr.ts'
// import { HealthWorkerHomePageLayout } from '../../../_middleware.tsx'
// import { OrganizationContext } from '../_middleware.ts'
// import { postHandler } from '../../../../../backend/postHandler.ts'
// import z from 'zod'

// type Invite = { email: string; profession: Profession | null, is_admin: boolean }

// const InviteSchema = z.object({
//   email: z.string().transform(s => s.toLowerCase()),
//   profession: z.enum([
//     'doctor',
//     'nurse',
//     'receptionist',
//     'admin'
//   ]),
//   is_admin: z.boolean()
// }).transform(({ profession, ...invite }) =>
//   profession === 'admin'
//     ? {
//       ...invite,
//       profession: null,
//       is_admin: true
//     } : {
//       ...invite,
//       profession
//     }
// )

// const InvitesSchema = z.object({
//   invites: InviteSchema.array()
// }).default({
//   invites: []
// }).refine((obj) => {
//   const emails = obj.invites.map(invite => invite.email.toLowerCase())
//   const seen = new Set<string>()
//   const duplicates = new Set<string>()

//   for (const email of emails) {
//     if (seen.has(email)) {
//       duplicates.add(email)
//     } else {
//       seen.add(email)
//     }
//   }

//   return duplicates.size === 0
// }, (obj) => {
//   const emails = obj.invites.map(invite => invite.email.toLowerCase())
//   const duplicates = emails.filter((email, index) => emails.indexOf(email) !== index)
//   const unique_duplicates = Array.from(new Set(duplicates))

//   return {
//     message: `Duplicate emails found: ${unique_duplicates.join(', ')}`
//   }
// })

// export const handler = postHandler(
//   InvitesSchema,
//   async (ctx: OrganizationContext, { invites }) => {
//     assertOr403(ctx.state.is_admin_at_organization)

//     const invites_with_emails = invites.filter((invite) => invite.email)

//     await organizations.invite(
//       ctx.state.trx,
//       ctx.state.organization.id,
//       invites_with_emails,
//     )

//     const invited = invites_with_emails.map((invite) => invite.email).join(', ')
//     const success_message = encodeURIComponent(
//       `Successfully invited ${invited}`,
//     )

//     return redirect(
//       `/app/organizations/${ctx.state.organization.id}/employees?success=${success_message}`,
//     )
//   },
// )

// export default HealthWorkerHomePageLayout<OrganizationContext>(
//   'Invite Employees',
//   function InviteEmployeesPage(ctx) {
//     assertOr403(ctx.state.is_admin_at_organization)
//     return <InviteEmployeesForm />
//   },
// )
