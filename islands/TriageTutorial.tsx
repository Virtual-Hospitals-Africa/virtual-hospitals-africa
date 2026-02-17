// =============================================================================
// FILE: /islands/TriageTutorial.tsx
// Main tutorial orchestrator - coordinates steps, overlay, and sidebar
// =============================================================================

import { effect } from '@preact/signals'
import { useMemo } from 'preact/hooks'
import type { RenderedEmployee, RenderedPatient, RenderedSidebarWorkflow } from '../types.ts'
import { OpenEncounterWorkflowLayout } from '../components/OpenEncounterWorkflowLayout.tsx'
import { useLocationHash } from '../util/useLocationHash.ts'
import { HealthWorker } from '../components/library/HealthWorker.tsx'
import { employeeDisplay } from '../util/healthWorkerDisplay.ts'
import { EmergencyCallButton } from '../components/library/EmergencyCallButton.tsx'
import { WORKFLOW_NAV_LINKS } from '../shared/workflow.ts'

// Tutorial imports
import { TutorialOverlay } from './tutorial/TutorialOverlay.tsx'
import { TUTORIAL_SCRIPT } from '../shared/tutorial/script.ts'
import type { TutorialHashState, TutorialStep } from '../shared/tutorial/types.ts'
import { isTutorialState } from '../shared/tutorial/types.ts'
import { getCompletedSteps, hasCoughBeenSelected, initialState } from '../shared/tutorial/state.ts'
import { buildSidebarFindings, EMPTY_PATIENT_HISTORY } from '../shared/tutorial/mock-data.ts'
import { TUTORIAL_TARGETS } from '../shared/tutorial/targets.ts'

// Step components
import {
  AdditionalTasksStep,
  AssignPriorityStep,
  BriefHistoryStep,
  CompletionStep,
  RoutePatientStep,
  VitalsStep,
  WarningSignsStep,
} from './tutorial/steps/index.ts'

const TUTORIAL_NAV_LINKS = WORKFLOW_NAV_LINKS.triage.map((link) => ({
  ...link,
  route: '#',
}))

type Props = {
  url: URL
  route: string
  patient: RenderedPatient
  employee: RenderedEmployee
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
    if (hash.value.action === 'none') {
      hash.value = initialState()
    }
  })

  const current_step: TutorialStep = useMemo(() => {
    if (hash.value.action === 'none') return 'warning_signs'
    return hash.value.step
  }, [hash.value])

  const cough_selected = useMemo(() => {
    return hasCoughBeenSelected(hash.value, TUTORIAL_SCRIPT, TUTORIAL_TARGETS.COUGH_CHECKBOX)
  }, [hash.value])

  const sidebar_findings = useMemo<RenderedSidebarWorkflow[]>(() => {
    return buildSidebarFindings(current_step, cough_selected)
  }, [current_step, cough_selected])

  const steps_completed = useMemo(() => {
    return getCompletedSteps(current_step)
  }, [current_step])

  const handleSetHashState = (state: TutorialHashState | { action: 'none' }) => {
    hash.value = state
  }

  return (
    <>
      <OpenEncounterWorkflowLayout
        id='triage'
        url={url}
        route={route}
        params={{}}
        next_step_text='Tutorial Mode'
        nav_links={TUTORIAL_NAV_LINKS}
        patient={patient}
        priority={null}
        organization_id='tutorial-org'
        this_visit_findings={sidebar_findings}
        steps_completed={steps_completed}
        patient_history={EMPTY_PATIENT_HISTORY}
        ContainerTag='div'
        workflow='triage'
        care_team={[]}
        sidebar_bottom={
          <div className='space-y-3'>
            <EmergencyCallButton href='#emergency' />
            <HealthWorker {...employeeDisplay(employee)} />
          </div>
        }
        buttons={<TutorialModeButton />}
        onSubmit={(e) => e.preventDefault()}
      >
        <StepRenderer
          step={current_step}
          patient={patient}
        />
      </OpenEncounterWorkflowLayout>

      <TutorialOverlay
        script={TUTORIAL_SCRIPT}
        hashState={hash.value}
        setHashState={handleSetHashState}
      />
    </>
  )
}

/**
 * Renders the appropriate step component based on current step.
 */
function StepRenderer({
  step,
  patient,
}: {
  step: TutorialStep
  patient: RenderedPatient
}) {
  switch (step) {
    case 'warning_signs':
      return <WarningSignsStep />

    case 'brief_history':
      return <BriefHistoryStep sex={patient.sex!} />

    case 'vitals':
      return <VitalsStep />

    case 'additional_tasks':
      return <AdditionalTasksStep />

    case 'assign_priority':
      return <AssignPriorityStep />

    case 'route_patient':
      return <RoutePatientStep />

    case 'complete':
      return <CompletionStep />
  }
}

/**
 * Button shown in the footer during tutorial mode.
 */
function TutorialModeButton() {
  return (
    <div className='flex items-center gap-3 text-sm text-gray-500'>
      <span
        className='px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full font-medium'
        style={{ fontFamily: "'GeistPixel', monospace" }}
      >
        Tutorial Mode
      </span>
      <span>Follow the prompts to continue</span>
    </div>
  )
}
