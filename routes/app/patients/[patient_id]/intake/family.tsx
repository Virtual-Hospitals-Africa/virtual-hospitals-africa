import {
  FamilyRelationInsert,
  LoggedInHealthWorkerHandler,
  LoggedInHealthWorkerHandlerWithProps,
} from '../../../../../types.ts'
import * as patient_family from '../../../../../db/models/family.ts'
import * as patients from '../../../../../db/models/patients.ts'
import redirect from '../../../../../util/redirect.ts'
import PatientFamilyForm from '../../../../../components/patients/intake/FamilyForm.tsx'
import { parseRequestAsserts } from '../../../../../util/parseForm.ts'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import Buttons from '../../../../../components/library/form/buttons.tsx'
import { assertOr400, assertOrRedirect } from '../../../../../util/assertOr.ts'
import { getRequiredNumericParam } from '../../../../../util/getNumericParam.ts'
import {
  IntakeContext,
  IntakeLayout,
  nextLink,
  upsertPatientAndRedirect,
} from './_middleware.tsx'
import { assert } from 'std/assert/assert.ts'
import { Religion, FamilyType , MaritalStatus, PatientCohabitation } from '../../../../../db.d.ts'

type FamilyFormValues = {
  family?: {
    guardians?: FamilyRelationInsert[]
    dependents?: FamilyRelationInsert[]
    other_next_of_kin?: FamilyRelationInsert
    home_satisfaction?: number
    spiritual_satisfaction?: number
    social_satisfaction?: number
    religion?: Religion
    family_type?: FamilyType
    marital_status?: MaritalStatus
    patient_cohabitation?: PatientCohabitation
  }
}

function assertIsFamily(
  patient: unknown,
): asserts patient is FamilyFormValues {
  assertOr400(isObjectLike(patient))
}

export const handler: LoggedInHealthWorkerHandler<IntakeContext> = {
  async POST(req, ctx) {
    const { family, ...patient } = await parseRequestAsserts(
      ctx.state.trx,
      req,
      assertIsFamily,
    )
    return upsertPatientAndRedirect(ctx, {
      ...patient,
      family: {
        guardians: family?.guardians || [],
        dependents: family?.dependents || [],
        other_next_of_kin: family?.other_next_of_kin,
        home_satisfaction: family?.home_satisfaction,
        spiritual_satisfaction: family?.spiritual_satisfaction,
        social_satisfaction:family?.social_satisfaction,
        religion: family?.religion,
        family_type: family?.family_type,
        marital_status: family?.marital_status,
        patient_cohabitation: family?.patient_cohabitation,
      },
    })
  },
}

export default async function FamilyPage(
  _req: Request,
  ctx: IntakeContext,
) {
  assert(!ctx.state.is_review)
  const { patient, trx } = ctx.state
  const family = await patient_family.get(trx, { patient_id: patient.id })

  const warning = encodeURIComponent(
    "Please fill out the patient's personal information beforehand.",
  )
  assertOrRedirect(
    patient.age,
    `/app/patients/${patient.id}/intake/personal?warning=${warning}`,
  )

  return (
    <IntakeLayout ctx={ctx}>
      <PatientFamilyForm
        patient={patient}
        family={family}
      />
      <hr className='my-2' />
      <Buttons submitText='Next Step' />
    </IntakeLayout>
  )
}
