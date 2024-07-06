import { FamilyRelationInsert } from '../../../../../types.ts'
import * as patient_family from '../../../../../db/models/family.ts'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import { assertOr400 } from '../../../../../util/assertOr.ts'
import { assertAgeYearsKnown, IntakePage, postHandler } from './_middleware.tsx'
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
  patient.family.guardians = patient.family.guardians || []
  patient.family.dependents = patient.family.dependents || []
}

export const handler = postHandler(assertIsFamily)

export default IntakePage(async function FamilyPage({ ctx, patient }) {
  const age_years = assertAgeYearsKnown(ctx)
  const patient_id = patient.id
  const family = await patient_family.get(ctx.state.trx, { patient_id })

  return (
    <PatientFamilyForm
      age_years={age_years}
      family={family}
    />
  )
})
