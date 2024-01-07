import { JSX } from 'preact'
import { FreshContext } from '$fresh/server.ts'
import { assert } from 'std/assert/assert.ts'
import { Container } from '../../../../../../components/library/Container.tsx'
import Layout from '../../../../../../components/library/Layout.tsx'
import Form from '../../../../../../components/library/form/Form.tsx'
import {
  LinkDef,
  LoggedInHealthWorkerContext,
  RenderedPatientEncounter,
  RenderedPatientEncounterProvider,
} from '../../../../../../types.ts'
import * as patients from '../../../../../../db/models/patients.ts'
import * as patient_encounters from '../../../../../../db/models/patient_encounters.ts'
import * as waiting_room from '../../../../../../db/models/waiting_room.ts'
import {
  assertOr403,
  assertOr404,
  StatusError,
} from '../../../../../../util/assertOr.ts'
import getNumericParam from '../../../../../../util/getNumericParam.ts'
import { ComponentChildren } from 'https://esm.sh/v128/preact@10.19.2/src/index.js'
import {
  Person,
  PersonData,
} from '../../../../../../components/library/Person.tsx'
import * as SeekingTreatmentIcons from '../../../../../../components/library/icons/SeekingTreatment.tsx'
import * as HeroIcons from '../../../../../../components/library/icons/heroicons/outline.tsx'
import {
  GenericSidebar,
  replaceParams,
} from '../../../../../../components/library/Sidebar.tsx'
import { log } from '../../../../../_middleware.ts'
import LogoutIcon from '../../../../../../components/library/icons/logout.tsx'

function getEncounterId(ctx: FreshContext): 'open' | number {
  if (ctx.params.encounter_id === 'open') {
    return 'open'
  }
  return getNumericParam(ctx, 'encounter_id')
}

export type EncounterContext = LoggedInHealthWorkerContext<
  {
    encounter: RenderedPatientEncounter
    encounter_provider: RenderedPatientEncounterProvider
    patient: patients.PatientCard
  }
>

export async function handler(
  _req: Request,
  ctx: EncounterContext,
) {
  log('encounter handler')

  const encounter_id = getEncounterId(ctx)
  const patient_id = getNumericParam(ctx, 'patient_id')
  const { trx, healthWorker } = ctx.state

  log('encounter handler zz' + encounter_id + ' ' + patient_id)
  const getting_patient_card = await patients.getCard(trx, { id: patient_id })

  log('encounter handler 1.1')
  const encounter = await patient_encounters.get(trx, {
    encounter_id,
    patient_id,
  })

  log('encounter handler 2')

  // TODO: start an encounter if it doesn't exist?
  assertOr404(encounter, 'No open visit with this patient')

  const removing_from_waiting_room = encounter.waiting_room_id && (
    waiting_room.remove(trx, {
      id: encounter.waiting_room_id,
    })
  )

  const matching_provider = encounter.providers.find(
    (provider) => provider.health_worker_id === healthWorker.id,
  )

  if (!matching_provider) {
    log('encounter handler 3')
    const facility_id = encounter.waiting_room_facility_id
    assertOr403(
      facility_id,
      'You do not have access to this patient at this time. The patient is being seen at a facility you do not work at. Please contact the facility to get access to the patient.',
    )
    assert(encounter.waiting_room_id)
    const employment = healthWorker.employment.find(
      (e) => e.facility_id === facility_id,
    )
    assertOr403(
      employment,
      'You do not have access to this patient at this time. The patient is being seen at a facility you do not work at. Please contact the facility to get access to the patient.',
    )
    const provider = employment.roles.doctor || employment.roles.nurse
    if (!provider) {
      assert(employment.roles.admin)
      // TODO: revisit whether this is true
      throw new StatusError(
        'You must be a nurse or doctor to edit patient information as part of an encounter',
        403,
      )
    }

    const added_provider = await patient_encounters.addProvider(trx, {
      encounter_id: encounter.encounter_id,
      provider_id: provider.employment_id,
      seen_now: true,
    })

    assert(added_provider.seen_at)

    ctx.state.encounter_provider = {
      patient_encounter_provider_id: added_provider.id,
      employment_id: provider.employment_id,
      facility_id: employment.facility_id,
      profession: employment.roles.doctor ? 'doctor' : 'nurse',
      health_worker_id: healthWorker.id,
      health_worker_name: healthWorker.name,
      seen_at: added_provider.seen_at,
    }
    encounter.providers.push(ctx.state.encounter_provider)
  } else if (!matching_provider.seen_at) {
    log('encounter handler 4')
    const { seen_at } = await patient_encounters.markProviderSeen(trx, {
      patient_encounter_provider_id:
        matching_provider.patient_encounter_provider_id,
    })
    assert(seen_at)
    matching_provider.seen_at = seen_at
    ctx.state.encounter_provider = matching_provider
  } else {
    ctx.state.encounter_provider = matching_provider
  }

  log('encounter handler 5')
  await removing_from_waiting_room

  ctx.state.encounter = encounter
  ctx.state.patient = await getting_patient_card
  log('encounter handler 6')
  return ctx.next()
}

export const seeking_treatment_nav_links: LinkDef[] = [
  {
    route: '/app/patients/:patient_id/encounters/:encounter_id/vitals',
    title: 'Vitals',
    Icon: SeekingTreatmentIcons.Vitals,
  },
  {
    route: '/app/patients/:patient_id/encounters/:encounter_id/symptoms',
    title: 'Symptoms',
    Icon: SeekingTreatmentIcons.Symptoms,
  },
  {
    route: '/app/patients/:patient_id/encounters/:encounter_id/risk_factors',
    title: 'risk factors',
    Icon: HeroIcons.ExclamationTriangleIcon,
  },
  {
    route: '/app/patients/:patient_id/encounters/:encounter_id/examinations',
    title: 'examinations',
    Icon: SeekingTreatmentIcons.Examinations,
  },
  {
    route:
      '/app/patients/:patient_id/encounters/:encounter_id/diagnostic_tests',
    title: 'diagnostic tests',
    Icon: SeekingTreatmentIcons.DiagnosticTests,
  },
  {
    route: '/app/patients/:patient_id/encounters/:encounter_id/diagnosis',
    title: 'diagnosis',
    Icon: SeekingTreatmentIcons.Diagnosis,
  },
  {
    route: '/app/patients/:patient_id/encounters/:encounter_id/prescriptions',
    title: 'prescriptions',
    Icon: SeekingTreatmentIcons.Prescriptions,
  },
  {
    route: '/app/patients/:patient_id/encounters/:encounter_id/orders',
    title: 'orders',
    Icon: SeekingTreatmentIcons.Orders,
  },
  {
    route: '/app/patients/:patient_id/encounters/:encounter_id/clinical_notes',
    title: 'clinical notes',
    Icon: SeekingTreatmentIcons.ClinicalNotes,
  },
  {
    route: '/app/patients/:patient_id/encounters/:encounter_id/referral',
    title: 'referral',
    Icon: SeekingTreatmentIcons.Referral,
  },
  {
    route: '/app/patients/:patient_id/encounters/:encounter_id/close_visit',
    title: 'close visit',
    Icon: LogoutIcon,
  },
]

export function SeekingTreatmentSidebar(
  { route, params, patient }: {
    route: string
    params: Record<string, string>
    patient: PersonData
  },
) {
  return (
    <GenericSidebar
      route={route}
      params={params}
      navLinks={seeking_treatment_nav_links}
      top={{
        href: replaceParams('/app/patients/:patient_id', params),
        child: <Person person={patient} />,
      }}
    />
  )
}

export function EncounterLayout({
  ctx,
  children,
}: { ctx: EncounterContext; children: ComponentChildren }): JSX.Element {
  return (
    <Layout
      title='Patient Vitals'
      sidebar={
        <SeekingTreatmentSidebar
          route={ctx.route}
          params={ctx.params}
          patient={ctx.state.patient}
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
