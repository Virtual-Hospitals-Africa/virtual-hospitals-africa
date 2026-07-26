import { effect } from '@preact/signals'
import { memo } from 'preact/compat'
import { useMemo } from 'preact/hooks'
import type { RenderedEmployee, RenderedPatientCompletedRegistration, RenderedSidebarWorkflow } from '../types.ts'
import { OpenEncounterWorkflowLayout } from '../components/OpenEncounterWorkflowLayout.tsx'
import { useLocationHash } from '../util/useLocationHash.ts'
import { employeeDisplay } from '../util/healthWorkerDisplay.ts'
import { WORKFLOW_NAV_LINKS } from '../shared/workflow.ts'

import { TutorialOverlay } from './tutorial/TutorialOverlay.tsx'
import type { TutorialHashState } from '../shared/tutorial/types.ts'
import { getItem, parseIndex } from '../shared/tutorial/state.ts'

import type { ConsultationTutorialStep } from '../shared/consultation-tutorial/types.ts'
import { CONSULTATION_SPEAKERS, isConsultationTutorialState } from '../shared/consultation-tutorial/types.ts'
import { advance, getCompletedSteps, initialState } from '../shared/consultation-tutorial/state.ts'
import {
  buildSidebarDiagnoses,
  buildSidebarFindings,
  CONSULTATION_CARE_TEAM,
  CONSULTATION_PATIENT_HISTORY,
  CONSULTATION_WAITING_ROOM,
  EMPTY_CONSULTATION_HISTORY,
} from '../shared/consultation-tutorial/mock-data.ts'
import { CONSULTATION_SCRIPT } from '../shared/consultation-tutorial/script.ts'

import {
  BillingStep,
  CompletionStep,
  DiagnosesStep,
  DiagnosticTestsStep,
  ExaminationsStep,
  OverviewStep,
  ReferralStep,
  RegistrationStep,
  TriageAssignPriorityStep,
  TriageWarningSignsStep,
} from './consultation-tutorial/steps/index.ts'
import { RotateWarning } from '../components/RotateWarning.tsx'
import { HealthWorkerHomePageLayout } from '../components/library/layout/HealthWorkerHomePage.tsx'
import WaitingRoomView from '../components/waiting_room/View.tsx'
import { EmergencyCallButton } from './EmergencyCallButton.tsx'
import { SidebarHealthWorkerMenu } from './sidebar/HealthWorkerMenu.tsx'

const CONSULTATION_NAV_LINKS = WORKFLOW_NAV_LINKS.consultation.map((link) => ({
  ...link,
  route: '#',
}))

const REGISTRATION_NAV_LINKS = WORKFLOW_NAV_LINKS.registration.map((link) => ({
  ...link,
  route: '#',
}))

const TRIAGE_NAV_LINKS = WORKFLOW_NAV_LINKS.triage.map((link) => ({
  ...link,
  route: '#',
}))

// Steps that use the consultation OpenEncounterWorkflowLayout
const CONSULTATION_ENCOUNTER_STEPS: ConsultationTutorialStep[] = [
  'examinations',
  'diagnostic_tests',
  'diagnoses',
  'referral',
  'billing',
  'complete',
]

type Props = {
  url: URL
  route: string
  employee: RenderedEmployee
  patient: RenderedPatientCompletedRegistration
}

export function ConsultationTutorial({ url, route, patient, employee }: Props) {
  const hash = useLocationHash<TutorialHashState>(isConsultationTutorialState)

  effect(() => {
    if (hash.value.action === 'none' && hash.value.loaded) {
      hash.value = initialState()
    }
  })

  const current_step = useMemo((): ConsultationTutorialStep => {
    if (hash.value.action === 'none') return 'overview'
    return hash.value.step as ConsultationTutorialStep
  }, [hash.value])

  const sidebar_findings = useMemo<RenderedSidebarWorkflow[]>(() => {
    return buildSidebarFindings(current_step)
  }, [current_step])

  const sidebar_diagnoses = useMemo(() => {
    return buildSidebarDiagnoses(current_step)
  }, [current_step])

  const steps_completed = useMemo(() => {
    const tutorial_completed = getCompletedSteps(current_step)
    const completed: string[] = []
    if (CONSULTATION_ENCOUNTER_STEPS.includes(current_step)) {
      // Chief complaint, vitals, symptoms, history always completed (from triage)
      completed.push('chief_complaint', 'vitals', 'symptoms', 'history')
    }
    if (tutorial_completed.includes('examinations')) completed.push('examinations')
    if (tutorial_completed.includes('diagnostic_tests')) completed.push('diagnostic_tests')
    if (tutorial_completed.includes('diagnoses')) completed.push('diagnoses')
    return completed
  }, [current_step])

  const registration_steps_completed = useMemo(() => {
    // In the tutorial, personal and this_visit are already done
    return ['personal', 'this_visit']
  }, [])

  const script_item = useMemo(() => {
    if (hash.value.action === 'none') return null
    const index = parseIndex(hash.value)
    return getItem(index, CONSULTATION_SCRIPT)
  }, [hash.value])

  const handle_set_hash_state = (state: TutorialHashState | { action: 'none' }) => {
    hash.value = state
  }

  const sidebar_bottom = (
    <div className='space-y-3'>
      <EmergencyCallButton href='#emergency' />
      <SidebarHealthWorkerMenu {...employeeDisplay(employee)} />
    </div>
  )

  const overlay = (
    <TutorialOverlay
      script={CONSULTATION_SCRIPT}
      hash_state={hash.value}
      item={script_item}
      setHashState={handle_set_hash_state}
      advance={advance}
      speakers={CONSULTATION_SPEAKERS}
    />
  )

  // Overview: waiting room layout
  if (current_step === 'overview') {
    return (
      <>
        <RotateWarning />
        <WaitingRoomLayout url={url} route={route} employee={employee} />
        {overlay}
      </>
    )
  }

  // Registration: uses registration workflow layout with registration sidebar
  if (current_step === 'registration') {
    return (
      <>
        <RotateWarning />
        <OpenEncounterWorkflowLayout
          id='registration-tutorial'
          url={url}
          route={route}
          params={{}}
          nav_links={REGISTRATION_NAV_LINKS}
          patient={patient}
          priority={null}
          priority_evaluation={null}
          organization_id='consult-tutorial-org-001'
          this_visit_findings={[]}
          this_visit_diagnoses={[]}
          steps_completed={registration_steps_completed}
          patient_history={EMPTY_CONSULTATION_HISTORY}
          ContainerTag='div'
          workflow='registration'
          care_team={[]}
          sidebar_bottom={sidebar_bottom}
          onSubmit={(e) => e.preventDefault()}
        >
          <StepRenderer step={current_step} />
        </OpenEncounterWorkflowLayout>
        {overlay}
      </>
    )
  }

  // Triage steps: triage workflow layout
  if (current_step === 'triage_warning_signs' || current_step === 'triage_assign_priority') {
    const triage_steps_completed = current_step === 'triage_assign_priority'
      ? ['warning_signs', 'brief_history', 'height_and_weight', 'measure_vitals', 'additional_tasks_and_investigations']
      : ['warning_signs']

    return (
      <>
        <RotateWarning />
        <OpenEncounterWorkflowLayout
          id='triage-tutorial'
          url={url}
          route={route}
          params={{}}
          nav_links={TRIAGE_NAV_LINKS}
          patient={patient}
          priority={current_step === 'triage_assign_priority'
            ? {
              name: 'Non-urgent',
              value_snomed_concept_id: '394848005',
              target_treatment_time: null,
              records: [],
              created_at: '',
              based_on_system_priority_evaluation_description: null,
            }
            : null}
          priority_evaluation={null}
          organization_id='consult-tutorial-org-001'
          this_visit_findings={[]}
          this_visit_diagnoses={[]}
          steps_completed={triage_steps_completed}
          patient_history={EMPTY_CONSULTATION_HISTORY}
          ContainerTag='div'
          workflow='triage'
          care_team={[]}
          sidebar_bottom={sidebar_bottom}
          onSubmit={(e) => e.preventDefault()}
        >
          <StepRenderer step={current_step} />
        </OpenEncounterWorkflowLayout>
        {overlay}
      </>
    )
  }

  // Consultation steps: full encounter layout with drawer
  const patient_history = CONSULTATION_ENCOUNTER_STEPS.includes(current_step) ? CONSULTATION_PATIENT_HISTORY : EMPTY_CONSULTATION_HISTORY

  return (
    <>
      <RotateWarning />
      <OpenEncounterWorkflowLayout
        id='consultation-tutorial'
        url={url}
        route={route}
        params={{}}
        nav_links={CONSULTATION_NAV_LINKS}
        patient={patient}
        priority={{
          name: 'Non-urgent',
          value_snomed_concept_id: '17621005',
          target_treatment_time: null,
          records: [],
          created_at: '',
          based_on_system_priority_evaluation_description: null,
        }}
        priority_evaluation={null}
        organization_id='consult-tutorial-org-001'
        this_visit_findings={sidebar_findings}
        this_visit_diagnoses={sidebar_diagnoses}
        steps_completed={steps_completed}
        patient_history={patient_history}
        ContainerTag='div'
        workflow='consultation'
        care_team={CONSULTATION_CARE_TEAM}
        sidebar_bottom={sidebar_bottom}
        onSubmit={(e) => e.preventDefault()}
      >
        <StepRenderer step={current_step} />
      </OpenEncounterWorkflowLayout>
      {overlay}
    </>
  )
}

const StepRenderer = memo(function StepRenderer({ step }: { step: ConsultationTutorialStep }) {
  switch (step) {
    case 'overview':
      return <OverviewStep />
    case 'registration':
      return <RegistrationStep />
    case 'triage_warning_signs':
      return <TriageWarningSignsStep />
    case 'triage_assign_priority':
      return <TriageAssignPriorityStep />
    case 'examinations':
      return <ExaminationsStep />
    case 'diagnostic_tests':
      return <DiagnosticTestsStep />
    case 'diagnoses':
      return <DiagnosesStep />
    case 'referral':
      return <ReferralStep />
    case 'billing':
      return <BillingStep />
    case 'complete':
      return <CompletionStep />
  }
})

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
      <div data-tutorial='consultation-waiting-room-table'>
        <WaitingRoomView
          waiting_room={CONSULTATION_WAITING_ROOM}
          organization_id='consult-tutorial-org-001'
          can_register_patients={false}
        />
      </div>
    </HealthWorkerHomePageLayout>
  )
}
