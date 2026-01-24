import { JSX } from 'preact/compat/jsx-dev-runtime'
import { ComponentChild, ComponentChildren, TargetedSubmitEvent } from 'preact'
import { ButtonsContainer } from '../islands/form/buttons.tsx'
import capitalize from '../util/capitalize.ts'
import PatientDrawerV4 from './drawer-v4/DrawerV4.tsx'
import { Button } from './library/Button.tsx'

import { ArrowRightIcon } from './library/icons/heroicons/solid.tsx'
import HealthWorkerContentsWithSidebarAndDrawer from './library/layout/HealthWorkerContentsWithSidebarAndDrawer.tsx'
import { StepsSidebar } from './library/Sidebar.tsx'
import { PatientDrawerV4Props } from '../types.ts'
import { Workflow } from '../db.d.ts'

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
  organization_id,
  this_visit_findings,
  steps_completed,
  sidebar_bottom,
  patient_history,
  ContainerTag,
  workflow,
  care_team,
  onSubmit,
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
} & PatientDrawerV4Props): JSX.Element {
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
      drawer={workflow !== 'registration'
        ? (
          <PatientDrawerV4
            patient={patient}
            priority={priority}
            organization_id={organization_id}
            this_visit_findings={this_visit_findings}
            patient_history={patient_history}
            care_team={care_team}
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
              type='submit'
              size='xl'
              onSubmit={onSubmit}
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
