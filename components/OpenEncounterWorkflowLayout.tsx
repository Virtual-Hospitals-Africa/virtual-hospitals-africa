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
import { PhoneIcon } from './library/icons/heroicons/outline.tsx'

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
  const triage_mobile = workflow === 'triage'
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
          <>
            <form
              id={MOBILE_EMERGENCY_FORM_ID}
              method='POST'
              action={emergency_action}
              className='hidden'
            />
            {triage_mobile && (
              <button
                type='submit'
                form={MOBILE_EMERGENCY_FORM_ID}
                aria-label='Emergency'
                className='flex size-9 items-center justify-center text-green-600'
              >
                <PhoneIcon className='size-6' />
              </button>
            )}
          </>
        )
        : undefined}
      compact_mobile={triage_mobile}
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
          compact={triage_mobile}
        />
      )}
      <ContainerTag
        method='POST'
        id={id}
        className={cls(
          'h-full flex flex-col max-md:h-auto max-md:min-h-0 max-md:flex-1',
          triage_mobile && 'max-md:bg-white',
          // Reserves the collapsed sheet so the workflow actions stay above it.
          workflow !== 'registration' && 'max-md:pb-[calc(4.625rem+env(safe-area-inset-bottom))]',
        )}
      >
        <div
          className={cls(
            'px-4 flex-1 overflow-y-auto flex flex-col gap-8',
            triage_mobile && 'max-md:min-w-0 max-md:bg-white max-md:px-2! max-md:pt-4 max-md:pb-2',
          )}
        >
          {children}
        </div>
        <ButtonsContainer
          className={cls(
            'h-16 mt-auto flex flex-row items-center',
            emergency_action && !triage_mobile && 'max-md:gap-2! max-md:px-4!',
            triage_mobile && 'max-md:h-auto! max-md:border-0! max-md:bg-transparent! max-md:px-2 max-md:pt-0 max-md:pb-2',
          )}
        >
          {emergency_action && !triage_mobile && (
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
                emergency_action && !triage_mobile && 'max-md:px-3!',
                triage_mobile &&
                  'max-md:h-9! max-md:w-full max-md:rounded-md! max-md:bg-indigo-700! max-md:px-4 max-md:text-[14px]! max-md:font-medium max-md:leading-5!',
              )}
            >
              {next_step_text || (triage_mobile
                ? (
                  <>
                    <span className='max-md:hidden flex gap-2 items-center'>
                      Next
                      <ArrowRightIcon />
                    </span>
                    <span className='md:hidden'>Next →</span>
                  </>
                )
                : (
                  <span className='flex gap-2 items-center'>
                    Next
                    <ArrowRightIcon />
                  </span>
                ))}
            </Button>
          )}
        </ButtonsContainer>
      </ContainerTag>
    </HealthWorkerContentsWithSidebarAndDrawer>
  )
}
