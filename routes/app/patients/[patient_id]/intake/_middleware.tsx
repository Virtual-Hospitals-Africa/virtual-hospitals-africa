import { JSX } from 'preact'
import { Container } from '../../../../../components/library/Container.tsx'
import Layout from '../../../../../components/library/Layout.tsx'
import Form from '../../../../../components/library/form/Form.tsx'
import {
  LinkDef,
  LoggedInHealthWorkerContext,
  OnboardingPatient,
} from '../../../../../types.ts'
import * as patients from '../../../../../db/models/patients.ts'
import { assertOr404 } from '../../../../../util/assertOr.ts'
import { getRequiredNumericParam } from '../../../../../util/getNumericParam.ts'
import { ComponentChildren } from 'https://esm.sh/v128/preact@10.19.2/src/index.js'
import {
  DefaultTop,
  GenericSidebar,
} from '../../../../../components/library/Sidebar.tsx'
import { removeFromWaitingRoomAndAddSelfAsProvider } from '../encounters/[encounter_id]/_middleware.tsx'

export type IntakeContext = LoggedInHealthWorkerContext<{
  patient: OnboardingPatient
}>

export async function handler(
  _req: Request,
  ctx: IntakeContext,
) {
  const patient_id = getRequiredNumericParam(ctx, 'patient_id')

  const getting_onboarding_patient = patients.getOnboarding(ctx.state.trx, {
    id: patient_id,
  })

  // TODO: use the encounter as part of intake?
  await removeFromWaitingRoomAndAddSelfAsProvider(ctx, 'open')

  const patient = await getting_onboarding_patient
  assertOr404(patient, 'Patient not found')

  ctx.state.patient = patient
  return ctx.next()
}

export const intake_nav_links: LinkDef[] = [
  { route: '/app/patients/:patient_id/intake/personal' },
  { route: '/app/patients/:patient_id/intake/address' },
  { route: '/app/patients/:patient_id/intake/pre-existing_conditions' },
  { route: '/app/patients/:patient_id/intake/history' },
  { route: '/app/patients/:patient_id/intake/occupation' },
  { route: '/app/patients/:patient_id/intake/family' },
  { route: '/app/patients/:patient_id/intake/lifestyle' },
  { route: '/app/patients/:patient_id/intake/review' },
]

export function IntakeSidebar(
  { route, params }: {
    route: string
    params: Record<string, string>
  },
) {
  return (
    <GenericSidebar
      route={route}
      params={params}
      navLinks={intake_nav_links}
      top={DefaultTop}
    />
  )
}

export function IntakeLayout({
  ctx,
  children,
}: { ctx: IntakeContext; children: ComponentChildren }): JSX.Element {
  return (
    <Layout
      title='Patient Intake'
      sidebar={
        <IntakeSidebar
          route={ctx.route}
          params={ctx.params}
        />
      }
      url={ctx.url}
      variant='form'
    >
      <Container size='lg'>
        <Form method='POST'>
          {children}
        </Form>
      </Container>
    </Layout>
  )
}
