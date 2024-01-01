import { LoggedInHealthWorkerHandler } from '../../../../types.ts'
import redirect from '../../../../util/redirect.ts'

// TODO: remove add.tsx in favor of this file
export const handler: LoggedInHealthWorkerHandler = {
  GET(_req, { url, params }) {
    const searchParams = new URLSearchParams(url.search)
    searchParams.set('patient_id', params.patient_id)
    return redirect(`/app/patients/add?${searchParams.toString()}`)
  },
}
