// =============================================================================
// FILE: /islands/TriageTutorial.tsx
// Main tutorial orchestrator - coordinates steps, overlay, and sidebar
// =============================================================================

import { effect } from '@preact/signals'
import { memo } from 'preact/compat'
import { useMemo } from 'preact/hooks'
import type { RenderedEmployee, RenderedPatientCompletedRegistration, RenderedSidebarWorkflow } from '../types.ts'
import { OpenEncounterWorkflowLayout } from '../components/OpenEncounterWorkflowLayout.tsx'
import { useLocationHash } from '../util/useLocationHash.ts'
import { employeeDisplay } from '../util/healthWorkerDisplay.ts'
import { WORKFLOW_NAV_LINKS } from '../shared/workflow.ts'

// Tutorial imports
import { TutorialOverlay } from './tutorial/TutorialOverlay.tsx'
import { TUTORIAL_SCRIPT } from '../shared/tutorial/script.ts'
import type { TutorialHashState, TutorialStep } from '../shared/tutorial/types.ts'
import { isTutorialState } from '../shared/tutorial/types.ts'
import { getCompletedSteps, getItem, initialState, parseIndex } from '../shared/tutorial/state.ts'
import { buildSidebarDiagnoses, buildSidebarFindings, EMPTY_PATIENT_HISTORY } from '../shared/tutorial/mock-data.ts'

// Step components
import {
  AdditionalTasksStep,
  AssignPriorityStep,
  BriefHistoryStep,
  CompletionStep,
  RoutePatientStep,
  VitalsStep,
  WaitingRoomStep,
  WarningSignsStep,
} from './tutorial/steps/index.ts'
import { RotateWarning } from '../components/RotateWarning.tsx'
import { HealthWorkerHomePageLayout } from '../components/library/layout/HealthWorkerHomePage.tsx'
import { TUTORIAL_WAITING_ROOM } from '../shared/tutorial/mock-data.ts'
import WaitingRoomView from '../components/waiting_room/View.tsx'
import { EmergencyCallButton } from './EmergencyCallButton.tsx'
import { SidebarHealthWorkerMenu } from './sidebar/HealthWorkerMenu.tsx'

const TUTORIAL_NAV_LINKS = WORKFLOW_NAV_LINKS.triage.map((link) => ({
  ...link,
  route: '#',
}))

type Props = {
  url: URL
  route: string
  employee: RenderedEmployee
  patient: RenderedPatientCompletedRegistration
}

/**
 * Main tutorial component that orchestrates:
 * - Hash-based state management
 * - Step rendering based on current state
 * - Sidebar updates based on progress
 * - Tutorial overlay with script-driven dialogue
 */
export function TriageTutorial({ url, route, patient, employee }: Props) {
  const hash = useLocationHash<TutorialHashState>(isTutorialState)

  effect(() => {
    if (hash.value.action === 'none' && hash.value.loaded) {
      hash.value = initialState()
    }
  })

  const current_step: TutorialStep = useMemo(() => {
    if (hash.value.action === 'none') return 'waiting_room'
    return hash.value.step
  }, [hash.value])

  const sidebar_findings = useMemo<RenderedSidebarWorkflow[]>(() => {
    return buildSidebarFindings(current_step)
  }, [current_step])

  const sidebar_diagnoses = useMemo(() => {
    return buildSidebarDiagnoses(current_step)
  }, [current_step])

  const steps_completed = useMemo(() => {
    return getCompletedSteps(current_step)
  }, [current_step])

  const script_item = useMemo(() => {
    // No hash = tutorial not started
    if (hash.value.action === 'none') return null

    const index = parseIndex(hash.value)
    return getItem(index, TUTORIAL_SCRIPT)
  }, [hash.value])

  const handleSetHashState = (state: TutorialHashState | { action: 'none' }) => {
    hash.value = state
  }

  // Render waiting room view when on that step
  if (current_step === 'waiting_room') {
    return (
      <>
        <RotateWarning />
        <WaitingRoomLayout url={url} route={route} employee={employee} />
        <TutorialOverlay
          script={TUTORIAL_SCRIPT}
          hash_state={hash.value}
          item={script_item}
          setHashState={handleSetHashState}
        />
      </>
    )
  }

  // Render triage workflow for all other steps
  return (
    <>
      <RotateWarning />
      <OpenEncounterWorkflowLayout
        id='triage'
        url={url}
        route={route}
        params={{}}
        nav_links={TUTORIAL_NAV_LINKS}
        patient={patient}
        priority={null}
        organization_id='tutorial-org'
        this_visit_findings={sidebar_findings}
        this_visit_diagnoses={sidebar_diagnoses}
        steps_completed={steps_completed}
        patient_history={EMPTY_PATIENT_HISTORY}
        ContainerTag='div'
        workflow='triage'
        care_team={[]}
        sidebar_bottom={
          <div className='space-y-3'>
            <EmergencyCallButton href='#emergency' />
            <SidebarHealthWorkerMenu {...employeeDisplay(employee)} />
          </div>
        }
        // next_step_text='Next'
        // buttons={<TutorialModeButton />}
        onSubmit={(e) => e.preventDefault()}
      >
        <StepRenderer
          step={current_step}
          patient={patient}
        />
      </OpenEncounterWorkflowLayout>

      <TutorialOverlay
        script={TUTORIAL_SCRIPT}
        hash_state={hash.value}
        item={script_item}
        setHashState={handleSetHashState}
      />
    </>
  )
}

/**
 * Renders the appropriate step component based on current step.
 * Note: waiting_room step is handled separately with its own layout.
 * Memoized so step components aren't re-rendered when only hash index changes.
 */
const StepRenderer = memo(function StepRenderer({
  step,
  patient,
}: {
  step: TutorialStep
  patient: RenderedPatientCompletedRegistration
}) {
  switch (step) {
    case 'waiting_room':
      // This case is handled by conditional rendering in the main component
      return <WaitingRoomStep />

    case 'warning_signs':
      return <WarningSignsStep />

    case 'brief_history':
      return <BriefHistoryStep sex={patient.sex} />

    case 'measure_vitals':
      return <VitalsStep />

    case 'additional_tasks_and_investigations':
      return <AdditionalTasksStep />

    case 'assign_priority':
      return <AssignPriorityStep />

    case 'route_patient':
      return <RoutePatientStep />

    case 'complete':
      return <CompletionStep />
  }
})

/**
 * Layout for the waiting room step - shows the Open Encounters view.
 */
function WaitingRoomLayout({ url, route, employee }: { url: URL; route: string; employee: RenderedEmployee }) {
  return (
    <HealthWorkerHomePageLayout
      title='Open Encounters'
      url={url}
      route={route}
      params={{}}
      employee={employee}
      tutorial
    >
      <div data-tutorial='waiting-room-table'>
        <WaitingRoomView
          waiting_room={TUTORIAL_WAITING_ROOM}
          organization_id='tutorial-org'
          can_register_patients={false}
        />
      </div>
    </HealthWorkerHomePageLayout>
  )
}
