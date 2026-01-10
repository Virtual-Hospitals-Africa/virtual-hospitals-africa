import { IdSelection, TrxOrDb } from '../../types.ts'

export const SKIP_NURSE_REGISTRATION = true

export type RegistrationStatus =
  | 'registered'
  | 'registration_needed'
  | 'registration_pending_approval'

export type OrganizationRegistrationStatus = {
  organization_id: string
  status: OrganizationRegistrationStatus
}

export const health_worker_registration_status = {
  getByIdOptional(
    trx: TrxOrDb,
    health_worker_id: string | IdSelection,
  ) {
    if (SKIP_NURSE_REGISTRATION) {
      return []
    }

    return trx.selectFrom('nurse_registration_details')
      .where(
        'nurse_registration_details.health_worker_id',
        '=',
        health_worker_id,
      ).selectAll().executeTakeFirst()

    // const role_needing_registration = health_worker.organizations.find((o) =>
    //   e.roles.nurse?.registration_needed || e.roles.doctor?.registration_needed ||
    //   e.roles.admin?.registration_needed
    // )

    // // This is not quite right as this will mean that you can't log in if you're pending approval at one organization, even if you're not
    // // pending approval at another but not at another.
    // // TODO deal with this as part of doctor registration
    // const role_pending_approval = health_worker.organizations.find((o) =>
    //   e.roles.nurse?.registration_pending_approval ||
    //   e.roles.doctor?.registration_pending_approval ||
    //   e.roles.admin?.registration_pending_approval
    // )
  },
}
