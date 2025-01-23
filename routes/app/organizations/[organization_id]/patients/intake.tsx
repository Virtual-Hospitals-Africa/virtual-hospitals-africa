import Layout from '../../../../../components/library/Layout.tsx'
import Form from '../../../../../components/library/Form.tsx'
import { getRequiredUUIDParam } from '../../../../../util/getParam.ts'
import { ButtonsContainer } from '../../../../../islands/form/buttons.tsx'
import { Button } from '../../../../../components/library/Button.tsx'
import { parseRequest } from '../../../../../util/parseForm.ts'
import * as patients from '../../../../../db/models/patients.ts'
import * as patient_intake from '../../../../../db/models/patient_intake.ts'
import * as events from '../../../../../db/models/events.ts'
import * as addresses from '../../../../../db/models/addresses.ts'
import * as patient_family from '../../../../../db/models/family.ts'
import compact from '../../../../../util/compact.ts'
import { z } from 'zod'
import {
  e164_phone_number,
  gender,
  national_id_number,
  varchar255,
} from '../../../../../util/validators.ts'
import { OrganizationContext } from '../_middleware.ts'
import PatientIntakeForm from '../../../../../components/patient-intake/IntakeForm.tsx'
import redirect from '../../../../../util/redirect.ts'
import { promiseProps } from '../../../../../util/promiseProps.ts'

const FamilyRelationInsertSchema = z.object({
  patient_id: z.string().uuid().optional(),
  patient_name: z.string(),
  patient_phone_number: e164_phone_number.optional(),
  family_relation_gendered: z.string(),
  next_of_kin: z.boolean().default(false),
})

const IntakeSchema = z.object({
  first_name: varchar255,
  last_name: varchar255,
  middle_names: varchar255.optional(),
  avatar_media: z.object({ id: z.string().uuid() }).optional(),
  national_id_number: national_id_number.optional(),
  no_national_id: z.boolean().optional(),
  phone_number: e164_phone_number.optional(),
  date_of_birth: z.string().date(),
  gender,
  ethnicity: varchar255.optional(),
  address: z.object({
    street: z.string().optional(),
    locality: z.string(),
    administrative_area_level_2: z.string().optional(),
    administrative_area_level_1: z.string().optional(),
    country: z.string(),
  }),
  nearest_organization_id: z.string().uuid().optional(),
  primary_doctor_id: z.string().uuid().optional(),
  primary_doctor_name: z.string().optional(),
  family: z.object({
    next_of_kin: FamilyRelationInsertSchema.optional(),
  }),
}).refine(
  (data) => data.national_id_number || data.no_national_id,
  {
    message: 'Must either provide national id number or check no national id',
    path: ['national_id_number'],
  },
).transform((
  {
    avatar_media,
    first_name,
    middle_names,
    last_name,
    primary_doctor_name,
    // deno-lint-ignore no-unused-vars
    no_national_id,
    ...data
  },
) => ({
  ...data,
  unregistered_primary_doctor_name: data.primary_doctor_id
    ? undefined
    : primary_doctor_name,
  avatar_media_id: avatar_media?.id,
  name: compact(
    [first_name, middle_names, last_name],
  ).join(' '),
}))

const OrganizationWithAddressSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
})

export default async function IntakePage(
  _req: Request,
  ctx: OrganizationContext,
) {
  const { trx } = ctx.state

  const patient_id = ctx.url.searchParams.get('patient_id')
  const patient_name = ctx.url.searchParams.get('patient_name') ?? undefined

  const {
    patient,
    country_address_tree,
  } = await promiseProps({
    patient: patient_id
      ? patient_intake.getById(trx, patient_id)
      : Promise.resolve(patient_name ? { name: patient_name } : {}),
    country_address_tree: addresses.getCountryAddressTree(trx),
  })

  const default_organization = OrganizationWithAddressSchema.parse(
    ctx.state.organization_employment.organization,
  )

  return (
    <Layout
      title='Patient Intake'
      url={ctx.url}
      variant='just logo'
    >
      <Form id='intake' method='POST'>
        <PatientIntakeForm
          patient={patient}
          previously_completed={false}
          default_organization={default_organization}
          country_address_tree={country_address_tree}
          family={{}}
        />
        <hr className='my-2' />

        <ButtonsContainer>
          <Button
            type='submit'
            className='flex-1 max-w-xl'
          >
            Complete Intake
          </Button>
        </ButtonsContainer>
      </Form>
    </Layout>
  )
}

export const handler = {
  async POST(req: Request, ctx: OrganizationContext) {
    const { trx } = ctx.state
    const organization_id = getRequiredUUIDParam(ctx, 'organization_id')

    const { address, family, ...patient_form_values } = await parseRequest(
      trx,
      req,
      IntakeSchema.parse,
    )

    const created_address = await addresses.insert(
      trx,
      address,
    )

    const { id: patient_id } = await patients.insert(trx, {
      ...patient_form_values,
      address_id: created_address.id,
      completed_intake: true,
    })

    await events.insert(trx, {
      type: 'PatientIntake',
      data: { patient_id },
    })

    if (family.next_of_kin) {
      await patient_family.setNextOfKin(
        trx,
        patient_id,
        family.next_of_kin,
      )

      await events.insert(trx, {
        type: 'PatientNextOfKinSet',
        data: { patient_id },
      })
    }

    return redirect(
      `/app/organizations/${organization_id}/waiting_room/add?patient_id=${patient_id}`,
    )
  },
}
