import { JSX } from 'preact/compat/jsx-dev-runtime'
import { ComponentChild, ComponentChildren, TargetedSubmitEvent } from 'preact'
import { ButtonsContainer } from '../islands/form/buttons.tsx'
import capitalize from '../util/capitalize.ts'
import PatientDrawerV4 from './drawer-v4/DrawerV4.tsx'
import { Button } from './library/Button.tsx'

import { ArrowRightIcon } from './library/icons/heroicons/solid.tsx'
import HealthWorkerContentsWithSidebarAndDrawer from './library/layout/HealthWorkerContentsWithSidebarAndDrawer.tsx'
import { FollowUpGroup, PatientDrawerV4Props, RenderedEmployeeWithPresenceAndSeniority, RenderedOrganization } from '../types.ts'
import { Workflow } from '../db.d.ts'
import { hyphenate } from '../util/hyphenate.ts'
import { StepsSidebar } from './library/sidebar/Steps.tsx'
import FindingRecorder from '../islands/finding/Recorder.tsx'
import FollowUpsPanel from '../islands/FollowUps/Panel.tsx'

export function OpenEncounterWorkflowLayout({
  id,
  url,
  route,
  params,
  next_step_text,
  nav_links,
  buttons,
  children,
  patient,
  priority,
  priority_evaluation,
  organization_id,
  this_visit_findings,
  this_visit_diagnoses,
  steps_completed,
  sidebar_bottom,
  patient_history,
  ContainerTag,
  workflow,
  care_team,
  onSubmit,
  escalation_candidates,
  nearest_hospital,
  refer_route,
  step = null,
  open_encounter_pathname,
  follow_ups = [],
}: {
  id: string
  url: URL
  route?: string | null
  params: Record<string, string>
  workflow: Workflow
  next_step_text?: string
  nav_links: {
    step: string
    route: string
  }[]
  steps_completed: string[]
  sidebar_bottom: ComponentChild
  buttons?: ComponentChild
  children: ComponentChildren
  ContainerTag: 'form' | 'div'
  onSubmit?: (event: TargetedSubmitEvent<HTMLButtonElement>) => void
  escalation_candidates: RenderedEmployeeWithPresenceAndSeniority[]
  nearest_hospital: RenderedOrganization | null
  step?: string | null
  // null (the tutorial, the example pages) records nothing: the finding modal opens but no
  // request is made and there is no follow ups panel
  open_encounter_pathname: string | null
  // The check_for tasks to start the follow ups panel with. See islands/FollowUps/Panel.tsx
  follow_ups?: FollowUpGroup[]
} & Omit<PatientDrawerV4Props, 'current_step'>): JSX.Element {
  const with_drawer = workflow !== 'registration'
  return (
    <HealthWorkerContentsWithSidebarAndDrawer
      url={url}
      title={capitalize(workflow)}
      sidebar={
        <StepsSidebar
          url={url}
          route={route}
          params={params}
          nav_links={nav_links}
          steps_completed={steps_completed}
          bottom={sidebar_bottom}
        />
      }
      side_panels={with_drawer && open_encounter_pathname && (
        <FollowUpsPanel
          initial_groups={follow_ups}
          none_of_the_above_findings_route={`${open_encounter_pathname}/none_of_the_above_findings`}
          form_id={id}
        />
      )}
      drawer={with_drawer
        ? (
          <PatientDrawerV4
            patient={patient}
            priority={priority}
            priority_evaluation={priority_evaluation}
            organization_id={organization_id}
            current_workflow={workflow}
            current_step={step}
            this_visit_findings={this_visit_findings}
            this_visit_diagnoses={this_visit_diagnoses}
            patient_history={patient_history}
            care_team={care_team}
            escalation_candidates={escalation_candidates}
            nearest_hospital={nearest_hospital}
            refer_route={refer_route}
          />
        )
        : undefined}
    >
      <ContainerTag method='POST' className='h-full flex flex-col' id={id}>
        <div className='px-4 flex-1 overflow-y-auto flex flex-col gap-8'>
          {children}
        </div>
        <ButtonsContainer className='h-16 mt-auto flex flex-row items-center'>
          {buttons || (
            <Button
              id={`${hyphenate(workflow)}-submit`}
              type='submit'
              size='xl'
              onSubmit={onSubmit}
              className='primary-form-submit-button'
            >
              {next_step_text || (
                <span className='flex gap-2 items-center'>
                  Next
                  <ArrowRightIcon />
                </span>
              )}
            </Button>
          )}
        </ButtonsContainer>
      </ContainerTag>
      {/* The one finding modal of the page, outside the form. See shared/finding_events.ts */}
      {with_drawer && (
        <FindingRecorder
          routes={open_encounter_pathname
            ? {
              post_route: `${open_encounter_pathname}/clinical_finding`,
              rules_dry_run_route: `${open_encounter_pathname}/rules_dry_run`,
              none_of_the_above_findings_route: `${open_encounter_pathname}/none_of_the_above_findings`,
            }
            : null}
        />
      )}
    </HealthWorkerContentsWithSidebarAndDrawer>
  )
}
