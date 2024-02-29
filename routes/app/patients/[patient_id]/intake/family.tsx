import {
  FamilyRelationInsert,
  LoggedInHealthWorkerHandler,
} from '../../../../../types.ts'
import * as patient_family from '../../../../../db/models/family.ts'
import { parseRequestAsserts } from '../../../../../util/parseForm.ts'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import Buttons from '../../../../../components/library/form/buttons.tsx'
import { assertOr400 } from '../../../../../util/assertOr.ts'
import {
  assertAgeYearsKnown,
  IntakeContext,
  IntakeLayout,
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

export default async function FamilyPage(
  _req: Request,
  ctx: IntakeContext,
) {
  assert(!ctx.state.is_review)
  const { patient, trx } = ctx.state
  const age_years = assertAgeYearsKnown(ctx)

  return (
    <IntakeLayout ctx={ctx}>
      <section>
        <PatientFamilyForm
          age_years={age_years}
          family={await patient_family.get(trx, { patient_id: patient.id })}
        />
      </section>
      <hr className='my-2' />
      <Buttons submitText='Next Step' />
    </IntakeLayout>
  )
}
