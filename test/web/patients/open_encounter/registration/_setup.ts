import db from '../../../../../db/db.ts'
import asFormData from '../../../../../util/asFormData.ts'
import { addTestEmployeeWithSession } from '../../../../_helpers/employees.ts'
import { createTestOrganization } from '../../../../_helpers/organizations.ts'
import { insertRegistrationWithEmployeeForTest } from '../../../../_helpers/workflows.ts'
import { assert } from 'std/assert/assert.ts'
import z from 'zod'
import { PatientRegistrationPersonalSchema } from '../../../../../routes/app/organizations/[organization_id]/patients/[patient_id]/open_encounter/registration/personal.tsx'
import { PatientRegistrationThisVisitSchema } from '../../../../../routes/app/organizations/[organization_id]/patients/[patient_id]/open_encounter/registration/this_visit.tsx'
import { PatientRegistrationPrimaryCareSchema } from '../../../../../routes/app/organizations/[organization_id]/patients/[patient_id]/open_encounter/registration/primary_care.tsx'
import { PatientRegistrationContactsSchema } from '../../../../../routes/app/organizations/[organization_id]/patients/[patient_id]/open_encounter/registration/contacts.tsx'
import { PatientRegistrationConfirmDetailsSchema } from '../../../../../routes/app/organizations/[organization_id]/patients/[patient_id]/open_encounter/registration/confirm_details.tsx'
import { PatientRegistrationTermsAndConditionsSchema } from '../../../../../routes/app/organizations/[organization_id]/patients/[patient_id]/open_encounter/registration/terms_and_conditions.tsx'
import { PatientRegistrationRoutePatientSchema } from '../../../../../routes/app/organizations/[organization_id]/patients/[patient_id]/open_encounter/registration/route_patient.tsx'

export type RegistrationScenario = {
  personal: z.infer<typeof PatientRegistrationPersonalSchema>
  this_visit?: z.infer<typeof PatientRegistrationThisVisitSchema>
  primary_care?: z.infer<typeof PatientRegistrationPrimaryCareSchema>
  contacts?: z.infer<typeof PatientRegistrationContactsSchema>
  confirm_details?: z.infer<typeof PatientRegistrationConfirmDetailsSchema>
  terms_and_conditions?: z.infer<
    typeof PatientRegistrationTermsAndConditionsSchema
  >
  route_patient?: z.infer<typeof PatientRegistrationRoutePatientSchema>
}

/**
 * Sets up a RegistrationScenario, going as far into the workflow as data provided
 */
export async function setupRegistration(
  {
    personal,
    this_visit,
    primary_care,
    contacts,
    confirm_details,
    terms_and_conditions,
    route_patient,
  }: RegistrationScenario,
) {
  const clinic = await createTestOrganization(db)

  await addTestEmployeeWithSession(db, {
    profession: 'nurse',
    registration_status: 'approved',
    organization_id: clinic.id,
  })

  const receptionist = await addTestEmployeeWithSession(db, {
    profession: 'receptionist',
    registration_status: 'approved',
    organization_id: clinic.id,
  })

  const encounter = await insertRegistrationWithEmployeeForTest(
    db,
    receptionist.health_worker.organization_id,
    {
      employment_id: receptionist.health_worker.employee_id,
    },
  )

  let $ = await receptionist.fetchCheerio(
    `/app/organizations/${clinic.id}/patients/${encounter.patient_id}/open_encounter/registration/personal`,
    {
      method: 'POST',
      body: asFormData(personal),
    },
  )

  if (this_visit) {
    $ = await receptionist.fetchCheerio(
      `/app/organizations/${clinic.id}/patients/${encounter.patient_id}/open_encounter/registration/this_visit`,
      {
        method: 'POST',
        body: asFormData(this_visit),
      },
    )
  } else {
    assert(!primary_care)
    assert(!contacts)
    assert(!confirm_details)
    assert(!terms_and_conditions)
    assert(!route_patient)
  }

  if (primary_care) {
    $ = await receptionist.fetchCheerio(
      `/app/organizations/${clinic.id}/patients/${encounter.patient_id}/open_encounter/registration/primary_care`,
      {
        method: 'POST',
        body: asFormData(primary_care),
      },
    )
  } else {
    assert(!contacts)
    assert(!confirm_details)
    assert(!terms_and_conditions)
    assert(!route_patient)
  }

  if (contacts) {
    $ = await receptionist.fetchCheerio(
      `/app/organizations/${clinic.id}/patients/${encounter.patient_id}/open_encounter/registration/contacts`,
      {
        method: 'POST',
        body: asFormData(contacts),
      },
    )
  } else {
    assert(!confirm_details)
    assert(!terms_and_conditions)
    assert(!route_patient)
  }

  if (confirm_details) {
    $ = await receptionist.fetchCheerio(
      `/app/organizations/${clinic.id}/patients/${encounter.patient_id}/open_encounter/registration/confirm_details`,
      {
        method: 'POST',
        body: asFormData(confirm_details),
      },
    )
  } else {
    assert(!terms_and_conditions)
    assert(!route_patient)
  }

  if (terms_and_conditions) {
    $ = await receptionist.fetchCheerio(
      `/app/organizations/${clinic.id}/patients/${encounter.patient_id}/open_encounter/registration/terms_and_conditions`,
      {
        method: 'POST',
        body: asFormData(terms_and_conditions),
      },
    )
  } else {
    assert(!route_patient)
  }

  if (route_patient) {
    $ = await receptionist.fetchCheerio(
      `/app/organizations/${clinic.id}/patients/${encounter.patient_id}/open_encounter/registration/route_patient`,
      {
        method: 'POST',
        body: asFormData(route_patient),
      },
    )
  }

  return { $, clinic, nurse: receptionist, encounter }
}
