import { FreshContext } from '$fresh/server.ts'
import { LoggedInHealthWorker } from '../../../../../types.ts'

export default function WaitingRoomAdd(
  ctx: FreshContext<LoggedInHealthWorker>,
  req: Request,
) {
  console.log('ctx', ctx)
  console.log('req', req)
  return 'TODO: WaitingRoomAdd'
}
