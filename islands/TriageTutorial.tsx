import { effect, useSignal } from '@preact/signals'
import WarningSigns from './WarningSigns.tsx'
import { RenderedEmployee, RenderedPatient, RenderedSidebarWorkflow, WarningSign } from '../types.ts'
import { OpenEncounterWorkflowLayout } from '../components/OpenEncounterWorkflowLayout.tsx'
import { useLocationHash } from '../util/useLocationHash.ts'
import { HealthWorker } from '../components/library/HealthWorker.tsx'
import { employeeDisplay } from '../util/healthWorkerDisplay.ts'
import { EmergencyCallButton } from '../components/library/EmergencyCallButton.tsx'
import { WORKFLOW_NAV_LINKS } from '../shared/workflow.ts'

type TutorialProgress =
  | { action: 'warning_signs' }
  | { action: 'brief_history' }
  | { action: 'none' }

type Patient = RenderedPatient

function isState(params: Record<string, string>): params is TutorialProgress {
  console.log({ params })
  return true
}

export function TriageTutorial(
  { url, route, patient, employee, warning_signs }: { url: URL; route: string; patient: Patient; employee: RenderedEmployee; warning_signs: WarningSign[] },
) {
  const this_visit_findings = useSignal<RenderedSidebarWorkflow[]>([])
  const location_hash = useLocationHash<TutorialProgress>(isState)

  effect(() => {
    if (location_hash.value.action === 'none') {
      location_hash.value = { action: 'warning_signs' }
    }
  })

  return (
    <OpenEncounterWorkflowLayout
      id='triage'
      url={url}
      route={route}
      params={{}}
      next_step_text='Next'
      nav_links={WORKFLOW_NAV_LINKS.triage.map((link) => ({
        ...link,
        route: link.route.replace('/app/organizations/:organization_id/patients/:patient_id/open_encounter/triage', '#action='),
      }))}
      patient={patient}
      priority={null}
      organization_id='foo'
      this_visit_findings={this_visit_findings.value}
      steps_completed={[]}
      patient_history={{
        pre_existing_conditions: [],
        allergies: [],
        family_history: [],
        major_surgeries: [],
        medications: [],
        lifestyle: [],
      }}
      ContainerTag='div'
      workflow='triage'
      // todo, add
      care_team={[]}
      sidebar_bottom={
        <div className='space-y-3'>
          <EmergencyCallButton href='#emergency' />

          <HealthWorker
            {...employeeDisplay(employee)}
          />
        </div>
      }
      onSubmit={(event) => {
        console.log('x', { event })
        location_hash.value = { action: 'warning_signs' }
      }}
    >
      {['warning_signs', 'none'].includes(location_hash.value.action) && (
        <WarningSigns
          search_route='foo'
          warning_signs={warning_signs}
        />
      )}
    </OpenEncounterWorkflowLayout>
  )
}
