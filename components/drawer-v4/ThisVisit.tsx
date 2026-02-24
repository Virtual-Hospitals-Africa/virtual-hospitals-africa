import { hyphenate } from '../../util/hyphenate.ts'
import { RenderedSidebarWorkflow } from '../../types.ts'
import { Header } from './Header.tsx'
import { section_class_name } from './sectionClassName.ts'
import { WorkflowStep } from './WorkflowStep.tsx'
import Menu from '../../islands/Menu.tsx'
import { PlusIcon } from '../library/icons/heroicons/solid.tsx'
import { AddRecordFormModal } from '../../islands/AddRecordFormModal.tsx'

function WorkflowSection(
  { workflow, organization_id }: {
    workflow: RenderedSidebarWorkflow
    organization_id: string
  },
) {
  return (
    <section id={`patient-drawer-workflow-section-${hyphenate(workflow.workflow)}`}>
      {/* <h3 className='capitalize'>{workflow.workflow}</h3> */}
      <div className='flex flex-col gap-2.5'>
        {workflow.steps.map((step) => <WorkflowStep key={step} workflow={workflow.workflow} step={step} organization_id={organization_id} />)}
      </div>
    </section>
  )
}

export function DrawerThisVisit(
  { organization_id, this_visit_findings }: {
    organization_id: string
    this_visit_findings: RenderedSidebarWorkflow[]
  },
) {
  return (
    <div id='patient-drawer-this-visit' className={section_class_name}>
      <AddRecordFormModal />
      <Header className='flex flex-row items-apart'>
        This Visit
        <Menu
          options={[
            {
              label: 'Add symptom',
              href: `#action=add_record&record_type=symptom`,
            },
          ]}
          icon={<PlusIcon className='stroke-indigo-700 fill-indigo-700 cursor-pointer' />}
          button_contents='add record'
          className='absolute shrink-0 top-1 right-1'
          optionsClassName='absolute bottom-2.5 left-2'
        />
      </Header>
      {this_visit_findings.map((workflow) => <WorkflowSection key={workflow.workflow} workflow={workflow} organization_id={organization_id} />)}
    </div>
  )
}
