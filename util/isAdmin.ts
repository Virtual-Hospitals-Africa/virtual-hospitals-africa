import { LoggedInHealthWorker } from '../types.ts'

export default async function isAdmin(
  state: LoggedInHealthWorker,
): Promise<boolean> {
  const userEmail: string = state.session.data.email
  const matches = await state.trx
    .selectFrom('employment')
    .innerJoin(
      'health_workers',
      'health_workers.id',
      'employment.health_worker_id',
    )
    .where('health_workers.email', '=', userEmail)
    .where('profession', '=', 'admin')
    .execute()
  if (matches.length > 1) {
    throw new Error(
      'Duplicate matches found when searching for an admin identified by: ' +
        userEmail + ' in database',
    )
  }
  return matches.length === 1
}
