import z from 'zod'
import { completeAndProceedToNextStep, OpenEncounterWorkflowContext, OpenEncounterWorkflowPage } from '../_middleware.tsx'
import { patients } from '../../../../../../../../db/models/patients.ts'
import { postHandler } from '../../../../../../../../backend/postHandler.ts'
import { promiseProps } from '../../../../../../../../util/promiseProps.ts'
import PersonalSection from '../../../../../../../../islands/patient-registration/PersonalSection.tsx'
import { SERVER_COUNTRY } from '../../../../../../../../db/models/countries.ts'
import { PatientRegistrationPersonalSchema } from '../registration/personal.tsx'
import { AddPatientSearch } from '../../../../../../../../islands/waiting_room/AddPatientSearch.tsx'
import FormSection from '../../../../../../../../components/library/FormSection.tsx'
import { RadioButtonGroup } from '../../../../../../../../components/library/RadioButtonGroup.tsx'
import { ModeOfArrivalFormSection } from '../../../../../../../../islands/ModeOfArrivalFormSection.tsx'
import { positive_integer, sex, varchar255 } from '../../../../../../../../util/validators.ts'
import { Separator } from '../../../../../../../../components/Separator.tsx'
import AsyncSearch from '../../../../../../../../islands/AsyncSearch.tsx'

const ModeOfArrivalSchema = {
  mode_of_arrival: z.enum(['en_route', 'just_arrived']),
  eta_minutes: positive_integer.optional().default(0),
}

const ReturningPatientSchema = z.object({
  patient: z.object({
    id: z.string().uuid(),
  }),
}).extend(ModeOfArrivalSchema)

const NewPatientSchema = z.object({
  first_names: varchar255,
  surname: varchar255,
  preferred_name: varchar255,
  date_of_birth: z.string().date(),
  sex,
  gender: varchar255,
}).extend(ModeOfArrivalSchema)

export const handler = postHandler(
  ReturningPatientSchema.or(NewPatientSchema),
  async (ctx: OpenEncounterWorkflowContext, form_values) => {
    console.log({ form_values })
    throw new Error('x')
    // const { response } = await promiseProps({
    //   upserting_patient: patients.upsert(ctx.state.trx, {
    //     id: ctx.state.patient.id,
    //     ...form_values,
    //   }),
    //   response: completeAndProceedToNextStep(ctx),
    // })
    // return response
  },
)

// deno-lint-ignore require-await
export async function EmergencyEscalationIdentifyPatientPage(
  ctx: OpenEncounterWorkflowContext,
) {
  return (
    <>
      <FormSection header='Returning patient'>
        <AsyncSearch
          name='patient'
          search_route='/app/patients'
          label=''
          skip_blank_search
          placeholder='Search existing patients'
        />
      </FormSection>
      <Separator text='OR' />
      <PersonalSection
        header='New patient'
        patient={ctx.state.patient}
        organization_default_language_code={ctx.state.organization
          .most_common_language_code}
        server_country={SERVER_COUNTRY}
        previously_completed_step={ctx.state.previously_completed_step}
        include_language_and_national_id_inputs={false}
      />
      <Separator />
      <ModeOfArrivalFormSection organization_category={ctx.state.organization.category} />
    </>
  )
}

export default OpenEncounterWorkflowPage(EmergencyEscalationIdentifyPatientPage)
