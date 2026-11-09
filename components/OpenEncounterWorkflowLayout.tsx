import { JSX } from 'preact/compat/jsx-dev-runtime'
import { ComponentChild, ComponentChildren, TargetedSubmitEvent } from 'preact'
import { ButtonsContainer } from '../islands/form/buttons.tsx'
import capitalize from '../util/capitalize.ts'
import { PatientDrawerV4 } from '../islands/Drawer.tsx'
import { Button } from './library/Button.tsx'

import { ArrowRightIcon } from './library/icons/heroicons/solid.tsx'
import HealthWorkerContentsWithSidebarAndDrawer from './library/layout/HealthWorkerContentsWithSidebarAndDrawer.tsx'
import { PatientDrawerV4Props, RenderedEmployee, RenderedEmployeeWithPresenceAndSeniority, RenderedOrganization } from '../types.ts'
import { Workflow } from '../db.d.ts'
import { hyphenate } from '../util/hyphenate.ts'
import cls from '../util/cls.ts'
import { employeeDisplay } from '../util/healthWorkerDisplay.ts'
import { EmergencyCallButton } from '../islands/EmergencyCallButton.tsx'
import { StepsSidebar, WorkflowStepsMobileNav } from './library/sidebar/Steps.tsx'

const MOBILE_EMERGENCY_FORM_ID = 'mobile-start-emergency-escalation'

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
  employee,
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
  employee?: RenderedEmployee
} & PatientDrawerV4Props): JSX.Element {
  const account = employee ? employeeDisplay(employee) : null
  const emergency_action = employee ? `/app/organizations/${employee.organization_id}/patients/start-emergency-escalation` : null
  return (
    <HealthWorkerContentsWithSidebarAndDrawer
      url={url}
      title={capitalize(workflow)}
      mobile_account={account && employee
        ? {
          avatar_url: account.avatar_url,
          display_name: account.display_name,
          description: account.description,
          profile_href: `/app/organizations/${employee.organization_id}/employees/${employee.id}`,
        }
        : undefined}
      mobile_header_action={emergency_action
        ? (
          <form
            id={MOBILE_EMERGENCY_FORM_ID}
            method='POST'
            action={emergency_action}
            className='hidden'
          />
        )
        : undefined}
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
      drawer={workflow !== 'registration'
        ? (
          <PatientDrawerV4
            patient={patient}
            priority={priority}
            priority_evaluation={priority_evaluation}
            organization_id={organization_id}
            current_workflow={workflow}
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
      footer={<div className='max-md:hidden'>TODO</div>}
    >
      {workflow !== 'registration' && (
        <WorkflowStepsMobileNav
          url={url}
          route={route}
          params={params}
          nav_links={nav_links}
          steps_completed={steps_completed}
        />
      )}
      <ContainerTag
        method='POST'
        id={id}
        className={cls(
          'h-full flex flex-col max-md:h-auto max-md:min-h-0 max-md:flex-1',
          // Reserves the collapsed sheet so the workflow actions stay above it.
          workflow !== 'registration' && 'max-md:pb-[calc(4.625rem+env(safe-area-inset-bottom))]',
        )}
      >
        <div className='px-4 flex-1 overflow-y-auto flex flex-col gap-8'>
          {children}
        </div>
        <ButtonsContainer
          className={cls(
            'h-16 mt-auto flex flex-row items-center',
            emergency_action && 'max-md:gap-2! max-md:px-4!',
          )}
        >
          {emergency_action && (
            <div className='md:hidden [&_button]:px-3!'>
              <EmergencyCallButton form={MOBILE_EMERGENCY_FORM_ID} />
            </div>
          )}
          {buttons || (
            <Button
              id={`${hyphenate(workflow)}-submit`}
              type='submit'
              size='xl'
              onSubmit={onSubmit}
              className={cls(
                'primary-form-submit-button',
                emergency_action && 'max-md:px-3!',
              )}
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
    </HealthWorkerContentsWithSidebarAndDrawer>
  )
}
