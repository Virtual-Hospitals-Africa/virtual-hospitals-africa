import {
  FamilyRelationInsert,
  LoggedInHealthWorkerHandler,
} from '../../../../../types.ts'
import * as patient_family from '../../../../../db/models/family.ts'
import { parseRequestAsserts } from '../../../../../util/parseForm.ts'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import Buttons, {
  ButtonsContainer,
} from '../../../../../islands/form/buttons.tsx'
import { assertOr400 } from '../../../../../util/assertOr.ts'
import {
  assertAgeYearsKnown,
  IntakeContext,
  IntakeLayout,
  IntakePage,
  upsertPatientAndRedirect,
} from './_middleware.tsx'
import { assert } from 'std/assert/assert.ts'
import {
  FamilyType,
  MaritalStatus,
  PatientCohabitation,
  Religion,
} from '../../../../../db.d.ts'
import PatientFamilyForm from '../../../../../islands/family/Form.tsx'

type FamilyFormValues = {
  family: {
    under_18?: boolean
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
  assertOr400(isObjectLike(patient.family))
  if (
    isObjectLike(patient.family.other_next_of_kin) &&
    !patient.family.other_next_of_kin.patient_name &&
    !patient.family.other_next_of_kin.patient_id
  ) {
    delete patient.family.other_next_of_kin
  }
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
        ...family,
        guardians: family.guardians || [],
        dependents: family.dependents || [],
      },
    })
  },
}

export default IntakePage(async function FamilyPage({ ctx, patient }) {
  assert(!patient.is_review)
  const age_years = assertAgeYearsKnown(ctx)
  const patient_id = patient.data.id
  const family = await patient_family.get(ctx.state.trx, { patient_id })

  return (
    <PatientFamilyForm
      age_years={age_years}
      family={family}
    />
  )
})
