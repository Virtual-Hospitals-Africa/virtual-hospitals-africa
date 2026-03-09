import z from 'zod'
import { patients } from '../../../../../db/models/patients.ts'
import { patient_encounters } from '../../../../../db/models/patient_encounters.ts'
import redirect from '../../../../../util/redirect.ts'
import { assertOr404 } from '../../../../../util/assertOr.ts'
import AddPatientForm from '../../../../../islands/waiting_room/AddPatientForm.tsx'
import { HealthWorkerHomePage } from '../../../_middleware.tsx'
import { promiseProps } from '../../../../../util/promiseProps.ts'
import { OrganizationContext } from '../_middleware.ts'
import { postHandler } from '../../../../../backend/postHandler.ts'
import generateUUID from '../../../../../util/uuid.ts'
import { employees_presence } from '../../../../../db/models/employees_presence.ts'

const AddPatientFormSchema = z.object({
  patient_id: z.string().uuid(),
  reason: z.enum([
    'seeking treatment',
    'maternity',
    'follow up',
    'referral',
    'checkup',
  ]),
  notes: z.string().optional(),
})

export const handler = postHandler(
  AddPatientFormSchema,
  async (
    { state: { trx, organization, organization_employment } }: OrganizationContext,
    { patient_id, ...to_create },
  ) => {
    const inserted = await patient_encounters
      .insertSeekingTreatmentForRegisteredPatient(
        trx,
        organization,
        organization_employment,
        {
          patient_id,
          encounter: {
            create: true,
            to_create,
            patient_encounter_id: generateUUID(),
          },
        },
      )
    return redirect(
      `/app/organizations/${organization.id}/waiting_room?just_encountered_patient_id=${inserted.id}`,
    )
  },
)

export default HealthWorkerHomePage(
  'Add patient to waiting room',
  async function WaitingRoomAdd(
    { url, state: { trx, organization, organization_id, health_worker_id } }: OrganizationContext,
  ) {
    const { searchParams } = url
    const patient_id = searchParams.get('patient_id')
    assertOr404(patient_id, 'Must add a specific patient')

    const { patient, providers, open_encounter } = await promiseProps({
      patient: patients.getById(trx, patient_id, { include_incomplete_registration: true }),
      providers: employees_presence.findAll(trx, {
        organization_id,
        excluding_health_worker_id: health_worker_id,
      }),
      open_encounter: patient_encounters.getFirstOpen(trx, {
        patient_id,
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
