import z from 'zod'
import { FreshContext } from '$fresh/server.ts'
import * as patients from '../../../../../db/models/patients.ts'
import * as patient_encounters from '../../../../../db/models/patient_encounters.ts'
import * as organizations from '../../../../../db/models/organizations.ts'
import {
  LoggedInHealthWorker,
  LoggedInHealthWorkerHandlerWithProps,
} from '../../../../../types.ts'
import { parseRequest } from '../../../../../util/parseForm.ts'
import redirect from '../../../../../util/redirect.ts'
import { assert } from 'std/assert/assert.ts'
import { assertOr404 } from '../../../../../util/assertOr.ts'
import AddPatientForm from '../../../../../islands/waiting_room/AddPatientForm.tsx'
import { HealthWorkerHomePageLayout } from '../../../_middleware.tsx'
import { promiseProps } from '../../../../../util/promiseProps.ts'

const AddPatientFormSchema = z.object({
  encounter_id: z.string().uuid().optional(),
  patient_id: z.string().uuid(),
  reason: z.enum([
    'seeking treatment',
    'maternity',
    'appointment',
    'follow up',
    'referral',
    'checkup',
    'emergency',
    'other',
  ]),
  notes: z.string().optional(),
  waiting_room: z.boolean().default(false),
})

export const handler: LoggedInHealthWorkerHandlerWithProps<
  Record<never, unknown>,
  {
    organization: { id: string; name: string }
  }
> = {
  async POST(req, ctx) {
    const { organization_id } = ctx.params
    assert(organization_id)
    const to_upsert = await parseRequest(
      ctx.state.trx,
      req,
      AddPatientFormSchema.parse,
    )

    const upserted = await patient_encounters.upsert(
      ctx.state.trx,
      organization_id,
      to_upsert,
    )
    const { waiting_room } = to_upsert

    const next_url = waiting_room
      ? `/app/organizations/${organization_id}/waiting_room?just_encountered_id=${upserted.id}`
      : `/app/patients/${upserted.patient_id}/encounters/${upserted.id}`

    return redirect(next_url)
  },
}

export default HealthWorkerHomePageLayout(
  'Add patient to waiting room',
  async function WaitingRoomAdd(
    _req: Request,
    { url, state, params }: FreshContext<LoggedInHealthWorker>,
  ) {
    const { trx } = state
    const { searchParams } = url
    const patient_id = searchParams.get('patient_id')
    assertOr404(patient_id, 'Must add a specific patient')
    const { organization_id } = params
    assert(organization_id)

    const { patient, providers, open_encounter } = await promiseProps({
      patient: patients.getByID(trx, {
        id: patient_id,
      }),
      providers: organizations.getApprovedProviders(
        trx,
        organization_id,
      ),
      open_encounter: patient_encounters.get(trx, {
        patient_id,
        encounter_id: 'open',
      }),
    })

    if (open_encounter) {
      const warning = encodeURIComponent(
        'Please use the existing patient visit.',
      )
      return redirect(
        `/app/organizations/${organization_id}/waiting_room?warning=${warning}`,
      )
    }

    return <AddPatientForm providers={providers} patient={patient} />
  },
)
