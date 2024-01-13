import { EncounterContext, EncounterLayout } from './_middleware.tsx'
import { LoggedInHealthWorkerHandler } from '../../../../../../types.ts'
import FormButtons from '../../../../../../components/library/form/buttons.tsx'
import * as patient_symptoms from '../../../../../../db/models/patient_symptoms.ts'
import SymptomInput from '../../../../../../islands/symptoms/Input.tsx'

export const handler: LoggedInHealthWorkerHandler<
  unknown,
  EncounterContext['state']
> = {
  POST(_req, _ctx: EncounterContext) {
    throw new Error('Not implemented')
  },
}

export default async function SymptomsPage(
  _req: Request,
  ctx: EncounterContext,
) {
  const symptoms = await patient_symptoms.getEncounter(ctx.state.trx, {
    encounter_id: ctx.state.encounter.encounter_id,
    patient_id: ctx.state.patient.id,
  })

  return (
    <EncounterLayout ctx={ctx}>
      <SymptomInput patient_symptoms={symptoms} />
      <FormButtons />
    </EncounterLayout>
  )
}
