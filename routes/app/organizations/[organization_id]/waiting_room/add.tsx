import z from 'zod'
import * as patients from '../../../../../db/models/patients.ts'
import * as patient_encounters from '../../../../../db/models/patient_encounters.ts'
import * as employees from '../../../../../db/models/employees.ts'
import redirect from '../../../../../util/redirect.ts'
import { assertOr404 } from '../../../../../util/assertOr.ts'
import AddPatientForm from '../../../../../islands/waiting_room/AddPatientForm.tsx'
import { HealthWorkerHomePageLayout } from '../../../_middleware.tsx'
import { promiseProps } from '../../../../../util/promiseProps.ts'
import { OrganizationContext } from '../_middleware.ts'
import { postHandler } from '../../../../../backend/postHandler.ts'
import generateUUID from '../../../../../util/uuid.ts'

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
    { state: { trx, organization, organization_employment } }:
      OrganizationContext,
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

export default HealthWorkerHomePageLayout(
  'Add patient to waiting room',
  async function WaitingRoomAdd(
    { url, state: { organization, trx } }: OrganizationContext,
  ) {
    const { searchParams } = url
    const patient_id = searchParams.get('patient_id')
    assertOr404(patient_id, 'Must add a specific patient')

    const { patient, providers, open_encounter } = await promiseProps({
      patient: patients.getById(trx, patient_id),
      providers: employees.findAll(
        trx,
        {
          organization_id: organization.id,
          professions: ['nurse', 'doctor'],
        },
      ),
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
