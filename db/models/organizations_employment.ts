// TODO USE_INVITE_SYSTEM
// import { sql } from 'kysely'
// import { assert } from 'std/assert/assert.ts'
// import {
//   Coordinates,
//   DoctorsWithoutAction,
//   Maybe,
//   NonEmptyArray,
//   OrganizationDoctorOrNurse,
//   OrganizationEmployee,
//   OrganizationEmployeeOrInvitee,
//   OrganizationEmployeeWithActions,
//   Profession,
//   RenderedOrganization,
//   TrxOrDb,
// } from '../../types.ts'
// import { employment } from './employment.ts'
// import { addresses } from './addresses.ts'
// import partition from '../../util/partition.ts'
// import {
//   blankSelection,
//   jsonAgg,
//   jsonArrayFrom,
//   jsonBuildNullableObject,
//   jsonBuildObject,
//   literalLocation,
//   orderByArrayPosition,
//   success_true,
// } from '../helpers.ts'
// import { assertEquals } from 'std/assert/assert_equals.ts'
// import { assertOr400, StatusError } from '../../util/assertOr.ts'
// import { base, SearchResult } from './_base.ts'
// import generateUUID from '../../util/uuid.ts'
// import { Department, DEPARTMENTS } from '../../shared/departments.ts'
// import { SERVER_COUNTRY } from './countries.ts'
// import { avatar_url_sql } from './health_workers.ts'
// import uniq from '../../util/uniq.ts'
// import { groupByUniq } from '../../util/groupBy.ts'

// type EmployeeQueryOpts = {
//   organization_id?: string
//   professions?: Profession[]
//   emails?: string[]
//   is_approved?: boolean
//   exclude_health_worker_id?: string
// }

// ,getEmploymentQuery(
//   trx: TrxOrDb,
//   opts: {
//     organization_id?: string
//     professions?: Profession[]
//     is_approved?: boolean
//     exclude_health_worker_id?: string
//   },
// ) {
//   return trx.with('organization_employment', (qb) => {
//     let query = qb.selectFrom('employment')
//       .leftJoin(
//         'nurse_registration_details',
//         'nurse_registration_details.health_worker_id',
//         'employment.health_worker_id',
//       )
//       .selectAll('employment')
//       .select([
//         sql<'pending_approval' | 'approved' | 'incomplete'>`
//           CASE
//             WHEN employment.profession = 'admin' THEN 'approved'
//             WHEN employment.profession = 'doctor' THEN 'approved'
//             WHEN nurse_registration_details.health_worker_id IS NULL THEN 'incomplete'
//             WHEN nurse_registration_details.approved_by IS NULL THEN 'pending_approval'
//             ELSE 'approved'
//           END
//         `.as('registration_status'),
//       ])
//       .orderBy('employment.health_worker_id', 'asc')
//       .orderBy('employment.profession', 'asc')

//     if (opts.organization_id) {
//       query = query.where(
//         'employment.organization_id',
//         '=',
//         opts.organization_id,
//       )
//     }

//     if (opts.professions) {
//       assert(opts.professions.length)
//       query = query.where('profession', 'in', opts.professions)
//     }

//     if (opts.is_approved) {
//       query = query.where((eb) =>
//         eb.or([
//           eb('employment.profession', 'in', ['doctor', 'admin']),
//           eb('nurse_registration_details.approved_by', 'is not', null),
//         ])
//       )
//     }

//     if (opts.exclude_health_worker_id) {
//       query = query.where(
//         'employment.health_worker_id',
//         '!=',
//         opts.exclude_health_worker_id,
//       )
//     }

//     return query
//   })
// }

// ,getEmployeesQuery(
//   trx: TrxOrDb,
//   organization_id: string,
//   opts: EmployeeQueryOpts,
// ) {
//   const health_workers_at_organization_query = getEmploymentQuery(trx, {
//     ...opts,
//     organization_id,
//   }).with('health_workers_at_organization', (qb) => {
//     return qb.selectFrom('organization_employment')
//       .select(({ fn, ref }) => [
//         'organization_employment.health_worker_id',
//         sql`ARRAY_AGG(registration_status)`.as('registration_statuses'),
//         fn.jsonAgg(
//           jsonBuildObject({
//             employee_id: ref('organization_employment.id'),
//             profession: ref('organization_employment.profession'),
//             specialty: ref('organization_employment.specialty'),
//             registration_status: ref(
//               'organization_employment.registration_status',
//             ),
//           }),
//         ).as('professions'),
//       ])
//       .groupBy('organization_employment.health_worker_id')
//   })

//   return health_workers_at_organization_query.with(
//     'organization_employees',
//     (qb) => {
//       let query = qb.selectFrom('health_workers_at_organization')
//         .innerJoin(
//           'health_workers',
//           'health_workers.id',
//           'health_workers_at_organization.health_worker_id',
//         )
//         .select((eb) => [
//           'health_workers.id as health_worker_id',
//           'health_workers.name as name',
//           'health_workers.email as email',
//           'health_workers.name as display_name',
//           avatar_url_sql.as('avatar_url'),
//           eb.selectFrom('sessions')
//             .whereRef(
//               'sessions.entity_id',
//               '=',
//               'health_workers.id',
//             )
//             .select(sql<boolean>`
//             max(sessions.updated_at) >= NOW() - INTERVAL '1 hour'
//           `.as('online'))
//             .groupBy('sessions.entity_id')
//             .as('online'),
//           sql<false>`FALSE`.as('is_invitee'),
//           'health_workers_at_organization.professions',
//           sql<'pending_approval' | 'approved' | 'incomplete'>`
//           CASE
//             WHEN 'pending_approval' = ANY(registration_statuses) THEN 'pending_approval'
//             WHEN 'incomplete' = ANY(registration_statuses) THEN 'incomplete'
//             ELSE 'approved'
//           END
//         `.as('registration_status'),
//           // deno-fmt-ignore-start
//           jsonBuildObject({
//             view: sql<string>`concat('/app/organizations/', ${organization_id}::text, '/employees/', health_workers.id::text)`,
//           }).as('actions'),
//           // deno-fmt-ignore-end
//         ])

//       if (opts.emails) {
//         assert(Array.isArray(opts.emails))
//         assert(opts.emails.length)
//         query = query.where('health_workers.email', 'in', opts.emails)
//       }

//       return query
//     },
//   )
// }

// ,getAllEmployeesWithoutActionQuery(
//   trx: TrxOrDb,
//   opts: EmployeeQueryOpts,
// ) {
//   const health_workers_at_organization_query = getEmploymentQuery(trx, {
//     ...opts,
//   }).with('health_workers_at_organization', (qb) => {
//     return qb.selectFrom('organization_employment')
//       .select(({ fn, ref }) => [
//         'organization_employment.health_worker_id',
//         sql`ARRAY_AGG(registration_status)`.as('registration_statuses'),
//         fn.jsonAgg(
//           jsonBuildObject({
//             employee_id: ref('organization_employment.id'),
//             profession: ref('organization_employment.profession'),
//             specialty: ref('organization_employment.specialty'),
//             registration_status: ref(
//               'organization_employment.registration_status',
//             ),
//           }),
//         ).as('professions'),
//       ])
//       .groupBy('organization_employment.health_worker_id')
//   })

//   return health_workers_at_organization_query.with(
//     'organization_employees',
//     (qb) => {
//       let query = qb.selectFrom('health_workers_at_organization')
//         .innerJoin(
//           'health_workers',
//           'health_workers.id',
//           'health_workers_at_organization.health_worker_id',
//         )
//         .select((eb) => [
//           'health_workers.id as health_worker_id',
//           'health_workers.name as name',
//           'health_workers.email as email',
//           'health_workers.name as display_name',
//           avatar_url_sql.as('avatar_url'),
//           eb.selectFrom('sessions')
//             .whereRef(
//               'sessions.entity_id',
//               '=',
//               'health_workers.id',
//             )
//             .select(sql<boolean>`
//             max(sessions.updated_at) >= NOW() - INTERVAL '1 hour'
//           `.as('online'))
//             .groupBy('sessions.entity_id')
//             .as('online'),
//           sql<false>`FALSE`.as('is_invitee'),
//           'health_workers_at_organization.professions',
//           sql<'pending_approval' | 'approved' | 'incomplete'>`
//           CASE
//             WHEN 'pending_approval' = ANY(registration_statuses) THEN 'pending_approval'
//             WHEN 'incomplete' = ANY(registration_statuses) THEN 'incomplete'
//             ELSE 'approved'
//           END
//         `.as('registration_status'),
//         ])

//       if (opts.emails) {
//         assert(Array.isArray(opts.emails))
//         assert(opts.emails.length)
//         query = query.where('health_workers.email', 'in', opts.emails)
//       }

//       return query
//     },
//   )
// }

// ,getDoctorsWithoutAction(
//   trx: TrxOrDb,
//   opts: EmployeeQueryOpts = {},
// ): Promise<OrganizationEmployeeWithActions[]> {
//   const employees = getAllEmployeesWithoutActionQuery(trx, opts).selectFrom(
//     'organization_employees',
//   ).selectAll('organization_employees').execute()
//   return employees
// }

// ,async getApprovedDoctorsWithoutAction(
//   trx: TrxOrDb,
//   opts: Omit<EmployeeQueryOpts, 'is_approved' | 'professions' | 'actions'> = {},
// ): Promise<DoctorsWithoutAction[]> {
//   const employees = await getDoctorsWithoutAction(trx, {
//     ...opts,
//     professions: ['doctor'],
//     is_approved: true,
//   })

//   return employees.map(({ is_invitee, professions, ...rest }) => {
//     assert(!is_invitee)
//     assertEquals(professions.length, 1)
//     const [{ profession, employee_id, specialty }] = professions
//     assert(profession === 'doctor')

//     return {
//       ...rest,
//       profession,
//       employee_id,
//       specialty,
//     }
//   })
// }

// ,getEmployees(
//   trx: TrxOrDb,
//   organization_id: string,
//   opts: EmployeeQueryOpts = {},
// ): Promise<OrganizationEmployee[]> {
//   return getEmployeesQuery(trx, organization_id, opts).selectFrom(
//     'organization_employees',
//   ).selectAll('organization_employees').execute()
// }

// ,async getApprovedProviders(
//   trx: TrxOrDb,
//   organization_id: string,
//   opts: Omit<EmployeeQueryOpts, 'is_approved' | 'professions'> = {},
// ): Promise<OrganizationDoctorOrNurse[]> {
//   const employees = await getEmployees(trx, organization_id, {
//     ...opts,
//     professions: ['doctor', 'nurse'],
//     is_approved: true,
//   })

//   return employees.map(({ is_invitee, professions, ...rest }) => {
//     assert(!is_invitee)
//     assertEquals(professions.length, 1)
//     const [{ profession, employee_id, specialty }] = professions
//     assert(profession === 'doctor' || profession === 'nurse')

//     return {
//       ...rest,
//       profession,
//       employee_id,
//       specialty,
//     }
//   })
// }

// ,getEmployeesAndInvitees(
//   trx: TrxOrDb,
//   organization_id: string,
//   opts: {
//     professions?: Profession[]
//     emails?: string[]
//   } = {},
// ): Promise<OrganizationEmployeeOrInvitee[]> {
//   const hw_query = getEmployeesQuery(trx, organization_id, opts).selectFrom(
//     'organization_employees',
//   ).selectAll('organization_employees')
//   let inviteeQuery = trx.selectFrom('health_worker_invitees')
//     .select((eb) => [
//       sql<null | number>`NULL`.as('health_worker_id'),
//       sql<null | string>`NULL`.as('name'),
//       'health_worker_invitees.email as email',
//       'health_worker_invitees.email as display_name',
//       sql<null | string>`NULL`.as('avatar_url'),
//       sql<null>`NULL`.as('online'),
//       sql<boolean>`TRUE`.as('is_invitee'),
//       jsonAgg(
//         jsonBuildObject({
//           profession: eb.ref('health_worker_invitees.profession'),
//         }),
//       ).as('professions'),
//       sql<'pending_approval' | 'approved' | 'incomplete'>`'incomplete'`.as(
//         'registration_status',
//       ),
//       jsonBuildObject({
//         view: sql<null>`NULL`,
//       }).as('actions'),
//     ])
//     .where('health_worker_invitees.organization_id', '=', organization_id)
//     .groupBy('health_worker_invitees.email')

//   if (opts.emails) {
//     assert(Array.isArray(opts.emails))
//     assert(opts.emails.length)
//     inviteeQuery = inviteeQuery.where(
//       'health_worker_invitees.email',
//       'in',
//       opts.emails,
//     )
//   }

//   // deno-lint-ignore no-explicit-any
//   return hw_query.unionAll(inviteeQuery as any).execute()
// }

// ,async invite(
//   trx: TrxOrDb,
//   organization_id: string,
//   invites: {
//     email: string
//     profession: Profession | null
//     is_admin: boolean
//   }[],
// ) {
//   const invites_by_email = groupByUniq(invites, 'email')

//   const existing_employees = await getEmployees(
//     trx,
//     organization_id,
//     { emails: [...invites_by_email.keys()] },
//   )

//   const existing_employees_by_email = groupByUniq(existing_employees, 'email')

//   for (const invite of invites) {
//     const existing_employee = existing_employees_by_email.get(invite.email)

//     if (existing_employee) {
//       await trx.updateTable('employment')
//         .where('id', '=', )
//     }
//   }

//   const exact_matching_invites = invites.filter(
//     (invite) =>
//       existing_employees.some(
//         (employee) =>
//           invite.email === employee.email
//       ),
//   )

//   if (exact_matching_invites.length) {
//     const [{ email, profession }] = exact_matching_invites
//     const message =
//       `${email} is already employed as a ${profession}. Please remove them from the list.`
//     throw new StatusError(message, 400)
//   }

//   await employment.addInvitees(
//     trx,
//     organization_id,
//     invites,
//   )
// }

// ,addInvitees(
//   trx: TrxOrDb,
//   organization_id: string,
//   invites: {
//     email: string
//     profession: Profession | null
//     is_admin: boolean
//   }[],
// ) {
//   assert(invites.length > 0)
//   return trx
//     .insertInto('health_worker_invitees')
//     .values(invites.map((invite) => ({
//       organization_id,
//       ...invite,
//     })))
//     .returningAll()
//     .execute()
// }

// ,approveInvitee(
//   trx: TrxOrDb,
//   { admin_id, approving_id }: { admin_id: string; approving_id: string },
// ) {
//   return trx.updateTable('nurse_registration_details')
//     .set({ approved_by: admin_id })
//     .where('health_worker_id', '=', approving_id)
//     .execute()
// }

// ,getInvitees(
//   trx: TrxOrDb,
//   opts: {
//     email: string
//   },
// ): Promise<HasStringId<HealthWorkerInvitee>[]> {
//   return trx
//     .selectFrom('health_worker_invitees')
//     .where('email', '=', opts.email)
//     .selectAll()
//     .execute()
// }

// ,removeInvitees(
//   trx: TrxOrDb,
//   ids: string[],
// ) {
//   return trx.deleteFrom('health_worker_invitees').where('id', 'in', ids)
//     .execute()
// }
