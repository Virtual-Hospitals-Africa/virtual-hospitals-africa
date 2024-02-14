import {
  LoggedInHealthWorkerHandler,
  LoggedInHealthWorkerHandlerWithProps,
  Maybe,
} from '../../../../../types.ts'
import * as address from '../../../../../db/models/address.ts'
import * as patients from '../../../../../db/models/patients.ts'
import redirect from '../../../../../util/redirect.ts'
import PatientAddressForm from '../../../../../components/patients/intake/AddressForm.tsx'
import { parseRequestAsserts } from '../../../../../util/parseForm.ts'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import Buttons from '../../../../../components/library/form/buttons.tsx'
import { assertOr400 } from '../../../../../util/assertOr.ts'
import { getRequiredNumericParam } from '../../../../../util/getNumericParam.ts'
import {
  IntakeContext,
  IntakeLayout,
  nextLink,
  upsertPatientAndRedirect,
} from './_middleware.tsx'
import { assert } from 'std/assert/assert.ts'

type AddressFormValues = {
  address: {
    country_id: number
    province_id: number
    district_id: number
    ward_id: number
    suburb_id?: Maybe<number>
    street: string
  }
  nearest_facility_id: number
  nearest_facility_name: string
  primary_doctor_id: number
  primary_doctor_name: string
}

function assertIsAddress(
  patient: unknown,
): asserts patient is AddressFormValues {
  assertOr400(isObjectLike(patient))
  assertOr400(isObjectLike(patient.address))
  assertOr400(
    !!patient.address.country_id &&
      typeof patient.address.country_id === 'number',
  )
  assertOr400(
    !!patient.address.province_id &&
      typeof patient.address.province_id === 'number',
  )
  assertOr400(
    !!patient.address.district_id &&
      typeof patient.address.district_id === 'number',
  )
  assertOr400(
    !!patient.address.ward_id && typeof patient.address.ward_id === 'number',
  )
  assertOr400(
    (!!patient.address.street && typeof patient.address.street === 'string') ||
      !patient.address.street,
  )
  assertOr400(
    !!patient.nearest_facility_id &&
      typeof patient.nearest_facility_id === 'number',
  )
  assertOr400(
    !!(patient.primary_doctor_id &&
      typeof patient.primary_doctor_id === 'number') ||
      patient.primary_doctor_name,
  )
}

export const handler: LoggedInHealthWorkerHandler<IntakeContext> = {
  async POST(req, ctx) {
    const { primary_doctor_name, nearest_facility_name, ...patient } =
      await parseRequestAsserts(
        ctx.state.trx,
        req,
        assertIsAddress,
      )
    return upsertPatientAndRedirect(ctx, {
      ...patient,
      unregistered_primary_doctor_name: isNaN(patient.primary_doctor_id)
        ? primary_doctor_name
        : null,
    })
  },
}

export default async function AddressPage(
  _req: Request,
  ctx: IntakeContext,
) {
  assert(!ctx.state.is_review)
  const { healthWorker, patient, trx } = ctx.state
  const adminDistricts = await address.getFullCountryInfo(trx)

  return (
    <IntakeLayout ctx={ctx}>
      <PatientAddressForm
        patient={patient}
        defaultFacility={{
          id: healthWorker.employment[0].facility.id,
          name: healthWorker.employment[0].facility.name,
          address: healthWorker.employment[0].facility.address,
        }}
        adminDistricts={adminDistricts}
      />
      <hr className='my-2' />
      <Buttons submitText='Next Step' />
    </IntakeLayout>
  )
}
