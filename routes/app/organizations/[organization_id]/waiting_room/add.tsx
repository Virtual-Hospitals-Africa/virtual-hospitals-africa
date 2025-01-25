import z from 'zod'
import * as patients from '../../../../../db/models/patients.ts'
import * as patient_encounters from '../../../../../db/models/patient_encounters.ts'
import * as organizations from '../../../../../db/models/organizations.ts'
import { parseRequest } from '../../../../../util/parseForm.ts'
import redirect from '../../../../../util/redirect.ts'
import { assertOr404 } from '../../../../../util/assertOr.ts'
import AddPatientForm from '../../../../../islands/waiting_room/AddPatientForm.tsx'
import { HealthWorkerHomePageLayout } from '../../../_middleware.tsx'
import { promiseProps } from '../../../../../util/promiseProps.ts'
import { OrganizationContext } from '../_middleware.ts'

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
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
  notes: z.string().optional(),
  waiting_room: z.boolean().default(false),
})

export const handler = {
  async POST(
    req: Request,
    { state: { trx, organization } }: OrganizationContext,
  ) {
    const to_insert = await parseRequest(
      trx,
      req,
      AddPatientFormSchema.parse,
    )

    const inserted = await patient_encounters.insert(
      trx,
      organization.id,
      {
        ...to_insert,
        location: to_insert.location || organization.location!,
      },
    )

    return redirect(
      `/app/organizations/${organization.id}/waiting_room?just_encountered_id=${inserted.id}`,
    )
  },
}

export default HealthWorkerHomePageLayout(
  'Add patient to waiting room',
  async function WaitingRoomAdd(
    _req: Request,
    { url, state: { organization, trx } }: OrganizationContext,
  ) {
    const { searchParams } = url
    const patient_id = searchParams.get('patient_id')
    assertOr404(patient_id, 'Must add a specific patient')

    const { patient, providers, open_encounter } = await promiseProps({
      patient: patients.getByID(trx, {
        id: patient_id,
      }),
      providers: organizations.getApprovedProviders(
        trx,
        organization.id,
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
        `/app/organizations/${organization.id}/waiting_room?warning=${warning}`,
      )
    }

    return <AddPatientForm providers={providers} patient={patient} />
  },
)
