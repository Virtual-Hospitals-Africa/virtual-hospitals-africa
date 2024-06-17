import { LoggedInHealthWorkerHandler, Maybe } from '../../../../../types.ts'
import * as address from '../../../../../db/models/address.ts'
import PatientAddressForm from '../../../../../components/patients/intake/AddressForm.tsx'
import { parseRequestAsserts } from '../../../../../util/parseForm.ts'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import Buttons, {
  ButtonsContainer,
} from '../../../../../islands/form/buttons.tsx'
import { assertOr400 } from '../../../../../util/assertOr.ts'
import {
  IntakeContext,
  IntakeLayout,
  upsertPatientAndRedirect,
} from './_middleware.tsx'
import { assert } from 'std/assert/assert.ts'
import { Button } from '../../../../../components/library/Button.tsx'
import SlideoutMenu from '../../../../../islands/SlideoutMenu.tsx'

type AddressFormValues = {
  address: {
    country_id: string
    province_id: string
    district_id: string
    ward_id: string
    suburb_id?: Maybe<string>
    street: string
  }
  nearest_organization_id: string
  nearest_organization_name: string
  primary_doctor_id: string
  primary_doctor_name: string
}

function assertIsAddress(
  patient: unknown,
): asserts patient is AddressFormValues {
  assertOr400(isObjectLike(patient))
  assertOr400(isObjectLike(patient.address))
  assertOr400(
    !!patient.address.country_id &&
      typeof patient.address.country_id === 'string',
  )
  assertOr400(
    !!patient.address.province_id &&
      typeof patient.address.province_id === 'string',
  )
  assertOr400(
    !!patient.address.district_id &&
      typeof patient.address.district_id === 'string',
  )
  assertOr400(
    !!patient.address.ward_id && typeof patient.address.ward_id === 'string',
  )
  assertOr400(
    (!!patient.address.street && typeof patient.address.street === 'string') ||
      !patient.address.street,
  )
  assertOr400(
    !!patient.nearest_organization_id &&
      typeof patient.nearest_organization_id === 'string',
  )
  assertOr400(
    !!(patient.primary_doctor_id &&
      typeof patient.primary_doctor_id === 'string') ||
      patient.primary_doctor_name,
  )
}

export const handler: LoggedInHealthWorkerHandler<IntakeContext> = {
  async POST(req, ctx) {
    const { primary_doctor_name, nearest_organization_name, ...patient } =
      await parseRequestAsserts(
        ctx.state.trx,
        req,
        assertIsAddress,
      )
    return upsertPatientAndRedirect(ctx, {
      ...patient,
      unregistered_primary_doctor_name: patient.primary_doctor_id
        ? null
        : primary_doctor_name,
    })
  },
}

export default async function AddressPage(
  _req: Request,
  ctx: IntakeContext,
) {
  assert(!ctx.state.is_review)
  const { healthWorker, patient, trx } = ctx.state
  const country_address_tree = await address.getCountryAddressTree(trx)

  let default_organization:
    | { id: string; name: string; address: string }
    | undefined

  for (const employment of healthWorker.employment) {
    if (employment.organization.address) {
      default_organization = {
        id: employment.organization.id,
        name: employment.organization.name,
        address: employment.organization.address,
      }
      break
    }
  }

  return (
    <IntakeLayout ctx={ctx}>
      <PatientAddressForm
        patient={patient}
        default_organization={default_organization}
        country_address_tree={country_address_tree}
      />
      <hr className='my-2' />
      <ButtonsContainer>
        <SlideoutMenu/>
        <Button
          type='submit'
          className='flex-1 max-w-xl '
        >
          Next Step
        </Button>
      </ButtonsContainer>
    </IntakeLayout>
  )
}
