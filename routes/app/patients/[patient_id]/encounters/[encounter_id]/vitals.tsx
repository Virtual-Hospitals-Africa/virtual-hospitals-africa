import { ComponentChildren, JSX } from 'preact'
import { NumberInput } from '../../../../../../components/library/form/Inputs.tsx'
import { EncounterContext, EncounterLayout, nextLink } from './_middleware.tsx'
import * as patient_measurements from '../../../../../../db/models/patient_measurements.ts'
import * as patient_encounters from '../../../../../../db/models/patient_encounters.ts'
import {
  LoggedInHealthWorkerHandler,
  Measurements,
  MeasurementsUpsert,
} from '../../../../../../types.ts'
import { parseRequestAsserts } from '../../../../../../util/parseForm.ts'
import isObjectLike from '../../../../../../util/isObjectLike.ts'
import { assertOr400 } from '../../../../../../util/assertOr.ts'
import capitalize from '../../../../../../util/capitalize.ts'
import { getRequiredNumericParam } from '../../../../../../util/getNumericParam.ts'
import FormButtons from '../../../../../../components/library/form/buttons.tsx'
import * as VitalsIcons from '../../../../../../components/library/icons/vitals.tsx'
import redirect from '../../../../../../util/redirect.ts'

function assertIsVitals(
  values: unknown,
): asserts values is {
  measurements: MeasurementsUpsert
} {
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
      typeof measurement === 'number',
      `${measurement_name} must be a number`,
    )
  }
}

export const handler: LoggedInHealthWorkerHandler<EncounterContext> = {
  async POST(req, ctx: EncounterContext) {
    const { measurements } = await parseRequestAsserts(
      ctx.state.trx,
      req,
      assertIsVitals,
    )
    const patient_id = getRequiredNumericParam(ctx, 'patient_id')

    const completing_step = patient_encounters.completedStep(ctx.state.trx, {
      encounter_id: ctx.state.encounter.encounter_id,
      step: 'vitals',
    })

    await patient_measurements.upsertVitals(ctx.state.trx, {
      patient_id,
      encounter_id: ctx.state.encounter.encounter_id,
      encounter_provider_id:
        ctx.state.encounter_provider.patient_encounter_provider_id,
      measurements,
    })

    await completing_step

    return redirect(nextLink(ctx))
  },
}

type NormalVitalInput = Exclude<keyof typeof VitalsIcons, 'blood_pressure'>

const required_inputs: NormalVitalInput[] = [
  'height',
  'weight',
  'temperature',
]

const other_inputs: NormalVitalInput[] = [
  'blood_oxygen_saturation',
  'blood_glucose',
  'pulse',
  'respiratory_rate',
]

type VitalInputProps = {
  required?: boolean
  measurement: NormalVitalInput
  vitals?: Partial<Measurements>
}

function VitalInputDefined({ Icon, name, units, required, children }: {
  name: string
  units: string
  required?: boolean
  Icon(props: JSX.SVGAttributes<SVGSVGElement>): JSX.Element
  children: ComponentChildren
}) {
  return (
    <>
      <Icon className='w-6 col-start-1' />
      <span className='col-start-2'>
        {capitalize(name)}
        {required && <sup>*</sup>}
      </span>
      {children}
      <span className='col-start-7'>{units}</span>
    </>
  )
}

function VitalInput({ required, measurement, vitals }: VitalInputProps) {
  return (
    <VitalInputDefined
      required={required}
      name={measurement}
      Icon={VitalsIcons[measurement]}
      units={patient_measurements.MEASUREMENTS[measurement]}
    >
      <NumberInput
        required={required}
        name={`measurements.${measurement}`}
        label={null}
        value={vitals?.[measurement]?.[0]}
        className='col-start-6'
        min={0}
      />
    </VitalInputDefined>
  )
}

export default async function VitalsPage(_req: Request, ctx: EncounterContext) {
  const vitals = await patient_measurements.getEncounterVitals(ctx.state.trx, {
    encounter_id: ctx.state.encounter.encounter_id,
    patient_id: ctx.state.patient.id,
  })

  return (
    <EncounterLayout ctx={ctx}>
      <div className='grid gap-1.5 items-center grid-cols-[24px_max-content_1fr_max-content_min-content_max-content_max-content]'>
        {required_inputs.map((measurement) => (
          <VitalInput
            required
            measurement={measurement}
            vitals={vitals}
          />
        ))}
        {/* Blood pressure is weird because it's two measurements in one */}
        <VitalInputDefined
          required
          name='blood_pressure'
          Icon={VitalsIcons.blood_pressure}
          units='mmHg'
        >
          <NumberInput
            required
            name='measurements.blood_pressure_diastolic'
            label={null}
            value={vitals?.blood_pressure_diastolic?.[0]}
            className='col-start-4'
            min={0}
          />
          <span className='col-start-5'>/</span>
          <NumberInput
            required
            name='measurements.blood_pressure_systolic'
            label={null}
            value={vitals?.blood_pressure_systolic?.[0]}
            className='col-start-6'
            min={0}
          />
        </VitalInputDefined>

        {other_inputs.map((measurement) => (
          <VitalInput
            measurement={measurement}
            vitals={vitals}
          />
        ))}
      </div>
      <FormButtons />
    </EncounterLayout>
  )
}
