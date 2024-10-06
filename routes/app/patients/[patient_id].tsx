import * as patients from '../../../db/models/patients.ts'
import PatientDetailedCard from '../../../components/patients/DetailedCard.tsx'
import Layout from '../../../components/library/Layout.tsx'
import SectionHeader from '../../../components/library/typography/SectionHeader.tsx'
import { Button } from '../../../components/library/Button.tsx'
import { assertOr404 } from '../../../util/assertOr.ts'
import { LoggedInHealthWorkerContext } from '../../../types.ts'
import { getRequiredUUIDParam } from '../../../util/getParam.ts'
import redirect from '../../../util/redirect.ts'

export default async function PatientPage(
  _req: Request,
  ctx: LoggedInHealthWorkerContext,
) {
  const { healthWorker } = ctx.state
  const patient_id = getRequiredUUIDParam(ctx, 'patient_id')

  const [patient] = await patients.getWithOpenEncounter(ctx.state.trx, {
    ids: [patient_id],
    health_worker_id: healthWorker.id,
  })

  assertOr404(patient, 'Patient not found')

  if (!patient.intake_completed) {
    return redirect(`/app/patients/${patient_id}/intake`)
  }

  return (
    <Layout
      title='Patient Profile'
      route={ctx.route}
      url={ctx.url}
      health_worker={ctx.state.healthWorker}
      variant='practitioner home page'
    >
      <div className='mt-4 divide-y divide-gray-100 text-sm leading-6 lg:col-span-7 xl:col-span-8 row-span-full'>
        {patient.open_encounter && (
          <Button href={`${ctx.url.pathname}/encounters/open/vitals`}>
            Go to open encounter
          </Button>
        )}

        <SectionHeader>
          Demographic Data
        </SectionHeader>
        <PatientDetailedCard patient={patient} />
      </div>
    </Layout>
  )
}
