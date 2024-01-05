import { Container } from '../../../../../../components/library/Container.tsx'
import Layout from '../../../../../../components/library/Layout.tsx'
import { NumberInput } from '../../../../../../components/library/form/Inputs.tsx'
import { EncounterContext } from './_middleware.tsx'
import * as patient_measurements from '../../../../../../db/models/patient_measurements.ts'
import {
  LoggedInHealthWorkerHandler,
  Measurements,
  RenderedPatientEncounter,
  RenderedPatientEncounterProvider,
} from '../../../../../../types.ts'
import { parseRequestAsserts } from '../../../../../../util/parseForm.ts'
import isObjectLike from '../../../../../../util/isObjectLike.ts'
import { assertOr400 } from '../../../../../../util/assertOr.ts'
import capitalize from '../../../../../../util/capitalize.ts'
import getNumericParam from '../../../../../../util/getNumericParam.ts'
import FormButtons from '../../../../../../components/library/form/buttons.tsx'
import Form from '../../../../../../components/library/form/Form.tsx'
import {
  HomePageSidebar,
  SeekingTreatmentSidebar,
} from '../../../../../../components/library/Sidebar.tsx'

function assertIsVitals(
  values: unknown,
): asserts values is { measurements: Partial<Measurements> } {
  assertOr400(isObjectLike(values), 'Invalid form values')
  assertOr400(isObjectLike(values.measurements), 'Invalid form values')
  for (
    const [measurement_name, measurement] of Object.entries(values.measurements)
  ) {
    assertOr400(
      // deno-lint-ignore no-explicit-any
      (patient_measurements.MEASUREMENTS as any)[measurement_name],
      `${measurement_name} is not a valid measurement`,
    )
    assertOr400(
      Array.isArray(measurement),
      `${measurement_name} must be an array of [number, string]`,
    )
    assertOr400(
      typeof measurement[0] === 'number',
      `${measurement_name} must be an array of [number, string]`,
    )
    assertOr400(
      typeof measurement[1] === 'string',
      `${measurement_name} must be an array of [number, string]`,
    )
  }
}

export const handler: LoggedInHealthWorkerHandler<unknown, {
  encounter: RenderedPatientEncounter
  encounter_provider: RenderedPatientEncounterProvider
}> = {
  async POST(req, ctx: EncounterContext) {
    const { measurements } = await parseRequestAsserts(
      ctx.state.trx,
      req,
      assertIsVitals,
    )
    const patient_id = getNumericParam(ctx, 'patient_id')

    await patient_measurements.add(ctx.state.trx, {
      patient_id,
      encounter_id: ctx.state.encounter.encounter_id,
      encounter_provider_id:
        ctx.state.encounter_provider.patient_encounter_provider_id,
      measurements,
    })

    return new Response('OK')
  },
}

export default function VitalsPage(ctx: EncounterContext) {
  return (
    <Layout
      title='Patient Vitals'
      sidebar={
        <SeekingTreatmentSidebar route={ctx.route} params={ctx.params} />
      }
      url={ctx.url}
      variant='form'
    >
      <Container size='lg'>
        <Form method='POST'>
          {Object.entries(patient_measurements.MEASUREMENTS).map(
            ([measurement_name, units]) => (
              <>
                <NumberInput
                  name={`measurements.${measurement_name}.0`}
                  label={capitalize(measurement_name) + ` (${units})`}
                />
                <input
                  type='hidden'
                  name={`measurements.${measurement_name}.1`}
                  value={units}
                />
              </>
            ),
          )}
          <FormButtons />
        </Form>
      </Container>
    </Layout>
  )
}
